// ============================================
// NETLIFY FUNCTION: RSVP
// ============================================
// Handles RSVP submissions

const { getSupabaseAdmin } = require('./lib/supabaseAdmin');
const { parseJson } = require('./lib/parseJson');
const { json, handleOptions } = require('./lib/http');

exports.handler = async (event) => {
  const optionsResponse = handleOptions(event);
  if (optionsResponse) return optionsResponse;

  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  try {
    const body = parseJson(event.body);
    const { name, email, phone, guests } = body;

    // Validate required fields
    if (!name || !email || !phone || !guests) {
      return json(400, {
        error: 'Missing required fields',
        message: 'Name, email, phone number, and number of guests are required'
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return json(400, {
        error: 'Invalid email',
        message: 'Please provide a valid email address'
      });
    }

    // Insert RSVP into database
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('rsvps')
      .insert([{
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        guests: parseInt(guests, 10)
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return json(500, {
        error: 'Database error',
        message: 'Failed to save RSVP'
      });
    }

    return json(200, {
      success: true,
      message: 'Thank you for your RSVP!',
      rsvp: {
        id: data.id,
        name: data.name,
        createdAt: data.created_at
      }
    });

  } catch (err) {
    console.error('RSVP error:', err);
    return json(500, {
      error: 'Server error',
      message: 'An unexpected error occurred'
    });
  }
};
