-- Portfolio Rizal — 4 tables (tools, prestasi_akademik, prestasi_nonakademik, proyek_web)
-- Generated from Notion export 2026-09-13, region ap-southeast-1
-- Preserves original notion_id, csv columns, plus storage paths for files

-- ext for uuid
create extension if not exists "pgcrypto";

-- 1) tools (12 rows) - from Tools.csv
create table if not exists public.tools (
  id uuid primary key default gen_random_uuid(),
  notion_id text unique not null,
  name text not null,
  tool_id int unique,
  short_desc text,
  logo_file_name text,
  logo_storage_path text,
  logo_public_url text,
  notion_url text,
  created_time timestamptz,
  updated_time timestamptz
);

-- 2) prestasi_akademik (9 rows)
create table if not exists public.prestasi_akademik (
  id uuid primary key default gen_random_uuid(),
  notion_id text unique not null,
  name text not null,
  date date,
  status text,
  foto_file_name text,
  foto_storage_path text,
  foto_public_url text,
  file_file_name text,
  file_storage_path text,
  file_public_url text,
  terbaik boolean default false,
  notion_url text,
  created_time timestamptz,
  updated_time timestamptz
);

-- 3) prestasi_nonakademik (11 rows, 1 row name nullable)
create table if not exists public.prestasi_nonakademik (
  id uuid primary key default gen_random_uuid(),
  notion_id text unique not null,
  name text, -- nullable because one row has empty title
  date date,
  status text,
  foto_file_name text,
  foto_storage_path text,
  foto_public_url text,
  files_file_name text,
  files_storage_path text,
  files_public_url text,
  terbaik boolean default false,
  link boolean default false,
  link_lainnya text,
  notion_url text,
  created_time timestamptz,
  updated_time timestamptz
);

-- 4) proyek_web merged (4 rows: 2 kolaborasi + 2 personal)
create table if not exists public.proyek_web (
  id uuid primary key default gen_random_uuid(),
  notion_id text unique not null,
  name text not null,
  description text,
  date date,
  foto_file_name text,
  foto_storage_path text,
  foto_public_url text,
  link_web text,
  repo_link text,
  terbaik boolean default false,
  source text not null check (source in ('kolaborasi','personal')),
  notion_url text,
  created_time timestamptz,
  updated_time timestamptz
);

-- Enable RLS and public read policies (user wants public read only)
alter table public.tools enable row level security;
alter table public.prestasi_akademik enable row level security;
alter table public.prestasi_nonakademik enable row level security;
alter table public.proyek_web enable row level security;

drop policy if exists "public read tools" on public.tools;
create policy "public read tools" on public.tools for select using (true);

drop policy if exists "public read akademik" on public.prestasi_akademik;
create policy "public read akademik" on public.prestasi_akademik for select using (true);

drop policy if exists "public read nonakademik" on public.prestasi_nonakademik;
create policy "public read nonakademik" on public.prestasi_nonakademik for select using (true);

drop policy if exists "public read proyek" on public.proyek_web;
create policy "public read proyek" on public.proyek_web for select using (true);

-- Indexes for filtering
create index if not exists idx_tools_tool_id on public.tools(tool_id);
create index if not exists idx_prestasi_akademik_terbaik on public.prestasi_akademik(terbaik);
create index if not exists idx_prestasi_nonakademik_terbaik on public.prestasi_nonakademik(terbaik);
create index if not exists idx_proyek_web_source on public.proyek_web(source);
create index if not exists idx_proyek_web_terbaik on public.proyek_web(terbaik);
