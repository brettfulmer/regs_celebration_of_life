const { json, corsHeaders, handleOptions } = require('./lib/http');
const { parseJson } = require('./lib/parseJson');
const { getSupabaseAdmin } = require('./lib/supabaseAdmin');

exports.handler = async (event) => {
  const options = handleOptions(event);
  if (options) return options;

  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' }, corsHeaders());
  }

  try {
    const token = process.env.ADMIN_APPROVE_TOKEN;
    const body = parseJson(event) || {};

    if (!token) {
      return json(500, { error: 'ADMIN_APPROVE_TOKEN not configured' }, corsHeaders());
    }

    if (body.token !== token) {
      return json(401, { error: 'Unauthorized' }, corsHeaders());
    }

    const id = (body.id || '').toString();
    if (!id) {
      return json(400, { error: 'id is required' }, corsHeaders());
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('memories')
      .update({ approved: true })
      .eq('id', id)
      .select('id,approved')
      .single();

    if (error) {
      return json(500, { error: error.message }, corsHeaders());
    }

    return json(200, { success: true, memory: data }, corsHeaders());
  } catch (e) {
    return json(500, { error: e?.message || 'Unknown error' }, corsHeaders());
  }
};
