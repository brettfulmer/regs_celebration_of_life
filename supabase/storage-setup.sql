-- ============================================
-- STORAGE BUCKET SETUP
-- Run this in the Supabase SQL editor to set up the storage bucket
-- ============================================

-- Create the memories bucket (if not already created via UI)
-- Note: Bucket creation is usually done via the Supabase dashboard
-- This is just for reference

-- Ensure the bucket exists (you may need to create it manually in the dashboard)
-- Bucket name: memories
-- Public: Yes
-- File size limit: 8MB

-- ============================================
-- STORAGE RLS POLICIES
-- ============================================

-- Allow public read access to all files in the memories bucket
create policy if not exists "Public can read memories files"
on storage.objects
for select
using (bucket_id = 'memories');

-- Allow service role to insert files
-- Note: Service role bypasses RLS, but this is for documentation
create policy if not exists "Service role can insert memories files"
on storage.objects
for insert
with check (bucket_id = 'memories');

-- Allow service role to update files
create policy if not exists "Service role can update memories files"
on storage.objects
for update
using (bucket_id = 'memories');

-- Allow service role to delete files
create policy if not exists "Service role can delete memories files"
on storage.objects
for delete
using (bucket_id = 'memories');

-- ============================================
-- NOTES
-- ============================================
-- If you're still having issues with uploads:
-- 1. Go to Storage in Supabase dashboard
-- 2. Create a bucket named "memories" if it doesn't exist
-- 3. Set it to "Public" 
-- 4. Set file size limit to 8388608 (8MB)
-- 5. The above RLS policies should already be in place
