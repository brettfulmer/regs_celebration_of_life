const { getSupabaseAdmin } = require('./lib/supabaseAdmin');
const { json, corsHeaders } = require('./lib/http');

function checkAuth(event) {
  const authHeader = event.headers.authorization || event.headers.Authorization || '';
  const adminPassword = process.env.ADMIN_PASSWORD || 'reg2025memorial';
  return authHeader === `Bearer ${adminPassword}`;
}

exports.handler = async (event) => {
  console.log('[admin-memories] Request received:', event.httpMethod);

  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(), body: '' };
  }

  if (!checkAuth(event)) {
    return json(401, { error: 'Unauthorized' }, corsHeaders());
  }

  const supabase = getSupabaseAdmin();

  // GET - List all memories with details
  if (event.httpMethod === 'GET') {
    try {
      const { data: memories, error } = await supabase
        .from('memories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return json(200, { memories: memories || [] }, corsHeaders());
    } catch (error) {
      console.error('[admin-memories] GET error:', error);
      return json(500, { error: error.message }, corsHeaders());
    }
  }

  // PATCH - Update memory (approve/reject)
  if (event.httpMethod === 'PATCH') {
    try {
      const body = JSON.parse(event.body || '{}');
      const { id, approved, featured } = body;

      if (!id) {
        return json(400, { error: 'Memory ID required' }, corsHeaders());
      }

      const updates = {};
      if (typeof approved === 'boolean') updates.approved = approved;
      if (typeof featured === 'boolean') updates.featured = featured;

      const { data, error } = await supabase
        .from('memories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return json(200, { memory: data }, corsHeaders());
    } catch (error) {
      console.error('[admin-memories] PATCH error:', error);
      return json(500, { error: error.message }, corsHeaders());
    }
  }

  // DELETE - Remove memory
  if (event.httpMethod === 'DELETE') {
    try {
      const body = JSON.parse(event.body || '{}');
      const { id } = body;

      if (!id) {
        return json(400, { error: 'Memory ID required' }, corsHeaders());
      }

      // Get memory to check for image
      const { data: memory } = await supabase
        .from('memories')
        .select('image_path')
        .eq('id', id)
        .single();

      // Delete image from storage if exists
      if (memory?.image_path) {
        await supabase.storage
          .from('memories')
          .remove([memory.image_path]);
      }

      // Delete memory record
      const { error } = await supabase
        .from('memories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return json(200, { success: true }, corsHeaders());
    } catch (error) {
      console.error('[admin-memories] DELETE error:', error);
      return json(500, { error: error.message }, corsHeaders());
    }
  }

  return json(405, { error: 'Method not allowed' }, corsHeaders());
};
