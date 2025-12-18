const { json, corsHeaders } = require('./lib/http');

exports.handler = async (event) => {
  console.log('[test-config] Checking environment variables...');
  
  const config = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? `Set (${process.env.OPENAI_API_KEY.substring(0, 7)}...)` : 'NOT SET',
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID ? `Set (${process.env.TWILIO_ACCOUNT_SID.substring(0, 10)}...)` : 'NOT SET',
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN ? 'Set (hidden)' : 'NOT SET',
    TWILIO_FROM_NUMBER: process.env.TWILIO_FROM_NUMBER || 'NOT SET',
    SUPABASE_URL: process.env.SUPABASE_URL ? 'Set' : 'NOT SET',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set (hidden)' : 'NOT SET',
  };

  // Test OpenAI if key exists
  let openaiTest = 'Not tested';
  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'Say "OK" only' }],
          max_tokens: 10
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        openaiTest = `✅ Working - Response: "${data.choices[0]?.message?.content}"`;
      } else {
        const errorText = await response.text();
        openaiTest = `❌ Error ${response.status}: ${errorText.substring(0, 100)}`;
      }
    } catch (err) {
      openaiTest = `❌ Exception: ${err.message}`;
    }
  }

  return json(200, {
    message: 'Configuration check',
    environment: config,
    openaiTest,
    timestamp: new Date().toISOString()
  }, corsHeaders());
};
