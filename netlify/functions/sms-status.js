const twilio = require('twilio');
const { getSupabaseAdmin } = require('./lib/supabaseAdmin');

exports.handler = async (event) => {
  console.log('[sms-status] Status callback received');

  // Verify Twilio signature
  const twilioSignature = event.headers['x-twilio-signature'] || event.headers['X-Twilio-Signature'];
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (authToken && twilioSignature) {
    const url = `https://regscelebrationoflife.netlify.app/.netlify/functions/sms-status`;
    const params = event.body ? Object.fromEntries(new URLSearchParams(event.body)) : {};
    
    if (!twilio.validateRequest(authToken, twilioSignature, url, params)) {
      console.error('[sms-status] Invalid Twilio signature');
      return {
        statusCode: 403,
        body: 'Forbidden'
      };
    }
  }

  try {
    const params = event.body ? Object.fromEntries(new URLSearchParams(event.body)) : {};
    const messageSid = params.MessageSid || params.SmsSid || '';
    const messageStatus = params.MessageStatus || params.SmsStatus || '';
    const errorCode = params.ErrorCode;

    console.log('[sms-status] MessageSid:', messageSid, 'Status:', messageStatus);

    if (!messageSid) {
      return {
        statusCode: 400,
        body: 'Missing MessageSid'
      };
    }

    // Update status in database
    const supabase = getSupabaseAdmin();
    const updateData = {
      status: messageStatus
    };

    if (errorCode) {
      updateData.error_message = `Twilio error code: ${errorCode}`;
    }

    const { error } = await supabase
      .from('sms_logs')
      .update(updateData)
      .eq('message_sid', messageSid);

    if (error) {
      console.error('[sms-status] Database update error:', error);
    } else {
      console.log('[sms-status] Updated status for', messageSid, 'to', messageStatus);
    }

    return {
      statusCode: 200,
      body: 'OK'
    };
  } catch (error) {
    console.error('[sms-status] Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
