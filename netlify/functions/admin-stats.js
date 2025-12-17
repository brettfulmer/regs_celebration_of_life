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
  console.log('[admin-stats] Request received');

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
    
    // Get RSVP stats
    const { data: rsvps, error: rsvpError } = await supabase
      .from('rsvps')
      .select('*');
    
    if (rsvpError) {
      console.error('[admin-stats] RSVP error:', rsvpError);
    }

    // Get memory stats
    const { data: allMemories, error: memoryError } = await supabase
      .from('memories')
      .select('*');
    
    if (memoryError) {
      console.error('[admin-stats] Memory error:', memoryError);
    }

    const approvedMemories = (allMemories || []).filter(m => m.approved);
    const pendingMemories = (allMemories || []).filter(m => !m.approved);
    const memoriesWithPhotos = (allMemories || []).filter(m => m.image_path || m.polaroid_path);

    // Get SMS stats
    const { data: smsLogs, error: smsError } = await supabase
      .from('sms_logs')
      .select('*');
    
    if (smsError) {
      console.error('[admin-stats] SMS error:', smsError);
    }

    const inboundSMS = (smsLogs || []).filter(m => m.direction === 'inbound');
    const outboundSMS = (smsLogs || []).filter(m => m.direction === 'outbound');
    const bulkSMS = (smsLogs || []).filter(m => m.is_bulk);

    // Get opt-out stats
    const { data: optOuts, error: optOutError } = await supabase
      .from('sms_opt_outs')
      .select('*');
    
    if (optOutError) {
      console.error('[admin-stats] Opt-out error:', optOutError);
    }

    // Calculate recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.date - 7);

    const recentRSVPs = (rsvps || []).filter(r => 
      new Date(r.created_at) >= sevenDaysAgo
    ).length;

    const recentMemories = (allMemories || []).filter(m => 
      new Date(m.created_at) >= sevenDaysAgo
    ).length;

    const recentSMS = (smsLogs || []).filter(s => 
      new Date(s.timestamp || s.created_at) >= sevenDaysAgo
    ).length;

    // Build response
    const stats = {
      rsvps: {
        total: (rsvps || []).length,
        recent: recentRSVPs,
        list: (rsvps || []).map(r => ({
          name: r.name,
          email: r.email,
          phone: r.phone,
          created_at: r.created_at
        }))
      },
      memories: {
        total: (allMemories || []).length,
        approved: approvedMemories.length,
        pending: pendingMemories.length,
        withPhotos: memoriesWithPhotos.length,
        recent: recentMemories
      },
      sms: {
        totalMessages: (smsLogs || []).length,
        inbound: inboundSMS.length,
        outbound: outboundSMS.length,
        bulkSent: bulkSMS.length,
        optOuts: (optOuts || []).length,
        recent: recentSMS
      },
      activity: {
        last7Days: {
          rsvps: recentRSVPs,
          memories: recentMemories,
          sms: recentSMS
        }
      },
      timestamp: new Date().toISOString()
    };

    return json(200, stats, corsHeaders());
  } catch (error) {
    console.error('[admin-stats] Error:', error);
    return json(500, { error: error.message }, corsHeaders());
  }
};
