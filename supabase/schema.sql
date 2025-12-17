-- Supabase schema for Reg's Celebration of Life
-- Run this in the Supabase SQL editor.

create extension if not exists pgcrypto;

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Anonymous',
  relationship text null,
  message text not null,
  image_path text null,
  polaroid_path text null,
  created_at timestamptz not null default now(),
  approved boolean not null default false,
  rotation integer not null default 0
);

alter table public.memories enable row level security;

-- Public read only of approved memories
create policy if not exists "Public can read approved memories"
on public.memories
for select
using (approved = true);

-- No public inserts/updates/deletes; handled by Netlify Functions via service role.

-- Suggested storage:
-- Create a bucket named "memories" (public recommended for simplicity).
-- Files:
--  - uploads/<uuid>.<ext>
--  - polaroids/<uuid>.png

-- ============================================
-- RSVP TABLE
-- ============================================

create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  created_at timestamptz not null default now()
);

alter table public.rsvps enable row level security;

-- No public access; managed by Netlify Functions via service role.
-- Admin can query this table to see who's attending.
