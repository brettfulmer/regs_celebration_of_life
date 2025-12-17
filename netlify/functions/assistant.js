const { json, corsHeaders, handleOptions } = require('./lib/http');
const { parseJson } = require('./lib/parseJson');

function getSystemPrompt() {
  const fallback = `You are an on-page assistant for a memorial website celebrating the life of Reg Fulmer.

Your job is to:
– Help guests understand the tone of the event (a relaxed celebration, not a formal wake).
– Provide clear, kind answers about basic logistics: date, time, location, dress, general flow.
– Suggest helpful information related to the celebration (weather, transport, parking, nearby accommodation, things to do).
– Answer questions gently and calmly, never pushy or salesy.
– If details are not final or may change, be honest and say they are still being confirmed.
– Reassure people that they can come as they are; the focus is remembering Reg in a warm, informal way.

Important constraints:
• Never refer to the event as a "formal service" or "wake" unless explicitly asked and you need to clarify it’s more of a celebration.

Event details (may be placeholders):
- Date: ${process.env.EVENT_DATE || 'TBC'}
- Time: ${process.env.EVENT_TIME || 'TBC'}
- Venue: ${process.env.EVENT_VENUE || 'TBC'}
- Address: ${process.env.EVENT_ADDRESS || 'TBC'}
- Dress: ${process.env.EVENT_DRESS_CODE || 'Relaxed coastal casual'}
`;

  return process.env.ASSISTANT_SYSTEM_PROMPT || fallback;
}

exports.handler = async (event) => {
  const options = handleOptions(event);
  if (options) return options;

  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' }, corsHeaders());
  }

  try {
    const body = parseJson(event) || {};
    const incoming = Array.isArray(body.messages) ? body.messages : [];

    const cleaned = incoming
      .map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: String(m.content || '').trim()
      }))
      .filter((m) => m.content.length > 0)
      .slice(-20);

    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    if (!apiKey) {
      return json(
        200,
        {
          message:
            "I can help, but the assistant backend isn’t configured yet. Please check the FAQ section for now — or try again once OPENAI_API_KEY is set."
        },
        corsHeaders()
      );
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        messages: [{ role: 'system', content: getSystemPrompt() }, ...cleaned]
      })
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return json(500, { error: `OpenAI error: ${res.status} ${text}` }, corsHeaders());
    }

    const data = await res.json();
    const message = data?.choices?.[0]?.message?.content?.trim();

    return json(200, { message: message || "I'm here — what can I help with?" }, corsHeaders());
  } catch (e) {
    return json(500, { error: e?.message || 'Unknown error' }, corsHeaders());
  }
};
