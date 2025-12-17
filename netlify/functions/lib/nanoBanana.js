// Gemini “Nano Banana” integration.
//
// IMPORTANT: Providers differ. To keep this production-safe and swappable,
// we call a configurable HTTP endpoint that you control.
//
// Env vars:
// - NANO_BANANA_ENDPOINT: full HTTPS endpoint to call
// - NANO_BANANA_API_KEY: optional bearer key
//
// Request contract (what this function sends):
//   POST { prompt, imageBase64, mimeType }
// Response contract (what we expect back):
//   { pngBase64 }  OR  { imageBase64 }
//
// If these don’t match your provider, update this module only.

async function transformToPolaroid({ prompt, imageBuffer, mimeType }) {
  const endpoint = process.env.NANO_BANANA_ENDPOINT;

  if (!endpoint) {
    // If no provider is configured, return the original bytes.
    // This keeps the site functional while you wire up the image step.
    return { pngBuffer: imageBuffer };
  }

  const apiKey = process.env.NANO_BANANA_API_KEY;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {})
    },
    body: JSON.stringify({
      prompt,
      imageBase64: imageBuffer.toString('base64'),
      mimeType
    })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Nano Banana transform failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  const base64 = data.pngBase64 || data.imageBase64;
  if (!base64 || typeof base64 !== 'string') {
    throw new Error('Nano Banana transform: missing pngBase64/imageBase64');
  }

  return { pngBuffer: Buffer.from(base64, 'base64') };
}

module.exports = { transformToPolaroid };
