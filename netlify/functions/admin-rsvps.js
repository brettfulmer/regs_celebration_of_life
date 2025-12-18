const { getSupabaseAdmin } = require('./lib/supabaseAdmin');
const { json, corsHeaders } = require('./lib/http');

function checkAuth(event) {
  const authHeader = event.headers.authorization || event.headers.Authorization || '';
  const adminPassword = process.env.ADMIN_PASSWORD || 'reg2025memorial';
  return authHeader === `Bearer ${adminPassword}`;
}

exports.handler = async (event) => {
  console.log('[admin-rsvps] Request received:', event.httpMethod);

  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(), body: '' };
  }

  if (!checkAuth(event)) {
    return json(401, { error: 'Unauthorized' }, corsHeaders());
  }

  const supabase = getSupabaseAdmin();

  // GET - Export RSVPs as CSV
  if (event.httpMethod === 'GET') {
    try {
      const format = event.queryStringParameters?.format || 'json';

      const { data: rsvps, error } = await supabase
        .from('rsvps')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (format === 'csv') {
        const headers = ['Name', 'Email', 'Phone', 'Guests', 'Confirmed', 'Confirmed At', 'SMS Sent', 'Created At'];
        const rows = (rsvps || []).map(r => [
          r.name || '',
          r.email || '',
          r.phone || '',
          r.guests || 1,
          r.confirmed ? 'Yes' : 'No',
          r.confirmed_at || '',
          r.sms_sent ? 'Yes' : 'No',
          r.created_at || ''
        ]);

        const csv = [
          headers.join(','),
          ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        return {
          statusCode: 200,
          headers: {
            ...corsHeaders(),
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="rsvps-${new Date().toISOString().split('T')[0]}.csv"`
          },
          body: csv
        };
      }

      return json(200, { rsvps: rsvps || [] }, corsHeaders());
    } catch (error) {
      console.error('[admin-rsvps] GET error:', error);
      return json(500, { error: error.message }, corsHeaders());
    }
  }

  // PATCH - Update RSVP
  if (event.httpMethod === 'PATCH') {
    try {
      const body = JSON.parse(event.body || '{}');
      const { id, confirmed, guests } = body;

      if (!id) {
        return json(400, { error: 'RSVP ID required' }, corsHeaders());
      }

      const updates = {};
      if (typeof confirmed === 'boolean') {
        updates.confirmed = confirmed;
        updates.confirmed_at = confirmed ? new Date().toISOString() : null;
      }
      if (typeof guests === 'number') {
        updates.guests = guests;
      }

      const { data, error } = await supabase
        .from('rsvps')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return json(200, { rsvp: data }, corsHeaders());
    } catch (error) {
      console.error('[admin-rsvps] PATCH error:', error);
      return json(500, { error: error.message }, corsHeaders());
    }
  }

  // DELETE - Remove RSVP
  if (event.httpMethod === 'DELETE') {
    try {
      const body = JSON.parse(event.body || '{}');
      const { id } = body;

      if (!id) {
        return json(400, { error: 'RSVP ID required' }, corsHeaders());
      }

      const { error } = await supabase
        .from('rsvps')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return json(200, { success: true }, corsHeaders());
    } catch (error) {
      console.error('[admin-rsvps] DELETE error:', error);
      return json(500, { error: error.message }, corsHeaders());
    }
  }

  return json(405, { error: 'Method not allowed' }, corsHeaders());
};
