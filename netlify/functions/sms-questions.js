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
  console.log('[sms-questions] Request received');

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
    
    // Get all inbound SMS that aren't simple confirmations (YES, STOP, numbers)
    const { data: inbound, error } = await supabase
      .from('sms_logs')
      .select('id, timestamp, from_number, message_body')
      .eq('direction', 'inbound')
      .order('timestamp', { ascending: false })
      .limit(200);

    if (error) {
      return json(500, { error: error.message }, corsHeaders());
    }

    // Filter out simple confirmations and categorize questions
    const simplePatterns = /^(yes|no|y|n|stop|unsubscribe|start|help|\d+\s*(guests?|people)?)$/i;
    
    const questions = (inbound || [])
      .filter(msg => {
        const body = msg.message_body.trim();
        // Filter out simple responses
        if (simplePatterns.test(body)) return false;
        // Filter out very short messages (likely typos)
        if (body.length < 5) return false;
        return true;
      })
      .map(msg => ({
        id: msg.id,
        timestamp: msg.timestamp,
        phone: msg.from_number.replace(/^(\+61|61)/, '0').replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3'),
        question: msg.message_body.trim()
      }));

    // Get responses for each question
    const questionsWithResponses = [];
    for (const q of questions) {
      // Find outbound messages to this phone shortly after the question
      const { data: responses } = await supabase
        .from('sms_logs')
        .select('message_body, timestamp')
        .eq('direction', 'outbound')
        .eq('to_number', q.phone.replace(/\s/g, '').replace(/^0/, '+61'))
        .gt('timestamp', q.timestamp)
        .order('timestamp', { ascending: true })
        .limit(1);

      questionsWithResponses.push({
        ...q,
        response: responses?.[0]?.message_body || null
      });
    }

    // Group by similar questions for summary
    const questionSummary = {};
    for (const q of questionsWithResponses) {
      const normalized = q.question.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Simple categorization
      let category = 'Other';
      if (/where|venue|location|address|place/.test(normalized)) {
        category = 'Location';
      } else if (/when|time|date|what day/.test(normalized)) {
        category = 'Date & Time';
      } else if (/food|drink|eat|catering|lunch|dinner/.test(normalized)) {
        category = 'Food & Drinks';
      } else if (/park|parking|transport|bus|train|uber|taxi|drive/.test(normalized)) {
        category = 'Transport & Parking';
      } else if (/wear|dress|clothes|outfit|attire/.test(normalized)) {
        category = 'Dress Code';
      } else if (/kid|child|children|family|bring/.test(normalized)) {
        category = 'Kids & Family';
      } else if (/rsvp|confirm|coming|attend/.test(normalized)) {
        category = 'RSVP & Confirmation';
      } else if (/stream|live|zoom|video|online|remote/.test(normalized)) {
        category = 'Livestream';
      } else if (/hotel|stay|accommodation|sleep|airbnb/.test(normalized)) {
        category = 'Accommodation';
      }
      
      if (!questionSummary[category]) {
        questionSummary[category] = { count: 0, examples: [] };
      }
      questionSummary[category].count++;
      if (questionSummary[category].examples.length < 3) {
        questionSummary[category].examples.push(q.question);
      }
    }

    return json(200, { 
      questions: questionsWithResponses,
      summary: questionSummary,
      total: questionsWithResponses.length
    }, corsHeaders());
  } catch (error) {
    console.error('[sms-questions] Error:', error);
    return json(500, { error: error.message }, corsHeaders());
  }
};
