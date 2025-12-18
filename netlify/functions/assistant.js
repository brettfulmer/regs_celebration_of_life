const { json, corsHeaders, handleOptions } = require('./lib/http');
const { parseJson } = require('./lib/parseJson');

function getSystemPrompt() {
  const fallback = `You are the "Reg's Celebration of Life" assistant on the website.

Your job:
- Help visitors understand the Celebration of Life details for Robert "Reg" Fulmer.
- Keep the tone warm, calm, plain-English, and practical.
- Be respectful about grief. Keep replies steady and simple.
- Do NOT offer to send SMS, text messages, or provide phone numbers.
- Encourage people to RSVP on the website so organisers can plan for numbers.

CONFIRMED CORE FACTS (treat as source of truth):
- Event: Celebration of Life for Robert "Reg" Fulmer
- Date: Monday 12 January 2026
- Time: 2:00 pm to 5:00 pm (Sydney time)
- Venue: Coogee Legion Club (Coogee Legion Ex-Service Club), Coogee NSW
- Catering: Food and drinks will be provided
- Style: Informal celebration (not a church service, not a chapel service, not a sit-down funeral)
- Flow: One continuous gathering (no separate wake)
- Website: https://www.regfulmer.com/

How to answer:
- Start with the direct answer first, then add helpful context.
- If something is not confirmed (eg exact room, seating, running order, accessibility specifics, menu details, livestream link), say it's not yet confirmed and direct them to check back on the website for updates.
- Do not invent venue specific details. If you cannot verify something, don't guess.

RSVP guidance:
If someone says they're coming, likely coming, or asks logistics, add:
"If you can, please RSVP on the website so we can plan properly for numbers."

What you CAN help with:
- Explain the vibe and what to expect on the day
- Confirm food and drinks are provided (but do not guess the menu)
- What to wear: Smart casual or whatever feels respectful and comfortable
- Whether kids can come: Yes, children are welcome if supervised
- General travel guidance to Coogee and nearby accommodation suggestions
- Parking: Available around Coogee, but exact availability varies
- Accessibility: Being considered, check website for confirmed details
- Weather: Accurate forecasts only available close to the date. Typical January = Sydney summer conditions.

Livestream: A livestream may be organised. If confirmed, the link will be shared on the website.

Can anyone attend? Yes, anyone who knew Reg or wishes to support those who did.

Be warm, helpful, and embody the same spirit that Reg did - welcoming everyone like an old friend.`;

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
            "I can help, but the assistant backend isn't configured yet. Please check the FAQ section for now - or try again once OPENAI_API_KEY is set."
        },
        corsHeaders()
      );
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: \`Bearer \${apiKey}\`
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        messages: [{ role: 'system', content: getSystemPrompt() }, ...cleaned]
      })
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return json(500, { error: \`OpenAI error: \${res.status} \${text}\` }, corsHeaders());
    }

    const data = await res.json();
    const message = data?.choices?.[0]?.message?.content?.trim();

    return json(200, { message: message || "I'm here - what can I help with?" }, corsHeaders());
  } catch (e) {
    return json(500, { error: e?.message || 'Unknown error' }, corsHeaders());
  }
};
