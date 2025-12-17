# Reg's Celebration of Life - Development Setup

## Runtime Dependencies

### Frontend (React/Vite)
- **Node.js**: v18+ or v20+ (LTS recommended)
- **React**: ^19.2.0
- **TypeScript**: ~5.9.3
- **Vite**: (rolldown-vite@7.2.5)
- **@supabase/supabase-js**: ^2.87.3

### Backend (Netlify Functions)
- **Node.js**: v18+ or v20+
- **@supabase/supabase-js**: Latest
- **busboy**: ^1.6.0 (for multipart form handling)

### External Services Required
- **Supabase**: Database and storage backend
- **Netlify**: Hosting and serverless functions
- **ElevenLabs**: AI chatbot integration (optional)

---

## Setup Commands

### 1. Initial Setup

```bash
# Clone the repository
git clone https://github.com/brettfulmer/regs_celebration_of_life.git
cd regs_celebration_of_life

# Install frontend dependencies
npm install

# Install Netlify CLI globally (for local development)
npm install -g netlify-cli
```

### 2. Environment Configuration

```bash
# Create .env file from example
cp .env.example .env

# Edit .env with your actual credentials:
# - SUPABASE_URL
# - SUPABASE_SERVICE_ROLE_KEY
# - SUPABASE_BUCKET (default: memories)
# - MEMORIES_AUTO_APPROVE (default: true)
```

### 3. Database Setup

Run the schema in your Supabase SQL Editor:

```bash
# Open supabase/schema.sql and execute in Supabase dashboard
# Creates tables: memories, rsvps
# Creates storage bucket: memories
```

### 4. Supabase Storage Configuration

In your Supabase dashboard:
1. Go to Storage
2. Create a public bucket named `memories` (or match your SUPABASE_BUCKET env var)
3. Set appropriate permissions for public read access

---

## Development Commands

### Start Development Server

```bash
# Option 1: Frontend only (Vite dev server)
npm run dev
# Runs on http://localhost:5173

# Option 2: Full stack with Netlify Functions (RECOMMENDED)
netlify dev
# Runs frontend + serverless functions locally
# Frontend: http://localhost:8888
# Functions: http://localhost:8888/.netlify/functions/*
```

### Build for Production

```bash
# Build frontend
npm run build

# Preview production build locally
npm run preview

# Deploy to Netlify (if configured)
netlify deploy --prod
```

### Linting

```bash
# Run ESLint
npm run lint
```

### Type Checking

```bash
# Check TypeScript types
npx tsc --noEmit
```

---

## Quick Start (Development)

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your Supabase credentials

# 3. Run the development server
netlify dev
```

Visit http://localhost:8888 to see the site.

---

## Project Structure

```
.
├── src/                    # Frontend React app
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── data/              # Static data
│   └── types/             # TypeScript types
├── netlify/functions/      # Serverless backend
│   ├── memories.js        # Memory upload/retrieval
│   ├── rsvp.js           # RSVP submissions
│   └── lib/              # Shared utilities
├── supabase/              # Database schema
└── public/                # Static assets
```

---

## Troubleshooting

### Functions not working locally
- Ensure you're using `netlify dev` instead of `npm run dev`
- Check `.env` file exists and has correct Supabase credentials

### CORS errors
- Netlify Functions automatically handle CORS when deployed
- For local dev, Netlify CLI proxies requests correctly

### Supabase connection issues
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct
- Check Supabase dashboard for project status
- Ensure database tables are created (run schema.sql)

### Storage/upload errors
- Verify storage bucket exists in Supabase
- Check bucket permissions allow public uploads
- Ensure `SUPABASE_BUCKET` env var matches bucket name
