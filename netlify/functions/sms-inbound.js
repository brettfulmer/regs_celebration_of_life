const twilio = require('twilio');
const { getSupabaseAdmin } = require('./lib/supabaseAdmin');

const SYSTEM_PROMPT = `You are the "Reg's Celebration of Life" assistant.

Your job:
- Help visitors understand the Celebration of Life details for Robert "Reg" Fulmer.
- Keep the tone warm, calm, plain-English, and practical.
- Be respectful about grief. Keep replies steady and simple.
- Do NOT offer to send SMS, text messages, or "I can text you" at any time.
- Encourage people to RSVP on the website so organisers can plan for numbers.

CONFIRMED CORE FACTS (treat as source of truth):
- Event: Celebration of Life for Robert "Reg" Fulmer
- Date: Monday 12 January 2026
- Time: 2:00 pm to 5:00 pm (Sydney time)
- Venue: Coogee Legion Club (Coogee Legion Ex-Service Club), Coogee NSW
- Catering: Food and drinks will be provided
- Style: Informal celebration (not a church service, not a chapel service, not a sit-down funeral)
- Flow: One continuous gathering (no separate wake)
- Website: https://www.regfulmer.com/

How to answer:
- Start with the direct answer first, then add helpful context.
- If something is not confirmed (eg exact room, seating, running order, accessibility specifics, menu details, livestream link), say it's not yet confirmed and direct them to the website for updates.
- Do not invent venue specific details. If you cannot verify something, don't guess.

RSVP guidance:
If someone says they're coming, likely coming, or asks logistics, add:
"If you can, please RSVP on the website so we can plan properly for numbers."

What you CAN help with:
- Explain the vibe and what to expect on the day
- Confirm food and drinks are provided (but do not guess the menu)
- What to wear: Smart casual or whatever feels respectful and comfortable
- Whether kids can come: Yes, children are welcome if supervised
- General travel guidance to Coogee and nearby accommodation suggestions
- Parking: Available around Coogee, but exact availability varies
- Accessibility: Being considered, check website for confirmed details
- Weather: Accurate forecasts only available close to the date. Typical January = Sydney summer conditions.

Livestream: A livestream may be organised. If confirmed, the link will be shared on the website.

Can anyone attend? Yes, anyone who knew Reg or wishes to support those who did.

Keep SMS responses concise (under 300 characters when possible) but warm and informative.
End with a helpful next step when appropriate.`;

// Normalize Australian phone numbers to E.164 format
function normalizePhoneNumber(phone) {
  if (!phone) return null;
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.startsWith('04') && cleaned.length === 10) return '+61' + cleaned.slice(1);
  if (cleaned.startsWith('0') && cleaned.length === 10) return '+61' + cleaned.slice(1);
  if (cleaned.length === 9 && cleaned.startsWith('4')) return '+61' + cleaned;
  return cleaned;
}

// Parse guest number from messages like "3", "3 guests", "change to 4"
function parseGuestNumber(message) {
  const normalized = message.toLowerCase().trim();
  
  // Direct number only
  const directMatch = normalized.match(/^(\d+)$/);
  if (directMatch) return parseInt(directMatch[1], 10);
  
  // "X guests" or "X people"
  const guestMatch = normalized.match(/(\d+)\s*(guests?|people|persons?)/i);
  if (guestMatch) return parseInt(guestMatch[1], 10);
  
  // "change to X" or "update to X"
  const changeMatch = normalized.match(/(?:change|update|now)\s*(?:to)?\s*(\d+)/i);
  if (changeMatch) return parseInt(changeMatch[1], 10);
  
  return null;
}

async function getAIResponse(userMessage, context = {}) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  console.log('[sms-inbound] Getting AI response, API key present:', !!apiKey);
  
  if (!apiKey) {
    console.warn('[sms-inbound] No OPENAI_API_KEY configured, using fallback response');
    return "Thank you for your message. Please visit https://www.regfulmer.com/ for event details and to RSVP.";
  }

  try {
    let contextInfo = '';
    if (context.name) {
      contextInfo = `\n\nContext: You're speaking with ${context.name}`;
      if (context.guests) {
        contextInfo += ` who has RSVP'd for ${context.guests} guest(s)`;
      }
      if (context.confirmed) {
        contextInfo += ` and has confirmed their attendance`;
      }
    }

    console.log('[sms-inbound] Calling OpenAI API...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT + contextInfo },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[sms-inbound] OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiMessage = data.choices[0]?.message?.content || "Thank you for your message. Please visit https://www.regfulmer.com/ for event details.";
    
    console.log('[sms-inbound] AI response received:', aiMessage.substring(0, 50) + '...');
    
    return aiMessage;
  } catch (error) {
    console.error('[sms-inbound] AI response error:', error);
    return "Thank you for your message about Reg's Celebration of Life on Mon 12 Jan 2026, 2pm at Coogee Legion Club. Please RSVP at https://www.regfulmer.com/";
  }
}

