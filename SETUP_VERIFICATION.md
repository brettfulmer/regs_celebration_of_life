# Memory Sharing - Setup Verification

## ✅ Completed
- [x] Frontend memory submission form
- [x] Backend API endpoints
- [x] Environment variables set
- [x] Auto-refresh every 30 seconds
- [x] Form auto-reset after submission
- [x] Success messages auto-clear

## 🔍 Verify Database Setup

### 1. Check if the `memories` table exists

1. Go to https://app.supabase.com
2. Open your project: **pddlbmyntqeyyffgeemc**
3. Navigate to **Table Editor**
4. Look for the `memories` table

**If the table doesn't exist**, run the schema from `supabase/schema.sql`:
1. Go to **SQL Editor** in Supabase
2. Copy the content from `supabase/schema.sql`
3. Paste and run it

### 2. Check if the `memories` storage bucket exists

1. In Supabase, go to **Storage**
2. Look for a bucket named `memories`

**If it doesn't exist**:
1. Click **New bucket**
2. Name: `memories`
3. Make it **Public** (recommended for simplicity)
4. Click **Create bucket**

### 3. Test Memory Submission

1. Navigate to the **Memories section** on your site
2. Fill out the form:
   - Name: Test User
   - Relationship: Testing
   - Message: This is a test memory
   - Photo: (optional) Upload any image
3. Click **Share this memory**

**Expected behavior**:
- ✅ Success message appears
- ✅ Message auto-clears after 5 seconds
- ✅ Form resets completely
- ✅ Memory appears on the Polaroid wall immediately (if `MEMORIES_AUTO_APPROVE=true`)

### 4. Test Photo Transformation (Optional)

The Polaroid transformation requires the **Nano Banana** service:

**Environment variables needed**:
- `NANO_BANANA_ENDPOINT` - Your image transformation endpoint
- `NANO_BANANA_API_KEY` - (optional) API key for the service

**If not configured**: Photos will upload as-is without Polaroid styling.

## 🧪 How It Works

1. User submits memory → `POST /.netlify/functions/memories`
2. Backend saves to Supabase `memories` table
3. If photo included:
   - Uploads original to `memories/uploads/`
   - Transforms to Polaroid (if configured)
   - Uploads Polaroid to `memories/polaroids/`
4. Returns memory with `approved: true` (if auto-approve enabled)
5. Frontend adds memory to display
6. Auto-refreshes every 30 seconds to show new memories

## 📋 Current Environment Variables

- ✅ `VITE_SUPABASE_URL`
- ✅ `VITE_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `MEMORIES_AUTO_APPROVE=true`
- ⚠️ `NANO_BANANA_ENDPOINT` (optional)
- ⚠️ `NANO_BANANA_API_KEY` (optional)

## 🐛 Troubleshooting

### Memories don't appear after submission

1. Check browser console for errors
2. Verify `MEMORIES_AUTO_APPROVE=true` is set
3. Check Supabase logs for backend errors
4. Verify RLS policies allow public read of approved memories

### Photo upload fails

1. Check storage bucket exists and is public
2. Verify backend has correct permissions
3. Check file size (ensure it's reasonable)

### "Something went wrong" error

1. Check Netlify function logs
2. Verify all environment variables are set
3. Ensure database table schema matches expected structure
