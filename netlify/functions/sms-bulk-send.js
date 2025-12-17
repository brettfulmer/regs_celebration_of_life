const twilio = require('twilio');
const { getSupabaseAdmin } = require('./lib/supabaseAdmin');
const { json, corsHeaders } = require('./lib/http');

// Simple admin authentication (check for admin password in header)
function checkAuth(event) {
  const authHeader = event.headers.authorization || event.headers.Authorization || '';
  const adminPassword = process.env.ADMIN_PASSWORD || 'reg2025memorial';
  
  if (!authHeader || authHeader !== `Bearer ${adminPassword}`) {
    return false;
  }
  return true;
}

async function getOptedOutNumbers() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('sms_opt_outs')
    .select('phone_number');
  return new Set((data || []).map(row => row.phone_number));
}

async function logMessage(data) {
  const supabase = getSupabaseAdmin();
  await supabase.from('sms_logs').insert(data);
}

async function sendSMS(client, fromNumber, toNumber, message) {
  try {
    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: toNumber,
      statusCallback: 'https://regscelebrationoflife.netlify.app/.netlify/functions/sms-status'
    });
    
    return {
      success: true,
      messageSid: result.sid,
      status: result.status
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

exports.handler = async (event) => {
  console.log('[sms-bulk-send] Request received');

  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders(),
      body: ''
    };
  }

  // Check authentication
  if (!checkAuth(event)) {
    return json(401, { error: 'Unauthorized' }, corsHeaders());
  }

  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' }, corsHeaders());
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { recipients, message, include_opt_out } = body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return json(400, { error: 'Recipients array is required' }, corsHeaders());
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return json(400, { error: 'Message is required' }, corsHeaders());
    }

    // Initialize Twilio client
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_FROM_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      return json(500, { error: 'Twilio configuration missing' }, corsHeaders());
    }

    const client = twilio(accountSid, authToken);

    // Add opt-out instructions if requested
    let finalMessage = message.trim();
    if (include_opt_out) {
      finalMessage += '\n\nReply STOP to opt out.';
    }

    // Get opted-out numbers
    const optedOut = await getOptedOutNumbers();

    // Send to each recipient with throttling
    const results = [];
    const delayBetweenMessages = 200; // 200ms delay between sends

    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      const phoneNumber = recipient.phone || recipient.phoneNumber || recipient;

      if (!phoneNumber) {
        results.push({
          phone: 'unknown',
          success: false,
          error: 'Invalid phone number'
        });
        continue;
      }

      // Skip opted-out numbers
      if (optedOut.has(phoneNumber)) {
        console.log('[sms-bulk-send] Skipping opted-out number:', phoneNumber);
        results.push({
          phone: phoneNumber,
          success: false,
          error: 'Opted out'
        });
        continue;
      }

      // Send SMS
      const result = await sendSMS(client, fromNumber, phoneNumber, finalMessage);

      // Log the message
      await logMessage({
        direction: 'outbound',
        from_number: fromNumber,
        to_number: phoneNumber,
        message_body: finalMessage,
        message_sid: result.messageSid,
        status: result.success ? result.status : 'failed',
        error_message: result.error,
        is_bulk: true
      });

      results.push({
        phone: phoneNumber,
        name: recipient.name,
        success: result.success,
        messageSid: result.messageSid,
        status: result.status,
        error: result.error
      });

      // Throttle to avoid rate limits
      if (i < recipients.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenMessages));
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log('[sms-bulk-send] Complete. Success:', successCount, 'Failed:', failureCount);

    return json(200, {
      success: true,
      total: results.length,
      sent: successCount,
      failed: failureCount,
      results
    }, corsHeaders());

  } catch (error) {
    console.error('[sms-bulk-send] Error:', error);
    return json(500, { error: error.message }, corsHeaders());
  }
};
