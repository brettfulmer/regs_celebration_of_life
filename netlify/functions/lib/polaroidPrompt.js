// Canonical polaroid prompt (kept server-side so we can evolve it without shipping client changes).
// You can override this via env var POLAROID_PROMPT.

const DEFAULT_PROMPT = `Using the uploaded image as the main content, generate a single classic Polaroid-style instant photograph: off-white paper border with a thicker bottom margin, soft film grain, slightly muted colours, gentle warm tone, subtle vignette. Keep the people and composition from the original image, no stickers or text, straight-on view of the Polaroid, ready to place on a digital collage wall.

Keep the background of the final output TRANSPARENT outside the Polaroid frame. Do NOT simulate transparency with a grey checkerboard.
Crop the final image tightly to the outer edge of the Polaroid frame, so the export is just the full Polaroid and nothing else.`;

function getPolaroidPrompt() {
  return process.env.POLAROID_PROMPT || DEFAULT_PROMPT;
}

module.exports = { getPolaroidPrompt, DEFAULT_PROMPT };
