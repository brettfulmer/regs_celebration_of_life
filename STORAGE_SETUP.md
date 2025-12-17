# Storage Setup Guide

## Supabase Storage Configuration

The image sharing feature requires a properly configured Supabase storage bucket.

### Manual Setup (Recommended)

1. **Go to Supabase Dashboard**
   - Navigate to https://supabase.com/dashboard
   - Select your project: `pddlbmyntqeyyffgeemc`

2. **Create Storage Bucket**
   - Go to Storage section
   - Click "New Bucket"
   - Name: `memories`
   - Public: ✅ **Yes** (important for viewing images)
   - File size limit: `8388608` (8MB)
   - Allowed MIME types: Leave empty (allows all image types)

3. **Verify RLS Policies**
   - Click on the `memories` bucket
   - Go to "Policies" tab
   - Ensure "Public can read" policy exists
   - If not, run the SQL from `supabase/storage-setup.sql`

### Automatic Setup

The Netlify function will attempt to create the bucket automatically if it doesn't exist. However, manual creation is more reliable.

### Testing

After setup, test the image upload by:
1. Go to the Memories section on your site
2. Fill in the form with a message
3. Select an image file (JPG, PNG, WebP)
4. Click "Share this memory"
5. Check for success message or error details

### Troubleshooting

**"Bucket does not exist" error:**
- Create the bucket manually in Supabase dashboard
- Ensure it's named exactly `memories` (lowercase)
- Make sure it's set to Public

**"Upload failed" error:**
- Check the browser console for detailed error messages
- Verify environment variables are set correctly
- Check Supabase dashboard for storage quotas

**"Transform failed" error:**
- This is expected if NANO_BANANA_ENDPOINT is not set
- The original image will still be saved
- To enable Polaroid transformation, set up the Nano Banana provider

### Environment Variables

Required in Netlify:
```
SUPABASE_URL=https://pddlbmyntqeyyffgeemc.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
MEMORIES_AUTO_APPROVE=true
```

Optional (for Polaroid transformation):
```
NANO_BANANA_ENDPOINT=<your-endpoint>
NANO_BANANA_API_KEY=<your-api-key>
```
