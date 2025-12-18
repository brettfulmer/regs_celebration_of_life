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
    console.log('[sms-bulk-send] Attempting to send SMS:', { from: fromNumber, to: toNumber });
    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: toNumber,
      statusCallback: 'https://regscelebrationoflife.netlify.app/.netlify/functions/sms-status'
    });
    
    console.log('[sms-bulk-send] SMS sent successfully:', result.sid);
    return {
      success: true,
      messageSid: result.sid,
      status: result.status
    };
  } catch (error) {
    console.error('[sms-bulk-send] Twilio error:', {
      message: error.message,
      code: error.code,
      status: error.status,
      moreInfo: error.moreInfo
    });
    
    // Provide more detailed error messages
    let errorMessage = error.message;
    if (error.code === 20003) {
      errorMessage = 'Authentication failed - check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN';
    } else if (error.code === 21211) {
      errorMessage = `Invalid 'To' phone number: ${toNumber}`;
    } else if (error.code === 21212) {
      errorMessage = `Invalid 'From' phone number: ${fromNumber}`;
    } else if (error.code === 21608) {
      errorMessage = 'Phone number not verified for trial account';
    } else if (error.code === 21614) {
      errorMessage = 'Phone number is not SMS-capable';
    }
    
    return {
      success: false,
      error: errorMessage,
      twilioCode: error.code,
      twilioStatus: error.status
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

    // Debug: Log credential format (not values) to help diagnose issues
    console.log('[sms-bulk-send] Credential check:', {
      accountSidExists: !!accountSid,
      accountSidLength: accountSid?.length,
      accountSidPrefix: accountSid?.substring(0, 2),
      authTokenExists: !!authToken,
      authTokenLength: authToken?.length,
      fromNumberExists: !!fromNumber,
      fromNumberValue: fromNumber
    });

    if (!accountSid || !authToken || !fromNumber) {
      return json(500, { 
        error: 'Twilio configuration missing',
        debug: {
          hasAccountSid: !!accountSid,
          hasAuthToken: !!authToken,
          hasFromNumber: !!fromNumber
        }
      }, corsHeaders());
    }

    // Validate credential format
    if (!accountSid.startsWith('AC') || accountSid.length !== 34) {
      return json(500, { 
        error: `Invalid TWILIO_ACCOUNT_SID format. Should start with "AC" and be 34 chars. Got: starts with "${accountSid.substring(0, 2)}", length ${accountSid.length}` 
      }, corsHeaders());
    }

    if (authToken.length !== 32) {
      return json(500, { 
        error: `Invalid TWILIO_AUTH_TOKEN format. Should be 32 chars. Got: ${authToken.length} chars` 
      }, corsHeaders());
    }

    const client = twilio(accountSid, authToken);

    // Add opt-out instructions if requested
    let finalMessage = message.trim();
    if (include_opt_out) {
      finalMessage += '\n\nReply STOP to opt out.';
    }

    // Normalize Australian phone numbers to E.164 format
function normalizePhoneNumber(phone) {
  if (!phone) return null;
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Already in international format
  if (cleaned.startsWith('+')) return cleaned;
  
  // Australian mobile starting with 04
  if (cleaned.startsWith('04') && cleaned.length === 10) {
    return '+61' + cleaned.slice(1);
  }
  
  // Australian number starting with 0
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return '+61' + cleaned.slice(1);
  }
  
  // Assume Australian if 9 digits (missing leading 0)
  if (cleaned.length === 9 && cleaned.startsWith('4')) {
    return '+61' + cleaned;
  }
  
  return cleaned;
}

// Get opted-out numbers
    const optedOut = await getOptedOutNumbers();

    // Send to each recipient with throttling
    const results = [];
    const delayBetweenMessages = 200; // 200ms delay between sends

    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      const rawPhone = recipient.phone || recipient.phoneNumber || recipient;
      const phoneNumber = normalizePhoneNumber(rawPhone);

      if (!phoneNumber) {
        results.push({
          phone: rawPhone || 'unknown',
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
