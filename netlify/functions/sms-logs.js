const { getSupabaseAdmin } = require('./lib/supabaseAdmin');
const { json, corsHeaders } = require('./lib/http');

function checkAuth(event) {
  const authHeader = event.headers.authorization || event.headers.Authorization || '';
  const adminPassword = process.env.ADMIN_PASSWORD || 'reg2025memorial';
  
  if (!authHeader || authHeader !== `Bearer ${adminPassword}`) {
    return false;
  }
  return true;
}

exports.handler = async (event) => {
  console.log('[sms-logs] Request received');

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

  if (event.httpMethod !== 'GET') {
    return json(405, { error: 'Method not allowed' }, corsHeaders());
  }

  try {
    const supabase = getSupabaseAdmin();
    
    // Get recent SMS logs
    const { data: logs, error } = await supabase
      .from('sms_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);

    if (error) {
      return json(500, { error: error.message }, corsHeaders());
    }

    return json(200, { logs: logs || [] }, corsHeaders());
  } catch (error) {
    console.error('[sms-logs] Error:', error);
    return json(500, { error: error.message }, corsHeaders());
  }
};