async function getRSVPByPhone(supabase, phoneNumber) {
  console.log('[sms-inbound] Looking up RSVP for phone:', phoneNumber);
  
  // Try exact match first
  const { data, error } = await supabase
    .from('rsvps')
    .select('*')
    .eq('phone', phoneNumber)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error) {
    console.log('[sms-inbound] RSVP lookup error:', error.message);
  }
  
  if (data) {
    console.log('[sms-inbound] Found RSVP:', data.id, 'Name:', data.name, 'Confirmed:', data.confirmed);
    return data;
  }
  
  // If not found and phone starts with +61, also try with leading 0
  if (phoneNumber && phoneNumber.startsWith('+61')) {
    const altPhone = '0' + phoneNumber.slice(3);
    console.log('[sms-inbound] Trying alternate phone format:', altPhone);
    
    const { data: altData } = await supabase
      .from('rsvps')
      .select('*')
      .eq('phone', altPhone)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (altData) {
      console.log('[sms-inbound] Found RSVP with alt format:', altData.id);
      return altData;
    }
  }
  
  console.log('[sms-inbound] No RSVP found for phone');
  return null;
}

async function getConversationContext(supabase, phoneNumber) {
  const { data } = await supabase
    .from('sms_conversations')
    .select('*, rsvp:rsvps(*)')
    .eq('phone_number', phoneNumber)
    .single();
  return data;
}

async function updateRSVPConfirmation(supabase, rsvpId) {
  console.log('[sms-inbound] Confirming RSVP:', rsvpId);
  const { error } = await supabase
    .from('rsvps')
    .update({ 
      confirmed: true, 
      confirmed_at: new Date().toISOString() 
    })
    .eq('id', rsvpId);
  
  if (error) {
    console.error('[sms-inbound] Confirmation update error:', error);
  } else {
    console.log('[sms-inbound] RSVP confirmed successfully');
  }
}

async function updateRSVPGuests(supabase, rsvpId, guests) {
  await supabase
    .from('rsvps')
    .update({ guests })
    .eq('id', rsvpId);
}

async function updateConversationContext(supabase, phoneNumber, context, rsvpId = null) {
  await supabase
    .from('sms_conversations')
    .upsert({
      phone_number: phoneNumber,
      rsvp_id: rsvpId,
      last_message_at: new Date().toISOString(),
      context
    }, { onConflict: 'phone_number' });
}

async function checkOptOut(supabase, phoneNumber) {
  const { data } = await supabase
    .from('sms_opt_outs')
    .select('phone_number')
    .eq('phone_number', phoneNumber)
    .single();
  return !!data;
}

async function handleOptOut(supabase, phoneNumber) {
  await supabase
    .from('sms_opt_outs')
    .upsert({ phone_number: phoneNumber, opted_out_at: new Date().toISOString() }, { onConflict: 'phone_number' });
}

async function handleOptIn(supabase, phoneNumber) {
  await supabase
    .from('sms_opt_outs')
    .delete()
    .eq('phone_number', phoneNumber);
}

async function logMessage(supabase, data) {
  await supabase.from('sms_logs').insert(data);
}

