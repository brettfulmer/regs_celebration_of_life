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

// Normalize phone to E.164 format
function normalizePhone(phone) {
  if (!phone) return null;
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.startsWith('04') && cleaned.length === 10) return '+61' + cleaned.slice(1);
  if (cleaned.startsWith('0') && cleaned.length === 10) return '+61' + cleaned.slice(1);
  if (cleaned.length === 9 && cleaned.startsWith('4')) return '+61' + cleaned;
  return cleaned;
}

// Format phone for display
function formatPhoneDisplay(phone) {
  if (!phone) return '';
  let display = phone;
  if (display.startsWith('+61')) {
    display = '0' + display.slice(3);
  }
  // Format as 0XXX XXX XXX
  if (display.length === 10 && display.startsWith('0')) {
    return `${display.slice(0, 4)} ${display.slice(4, 7)} ${display.slice(7)}`;
  }
  return display;
}

exports.handler = async (event) => {
  console.log('[contacts] Request received');

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
    
    // Get all RSVPs
    const { data: rsvps, error: rsvpError } = await supabase
      .from('rsvps')
      .select('id, name, phone, email, guests, confirmed, created_at')
      .order('name', { ascending: true });

    if (rsvpError) {
      return json(500, { error: rsvpError.message }, corsHeaders());
    }

    // Get all unique phones from SMS logs that aren't in RSVPs
    const { data: smsPhones, error: smsError } = await supabase
      .from('sms_logs')
      .select('from_number')
      .eq('direction', 'inbound');

    if (smsError) {
      console.error('[contacts] SMS query error:', smsError);
    }

    // Get opt-outs
    const { data: optOuts, error: optOutError } = await supabase
      .from('sms_opt_outs')
      .select('phone_number');

    const optOutSet = new Set((optOuts || []).map(o => normalizePhone(o.phone_number)));

    // Build contacts map (phone -> contact info)
    const contactsMap = new Map();

    // Add RSVPs first (they have the most info)
    for (const rsvp of (rsvps || [])) {
      const normalizedPhone = normalizePhone(rsvp.phone);
      if (normalizedPhone) {
        contactsMap.set(normalizedPhone, {
          id: rsvp.id,
          name: rsvp.name,
          phone: normalizedPhone,
          phoneDisplay: formatPhoneDisplay(normalizedPhone),
          email: rsvp.email,
          guests: rsvp.guests,
          confirmed: rsvp.confirmed,
          source: 'rsvp',
          hasRsvp: true,
          optedOut: optOutSet.has(normalizedPhone),
          createdAt: rsvp.created_at
        });
      }
    }

    // Add unique SMS senders who haven't RSVPd
    const uniqueSmsPhones = new Set();
    for (const sms of (smsPhones || [])) {
      const normalizedPhone = normalizePhone(sms.from_number);
      if (normalizedPhone && !contactsMap.has(normalizedPhone)) {
        uniqueSmsPhones.add(normalizedPhone);
      }
    }

    for (const phone of uniqueSmsPhones) {
      contactsMap.set(phone, {
        id: `sms-${phone}`,
        name: null,
        phone: phone,
        phoneDisplay: formatPhoneDisplay(phone),
        email: null,
        guests: null,
        confirmed: false,
        source: 'sms',
        hasRsvp: false,
        optedOut: optOutSet.has(phone),
        createdAt: null
      });
    }

    // Convert to array and sort
    const contacts = Array.from(contactsMap.values())
      .sort((a, b) => {
        // RSVPs first, then SMS-only
        if (a.hasRsvp && !b.hasRsvp) return -1;
        if (!a.hasRsvp && b.hasRsvp) return 1;
        // Then by name (nulls last)
        if (a.name && b.name) return a.name.localeCompare(b.name);
        if (a.name) return -1;
        if (b.name) return 1;
        return a.phone.localeCompare(b.phone);
      });

    // Summary stats
    const stats = {
      total: contacts.length,
      withRsvp: contacts.filter(c => c.hasRsvp).length,
      smsOnly: contacts.filter(c => !c.hasRsvp).length,
      confirmed: contacts.filter(c => c.confirmed).length,
      optedOut: contacts.filter(c => c.optedOut).length,
      totalGuests: contacts.reduce((sum, c) => sum + (c.guests || 0), 0)
    };

    return json(200, { contacts, stats }, corsHeaders());
  } catch (error) {
    console.error('[contacts] Error:', error);
    return json(500, { error: error.message }, corsHeaders());
  }
};
