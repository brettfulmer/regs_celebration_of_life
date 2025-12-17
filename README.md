# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  # Reg Fulmer — Celebration of Life (Microsite)

  Single-page memorial/celebration microsite built with Vite + React + TypeScript.

  ## What’s “fully functional” here?

  - Guests can submit memories (with optional photo upload)
  - Memories are stored in Supabase (DB + Storage)
  - Polaroid transform runs server-side via a configurable “Nano Banana” endpoint
  - Approved memories show on the Polaroid wall
  - On-page assistant calls a Netlify Function backed by OpenAI

  ## Local development

  Frontend only:

  ```bash
  npm install
  npm run dev
  ```

  Frontend + Netlify Functions (recommended for real feature testing):

  ```bash
  npm install
  npm i -g netlify-cli
  netlify dev
  ```

  ## Deployment (Netlify)

  This repo includes `netlify.toml` with:

  - Build command: `npm run build`
  - Publish directory: `dist`
  - SPA redirect: `/* -> /index.html`

  ### Required Netlify environment variables

  Set these in **Netlify → Site settings → Environment variables**.

  Supabase:

  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

  Storage bucket:

  - `SUPABASE_BUCKET` (recommended: `memories`)

  Assistant (OpenAI):

  - `OPENAI_API_KEY`
  - `OPENAI_MODEL` (optional, default: `gpt-4o-mini`)

  Event details (used by the assistant system prompt):

  - `EVENT_DATE`
  - `EVENT_TIME`
  - `EVENT_VENUE`
  - `EVENT_ADDRESS`
  - `EVENT_DRESS_CODE`

  Polaroid prompt (optional override):

  - `POLAROID_PROMPT`

  Nano Banana (image transform):

  - `NANO_BANANA_ENDPOINT` (HTTPS endpoint you control)
  - `NANO_BANANA_API_KEY` (optional)

  Moderation:

  - `MEMORIES_AUTO_APPROVE` (`true`/`false`, default `true`)
  - `ADMIN_APPROVE_TOKEN` (required if `MEMORIES_AUTO_APPROVE=false`)

  ## Supabase setup

  1) Create a Supabase project
  2) Run the SQL in `supabase/schema.sql`
  3) Create a Storage bucket named `memories` (or set `SUPABASE_BUCKET` to match)

  Paths used:

  - `uploads/<uuid>.<ext>`
  - `polaroids/<uuid>.png`

  ## Notes on “Nano Banana”

  The image-transform call is isolated in `netlify/functions/lib/nanoBanana.js`.
  It calls a configurable HTTP endpoint so you can plug in Gemini / Nano Banana however you prefer.

  If `NANO_BANANA_ENDPOINT` is not set, the site still works (it stores and displays the original image as the polaroid).
