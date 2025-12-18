// ============================================
// PAGE VIEW TRACKING FUNCTION
// ============================================

const { getSupabaseAdmin } = require('./lib/supabaseAdmin');
const { json, corsHeaders } = require('./lib/http');

exports.handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders(),
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' }, corsHeaders());
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { sessionId, page = '/', referrer } = body;

    if (!sessionId) {
      return json(400, { error: 'Session ID required' }, corsHeaders());
    }

    const supabase = getSupabaseAdmin();

    // Get geo info from headers (Netlify provides these)
    const country = event.headers['x-country'] || event.headers['x-nf-client-connection-country'] || null;
    const city = event.headers['x-city'] || null;
    const userAgent = event.headers['user-agent'] || null;

    // Insert page view
    const { error } = await supabase
      .from('page_views')
      .insert({
        session_id: sessionId,
        page: page,
        referrer: referrer || null,
        user_agent: userAgent,
        country: country,
        city: city
      });

    if (error) {
      console.error('[track] Insert error:', error);
      // Don't fail the request, just log it
    }

    return json(200, { success: true }, corsHeaders());
  } catch (error) {
    console.error('[track] Error:', error);
    // Always return success to not affect user experience
    return json(200, { success: true }, corsHeaders());
  }
};
