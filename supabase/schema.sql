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
  guests integer not null default 1,
  confirmed boolean not null default false,
  confirmed_at timestamptz,
  sms_sent boolean not null default false,
  sms_sent_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.rsvps enable row level security;

-- No public access; managed by Netlify Functions via service role.
-- Admin can query this table to see who's attending.

-- ============================================
-- SMS CONVERSATIONS TABLE
-- ============================================
-- Track conversation threads by phone number for context

create table if not exists public.sms_conversations (
  id uuid primary key default gen_random_uuid(),
  phone_number text not null,
  rsvp_id uuid references public.rsvps(id),
  last_message_at timestamptz not null default now(),
  context jsonb default '{}',
  created_at timestamptz not null default now()
);

create unique index if not exists sms_conversations_phone_idx on public.sms_conversations(phone_number);

alter table public.sms_conversations enable row level security;

-- ============================================
-- SMS LOGS TABLE
-- ============================================

create table if not exists public.sms_logs (
  id uuid primary key default gen_random_uuid(),
  timestamp timestamptz not null default now(),
  direction text not null, -- 'inbound' or 'outbound'
  from_number text not null,
  to_number text not null,
  message_body text not null,
  message_sid text,
  status text not null default 'pending',
  error_message text,
  is_bulk boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.sms_logs enable row level security;

-- ============================================
-- SMS OPT-OUTS TABLE
-- ============================================

create table if not exists public.sms_opt_outs (
  id uuid primary key default gen_random_uuid(),
  phone_number text not null unique,
  opted_out_at timestamptz not null default now()
);

alter table public.sms_opt_outs enable row level security;
