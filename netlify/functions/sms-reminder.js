const twilio = require('twilio');
const { getSupabaseAdmin } = require('./lib/supabaseAdmin');
const { json, corsHeaders } = require('./lib/http');

function checkAuth(event) {
  const authHeader = event.headers.authorization || event.headers.Authorization || '';
  const adminPassword = process.env.ADMIN_PASSWORD || 'reg2025memorial';
  return authHeader === `Bearer ${adminPassword}`;
}

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

exports.handler = async (event) => {
  console.log('[sms-reminder] Request received');

  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(), body: '' };
  }

  if (!checkAuth(event)) {
    return json(401, { error: 'Unauthorized' }, corsHeaders());
  }

  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' }, corsHeaders());
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { type = 'unconfirmed', customMessage } = body;

    const supabase = getSupabaseAdmin();

    // Get RSVPs based on type
    let query = supabase.from('rsvps').select('*');

    if (type === 'unconfirmed') {
      query = query.eq('confirmed', false);
    } else if (type === 'all') {
      // Send to all
    } else if (type === 'confirmed') {
      query = query.eq('confirmed', true);
    }

    const { data: rsvps, error: rsvpError } = await query;

    if (rsvpError) {
      throw new Error(`Failed to fetch RSVPs: ${rsvpError.message}`);
    }

    if (!rsvps || rsvps.length === 0) {
      return json(200, { 
        success: true, 
        sent: 0, 
        failed: 0, 
        message: 'No RSVPs matching criteria' 
      }, corsHeaders());
    }

    // Check for opted-out numbers
    const { data: optOuts } = await supabase
      .from('sms_opt_outs')
      .select('phone_number');

    const optedOutNumbers = new Set((optOuts || []).map(o => o.phone_number));

    // Prepare Twilio client
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_FROM_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      return json(500, { error: 'Twilio not configured' }, corsHeaders());
    }

    const client = twilio(accountSid, authToken);

    // Default messages based on type
    const defaultMessages = {
      unconfirmed: "Hi {name}! Just a friendly reminder to confirm your RSVP for Reg's Celebration of Life on Mon 12 Jan 2026, 2pm at Coogee Legion Club. Reply YES to confirm for {guests} guest(s). 🕊️",
      confirmed: "Hi {name}! Thanks for confirming! Just a reminder that Reg's Celebration of Life is on Mon 12 Jan 2026, 2pm at Coogee Legion Club. See you there! 🕊️",
      all: "Hi {name}! Reminder: Reg's Celebration of Life is Mon 12 Jan 2026, 2pm at Coogee Legion Club. Visit https://www.regfulmer.com/ for details. 🕊️"
    };

    const messageTemplate = customMessage || defaultMessages[type] || defaultMessages.all;

    const results = [];
    let sent = 0;
    let failed = 0;
    let skipped = 0;

    for (const rsvp of rsvps) {
      const phone = normalizePhoneNumber(rsvp.phone);
      
      if (!phone) {
        results.push({ name: rsvp.name, phone: rsvp.phone, success: false, error: 'Invalid phone' });
        failed++;
        continue;
      }

      if (optedOutNumbers.has(phone)) {
        results.push({ name: rsvp.name, phone, success: false, error: 'Opted out' });
        skipped++;
        continue;
      }

      // Personalize message
      const personalizedMessage = messageTemplate
        .replace('{name}', rsvp.name || 'there')
        .replace('{guests}', rsvp.guests || 1)
        .replace('{email}', rsvp.email || '');

      const finalMessage = personalizedMessage + '\n\nReply STOP to opt out.';

      try {
        const message = await client.messages.create({
          body: finalMessage,
          from: fromNumber,
          to: phone
        });

        // Log the message
        await supabase.from('sms_logs').insert({
          direction: 'outbound',
          from_number: fromNumber,
          to_number: phone,
          message_body: finalMessage,
          message_sid: message.sid,
          status: message.status,
          is_bulk: true
        });

        results.push({ 
          name: rsvp.name, 
          phone, 
          success: true, 
          messageSid: message.sid 
        });
        sent++;
      } catch (err) {
        console.error(`[sms-reminder] Failed to send to ${phone}:`, err.message);
        results.push({ 
          name: rsvp.name, 
          phone, 
          success: false, 
          error: err.message 
        });
        failed++;
      }
    }

    return json(200, {
      success: true,
      sent,
      failed,
      skipped,
      total: rsvps.length,
      results
    }, corsHeaders());

  } catch (error) {
    console.error('[sms-reminder] Error:', error);
    return json(500, { error: error.message }, corsHeaders());
  }
};
