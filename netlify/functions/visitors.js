// ============================================
// VISITOR ANALYTICS FUNCTION
// ============================================

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

// Parse user agent to get device/browser info
function parseUserAgent(ua) {
  if (!ua) return { device: 'Unknown', browser: 'Unknown', os: 'Unknown' };
  
  // Device type
  let device = 'Desktop';
  if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    if (/iPad|Tablet/i.test(ua)) {
      device = 'Tablet';
    } else {
      device = 'Mobile';
    }
  }
  
  // Browser
  let browser = 'Unknown';
  if (ua.includes('Firefox/')) browser = 'Firefox';
  else if (ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('Chrome/')) browser = 'Chrome';
  else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Opera') || ua.includes('OPR/')) browser = 'Opera';
  
  // OS
  let os = 'Unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  
  return { device, browser, os };
}

exports.handler = async (event) => {
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
    
    // Get all page views
    const { data: pageViews, error: pvError } = await supabase
      .from('page_views')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);
    
    if (pvError) {
      console.error('[visitors] Page views error:', pvError);
    }

    // Get all RSVPs for correlation
    const { data: rsvps, error: rsvpError } = await supabase
      .from('rsvps')
      .select('id, name, email, created_at, confirmed');
    
    if (rsvpError) {
      console.error('[visitors] RSVP error:', rsvpError);
    }

    // Group by session to get unique visitors with their activity
    const sessionMap = new Map();
    
    for (const pv of (pageViews || [])) {
      if (!sessionMap.has(pv.session_id)) {
        const parsed = parseUserAgent(pv.user_agent);
        sessionMap.set(pv.session_id, {
          sessionId: pv.session_id,
          firstVisit: pv.created_at,
          lastVisit: pv.created_at,
          pageViews: 1,
          pages: [pv.page],
          country: pv.country || 'Unknown',
          city: pv.city || 'Unknown',
          device: parsed.device,
          browser: parsed.browser,
          os: parsed.os,
          referrer: pv.referrer || null,
          userAgent: pv.user_agent
        });
      } else {
        const session = sessionMap.get(pv.session_id);
        session.pageViews++;
        if (!session.pages.includes(pv.page)) {
          session.pages.push(pv.page);
        }
        if (new Date(pv.created_at) < new Date(session.firstVisit)) {
          session.firstVisit = pv.created_at;
        }
        if (new Date(pv.created_at) > new Date(session.lastVisit)) {
          session.lastVisit = pv.created_at;
        }
      }
    }

    const visitors = Array.from(sessionMap.values());

    // Calculate stats
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const todayVisitors = visitors.filter(v => new Date(v.firstVisit) >= today).length;
    const yesterdayVisitors = visitors.filter(v => {
      const d = new Date(v.firstVisit);
      return d >= yesterday && d < today;
    }).length;
    const weekVisitors = visitors.filter(v => new Date(v.firstVisit) >= weekAgo).length;

    // Device breakdown
    const deviceBreakdown = {
      Mobile: visitors.filter(v => v.device === 'Mobile').length,
      Desktop: visitors.filter(v => v.device === 'Desktop').length,
      Tablet: visitors.filter(v => v.device === 'Tablet').length
    };

    // Country breakdown (top 10)
    const countryMap = {};
    visitors.forEach(v => {
      const country = v.country || 'Unknown';
      countryMap[country] = (countryMap[country] || 0) + 1;
    });
    const countryBreakdown = Object.entries(countryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([country, count]) => ({ country, count }));

    // Browser breakdown
    const browserMap = {};
    visitors.forEach(v => {
      browserMap[v.browser] = (browserMap[v.browser] || 0) + 1;
    });
    const browserBreakdown = Object.entries(browserMap)
      .sort((a, b) => b[1] - a[1])
      .map(([browser, count]) => ({ browser, count }));

    // Referrer breakdown
    const referrerMap = {};
    visitors.forEach(v => {
      const ref = v.referrer ? new URL(v.referrer).hostname : 'Direct';
      referrerMap[ref] = (referrerMap[ref] || 0) + 1;
    });
    const referrerBreakdown = Object.entries(referrerMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([source, count]) => ({ source, count }));

    // Total page views
    const totalPageViews = (pageViews || []).length;
    const todayPageViews = (pageViews || []).filter(pv => new Date(pv.created_at) >= today).length;

    return json(200, {
      stats: {
        totalVisitors: visitors.length,
        totalPageViews,
        todayVisitors,
        todayPageViews,
        yesterdayVisitors,
        weekVisitors,
        avgPagesPerVisit: visitors.length > 0 
          ? (totalPageViews / visitors.length).toFixed(1) 
          : 0
      },
      deviceBreakdown,
      countryBreakdown,
      browserBreakdown,
      referrerBreakdown,
      visitors: visitors.slice(0, 100), // Latest 100 visitors
      rsvpCount: (rsvps || []).length,
      timestamp: new Date().toISOString()
    }, corsHeaders());
  } catch (error) {
    console.error('[visitors] Error:', error);
    return json(500, { error: error.message }, corsHeaders());
  }
};
