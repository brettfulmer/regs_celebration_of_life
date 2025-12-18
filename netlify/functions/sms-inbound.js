const twilio = require('twilio');
const { getSupabaseAdmin } = require('./lib/supabaseAdmin');

const SYSTEM_PROMPT = `You are a helpful assistant for the Celebration of Life memorial service for Robert "Reg" Fulmer.

Key Event Details:
- Person: Robert "Reg" Fulmer
- Date: Monday, 12th January 2026
- Time: 2:00 PM AEDT
- Venue: Coogee Legion Club, 200 Arden St, Coogee NSW 2034
- Address: Coogee, Sydney
- Website: https://regscelebrationoflife.netlify.app/

Important Guidelines:
- Always encourage people to RSVP on the website so organizers can plan for numbers
- If asked about livestream, say it's anticipated and the link will be posted on the website when confirmed
- For any updates or additional details, direct people to the website
- Be warm, compassionate, and helpful
- If asked about travel, weather, or local tips around Coogee, answer helpfully
- Never invent venue-specific details you cannot verify
- For sensitive or personal questions, respond politely and suggest contacting the organizers through the website

Keep responses concise (SMS-friendly, under 160 characters when possible) but warm and informative.`;

async function getAIResponse(userMessage) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return "Thank you for your message. Please visit https://regscelebrationoflife.netlify.app/ for event details and to RSVP.";
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "Thank you for your message. Please visit https://regscelebrationoflife.netlify.app/ for event details.";
  } catch (error) {
    console.error('AI response error:', error);
    return "Thank you for your message about Reg's Celebration of Life on Mon 12 Jan 2026, 2pm at Coogee Legion Club. Please RSVP at https://regscelebrationoflife.netlify.app/";
  }
}

async function checkOptOut(phoneNumber) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('sms_opt_outs')
    .select('phone_number')
    .eq('phone_number', phoneNumber)
    .single();
  return !!data;
}

async function handleOptOut(phoneNumber) {
  const supabase = getSupabaseAdmin();
  await supabase
    .from('sms_opt_outs')
    .insert({ phone_number: phoneNumber })
    .onConflict('phone_number')
    .ignore();
}

async function logMessage(data) {
  const supabase = getSupabaseAdmin();
  await supabase.from('sms_logs').insert(data);
}

exports.handler = async (event) => {
  console.log('[sms-inbound] Received webhook');

  // Verify Twilio signature
  const twilioSignature = event.headers['x-twilio-signature'] || event.headers['X-Twilio-Signature'];
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (authToken && twilioSignature) {
    const url = `https://regscelebrationoflife.netlify.app/.netlify/functions/sms-inbound`;
    const params = event.body ? Object.fromEntries(new URLSearchParams(event.body)) : {};
    
    if (!twilio.validateRequest(authToken, twilioSignature, url, params)) {
      console.error('[sms-inbound] Invalid Twilio signature');
      return {
        statusCode: 403,
        body: 'Forbidden'
      };
    }
  }

  try {
    const params = event.body ? Object.fromEntries(new URLSearchParams(event.body)) : {};
    const fromNumber = params.From || '';
    const toNumber = params.To || '';
    const messageBody = params.Body || '';
    const messageSid = params.MessageSid || '';

    console.log('[sms-inbound] From:', fromNumber, 'Body:', messageBody);

    // Log inbound message
    await logMessage({
      direction: 'inbound',
      from_number: fromNumber,
      to_number: toNumber,
      message_body: messageBody,
      message_sid: messageSid,
      status: 'received'
    });

    // Check for STOP/opt-out
    const normalizedBody = messageBody.trim().toUpperCase();
    if (['STOP', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT'].includes(normalizedBody)) {
      await handleOptOut(fromNumber);
      
      const replyMessage = "You have been unsubscribed from SMS notifications. Thank you.";
      
      await logMessage({
        direction: 'outbound',
        from_number: toNumber,
        to_number: fromNumber,
        message_body: replyMessage,
        status: 'opt-out-response'
      });

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/xml' },
        body: `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${replyMessage}</Message></Response>`
      };
    }

    // Check if opted out
    const isOptedOut = await checkOptOut(fromNumber);
    if (isOptedOut) {
      console.log('[sms-inbound] User opted out, not responding');
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/xml' },
        body: '<?xml version="1.0" encoding="UTF-8"?><Response></Response>'
      };
    }

    // Get AI response
    const aiReply = await getAIResponse(messageBody);

    // Log outbound message
    await logMessage({
      direction: 'outbound',
      from_number: toNumber,
      to_number: fromNumber,
      message_body: aiReply,
      status: 'queued'
    });

    console.log('[sms-inbound] Sending reply:', aiReply);

    // Send TwiML response
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/xml' },
      body: `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${aiReply}</Message></Response>`
    };
  } catch (error) {
    console.error('[sms-inbound] Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
