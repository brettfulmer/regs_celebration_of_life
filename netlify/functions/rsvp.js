// ============================================
// NETLIFY FUNCTION: RSVP
// ============================================
// Handles RSVP submissions with automatic SMS confirmation

const twilio = require('twilio');
const { getSupabaseAdmin } = require('./lib/supabaseAdmin');
const { parseJson } = require('./lib/parseJson');
const { json, handleOptions } = require('./lib/http');

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

// Send SMS confirmation
async function sendConfirmationSMS(phoneNumber, name, guests) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.log('[rsvp] Twilio not configured, skipping SMS');
    return { sent: false, reason: 'not_configured' };
  }

  try {
    const client = twilio(accountSid, authToken);
    const guestText = guests === 1 ? '1 guest' : `${guests} guests`;
    
    const message = await client.messages.create({
      body: `Thanks ${name}! You're RSVP'd to Reg's Celebration of Life (Mon 12 Jan, 12pm at Horizons, Maroubra Beach) for ${guestText}.\n\nReply YES to confirm, or text a new number if your guest count changes.\n\nQuestions? Just text us back!`,
      from: fromNumber,
      to: phoneNumber,
      statusCallback: 'https://regscelebrationoflife.netlify.app/.netlify/functions/sms-status'
    });

    console.log('[rsvp] Confirmation SMS sent:', message.sid);
    return { sent: true, messageSid: message.sid };
  } catch (error) {
    console.error('[rsvp] SMS send error:', error.message);
    return { sent: false, error: error.message };
  }
}

exports.handler = async (event) => {
  const optionsResponse = handleOptions(event);
  if (optionsResponse) return optionsResponse;

  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  try {
    const body = parseJson(event) || {};
    const { name, email, phone, guests } = body;

    // Validate required fields
    if (!name || !email || !phone || !guests) {
      return json(400, {
        error: 'Missing required fields',
        message: 'Name, email, phone number, and number of guests are required'
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return json(400, {
        error: 'Invalid email',
        message: 'Please provide a valid email address'
      });
    }

    const normalizedPhone = normalizePhoneNumber(phone.trim());

    // Insert RSVP into database
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('rsvps')
      .insert([{
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: normalizedPhone,
        guests: parseInt(guests, 10),
        confirmed: false,
        sms_sent: false
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return json(500, {
        error: 'Database error',
        message: 'Failed to save RSVP'
      });
    }

    // Send confirmation SMS
    const smsResult = await sendConfirmationSMS(normalizedPhone, name.trim(), parseInt(guests, 10));

    // Update RSVP with SMS status
    if (smsResult.sent) {
      await supabase
        .from('rsvps')
        .update({ sms_sent: true, sms_sent_at: new Date().toISOString() })
        .eq('id', data.id);

      // Log the outbound SMS
      await supabase.from('sms_logs').insert({
        direction: 'outbound',
        from_number: process.env.TWILIO_FROM_NUMBER,
        to_number: normalizedPhone,
        message_body: `RSVP confirmation for ${name.trim()}`,
        message_sid: smsResult.messageSid,
        status: 'sent',
        is_bulk: false
      });

      // Create/update conversation context
      await supabase
        .from('sms_conversations')
        .upsert({
          phone_number: normalizedPhone,
          rsvp_id: data.id,
          last_message_at: new Date().toISOString(),
          context: { name: name.trim(), guests: parseInt(guests, 10), awaiting_confirmation: true }
        }, { onConflict: 'phone_number' });
    }

    return json(200, {
      success: true,
      message: smsResult.sent 
        ? 'Thank you for your RSVP! Check your phone for a confirmation text.'
        : 'Thank you for your RSVP!',
      rsvp: {
        id: data.id,
        name: data.name,
        createdAt: data.created_at
      },
      smsSent: smsResult.sent
    });

  } catch (err) {
    console.error('RSVP error:', err);
    return json(500, {
      error: 'Server error',
      message: 'An unexpected error occurred'
    });
  }
};