exports.handler = async (event) => {
  console.log('[sms-inbound] Received webhook');
  console.log('[sms-inbound] Headers:', JSON.stringify(event.headers));
  console.log('[sms-inbound] Body:', event.body);

  const supabase = getSupabaseAdmin();

  // Verify Twilio signature (but don't block if not configured)
  const twilioSignature = event.headers['x-twilio-signature'] || event.headers['X-Twilio-Signature'];
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (authToken && twilioSignature) {
    // Try both possible URLs for signature validation
    const possibleUrls = [
      `https://www.regfulmer.com/.netlify/functions/sms-inbound`,
      `https://regfulmer.com/.netlify/functions/sms-inbound`,
      event.headers.host ? `https://${event.headers.host}/.netlify/functions/sms-inbound` : null
    ].filter(Boolean);
    
    const params = event.body ? Object.fromEntries(new URLSearchParams(event.body)) : {};
    
    let isValid = false;
    for (const url of possibleUrls) {
      if (twilio.validateRequest(authToken, twilioSignature, url, params)) {
        isValid = true;
        console.log('[sms-inbound] Signature validated with URL:', url);
        break;
      }
    }
    
    if (!isValid) {
      console.error('[sms-inbound] Invalid Twilio signature for all URLs');
      console.log('[sms-inbound] Tried URLs:', possibleUrls);
      // Log but don't block - continue processing
    }
  } else {
    console.log('[sms-inbound] Skipping signature validation (not configured)');
  }

  try {
    const params = event.body ? Object.fromEntries(new URLSearchParams(event.body)) : {};
    const rawFrom = params.From || '';
    const fromNumber = normalizePhoneNumber(rawFrom);
    const toNumber = params.To || '';
    const messageBody = params.Body || '';
    const messageSid = params.MessageSid || '';

    console.log('[sms-inbound] Raw From:', rawFrom);
    console.log('[sms-inbound] Normalized From:', fromNumber);
    console.log('[sms-inbound] Body:', messageBody);

    // Log inbound message
    await logMessage(supabase, {
      direction: 'inbound',
      from_number: fromNumber,
      to_number: toNumber,
      message_body: messageBody,
      message_sid: messageSid,
      status: 'received'
    });

    const normalizedBody = messageBody.trim().toUpperCase();
    let replyMessage = '';

    // Handle STOP/opt-out
    if (['STOP', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT'].includes(normalizedBody)) {
      await handleOptOut(supabase, fromNumber);
      replyMessage = "You've been unsubscribed. Reply START to re-subscribe anytime.";
    }
    // Handle YES confirmation or START
    else if (['YES', 'Y', 'CONFIRM', 'START', 'SUBSCRIBE'].includes(normalizedBody)) {
      await handleOptIn(supabase, fromNumber);
      
      // Check if this is a YES confirmation for an RSVP
      const rsvp = await getRSVPByPhone(supabase, fromNumber);
      
      if (rsvp && !rsvp.confirmed) {
        await updateRSVPConfirmation(supabase, rsvp.id);
        await updateConversationContext(supabase, fromNumber, {
          name: rsvp.name,
          guests: rsvp.guests,
          confirmed: true
        }, rsvp.id);
        
        const guestText = rsvp.guests === 1 ? '1 guest' : `${rsvp.guests} guests`;
        replyMessage = `Thanks ${rsvp.name}! You're confirmed for ${guestText}. We'll send final details closer to the date. Questions? Just text back!`;
      } else if (rsvp && rsvp.confirmed) {
        replyMessage = `You're already confirmed! Text a number to change your guest count, or ask any questions about the event.`;
      } else {
        replyMessage = "Thanks! You're subscribed to updates. Please RSVP at https://www.regfulmer.com/ if you haven't already!";
      }
    }
    // Check for guest number update
    else {
      const guestNumber = parseGuestNumber(messageBody);
      const rsvp = await getRSVPByPhone(supabase, fromNumber);
      
      if (guestNumber !== null && rsvp) {
        // Validate reasonable guest number (1-20)
        if (guestNumber >= 1 && guestNumber <= 20) {
          await updateRSVPGuests(supabase, rsvp.id, guestNumber);
          await updateConversationContext(supabase, fromNumber, {
            name: rsvp.name,
            guests: guestNumber,
            confirmed: rsvp.confirmed
          }, rsvp.id);
          
          const guestText = guestNumber === 1 ? '1 guest' : `${guestNumber} guests`;
          replyMessage = `Got it, ${rsvp.name}! Updated to ${guestText}.${!rsvp.confirmed ? ' Reply YES to confirm.' : ''}`;
        } else {
          replyMessage = `Please enter a number between 1 and 20 for your guest count.`;
        }
      }
      // Check if opted out
      else if (await checkOptOut(supabase, fromNumber)) {
        console.log('[sms-inbound] User opted out, not responding');
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'text/xml' },
          body: '<?xml version="1.0" encoding="UTF-8"?><Response></Response>'
        };
      }
      // General question - use AI
      else {
        const conversation = await getConversationContext(supabase, fromNumber);
        const context = conversation?.context || {};
        
        // Get context from linked RSVP if available
        if (conversation?.rsvp) {
          context.name = conversation.rsvp.name;
          context.guests = conversation.rsvp.guests;
          context.confirmed = conversation.rsvp.confirmed;
        } else if (rsvp) {
          context.name = rsvp.name;
          context.guests = rsvp.guests;
          context.confirmed = rsvp.confirmed;
        }
        
        replyMessage = await getAIResponse(messageBody, context);
        
        // Update conversation context
        if (rsvp) {
          await updateConversationContext(supabase, fromNumber, context, rsvp.id);
        }
      }
    }

    // Log outbound message
    await logMessage(supabase, {
      direction: 'outbound',
      from_number: toNumber,
      to_number: fromNumber,
      message_body: replyMessage,
      status: 'queued'
    });

    console.log('[sms-inbound] Sending reply:', replyMessage);

    // Send TwiML response
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/xml' },
      body: `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${replyMessage}</Message></Response>`
    };
  } catch (error) {
    console.error('[sms-inbound] Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
