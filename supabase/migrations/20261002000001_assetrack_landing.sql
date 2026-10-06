-- Assetrack 3D landing page content (portofolio-rizal)
-- Hero, hero chips, 7 motion chapters (cam 0-6, incl. 3D camera endpoints), media
-- Run in Dashboard > SQL Editor. Idempotent (IF NOT EXISTS + upsert-friendly uniques).

create extension if not exists "pgcrypto";

-- 1) motion chapters: 1 row per 3D camera shot (overview + 6 features)
create table if not exists public.assetrack_chapters (
  id uuid primary key default gen_random_uuid(),
  cam_index int unique not null check (cam_index between 0 and 6),
  code text unique not null,
  number_label text not null,
  kicker text not null,
  title text not null,
  description text not null,
  cam_position jsonb not null default '{"x":0,"y":0,"z":0}',
  cam_target jsonb not null default '{"x":0,"y":0,"z":0}',
  align text not null default 'left' check (align in ('hero','left','right','center')),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- 2) hero copy (single active row)
create table if not exists public.assetrack_hero (
  id uuid primary key default gen_random_uuid(),
  eyebrow text not null,
  headline text not null,
  description text not null,
  scroll_hint text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 3) hero feature chips linking to chapters
create table if not exists public.assetrack_hero_chips (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  target_code text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- 4) media registry (storage paths + public urls)
create table if not exists public.assetrack_media (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bucket text not null,
  file_path text not null,
  public_url text not null,
  kind text not null default 'screenshot',
  alt_text text not null default '',
  created_at timestamptz not null default now()
);

-- RLS: public read only (same convention as portfolio tables)
alter table public.assetrack_chapters enable row level security;
alter table public.assetrack_hero enable row level security;
alter table public.assetrack_hero_chips enable row level security;
alter table public.assetrack_media enable row level security;

drop policy if exists "public read assetrack_chapters" on public.assetrack_chapters;
create policy "public read assetrack_chapters" on public.assetrack_chapters for select using (true);

drop policy if exists "public read assetrack_hero" on public.assetrack_hero;
create policy "public read assetrack_hero" on public.assetrack_hero for select using (true);

drop policy if exists "public read assetrack_hero_chips" on public.assetrack_hero_chips;
create policy "public read assetrack_hero_chips" on public.assetrack_hero_chips for select using (true);

drop policy if exists "public read assetrack_media" on public.assetrack_media;
create policy "public read assetrack_media" on public.assetrack_media for select using (true);

-- Indexes
create index if not exists idx_assetrack_chapters_cam on public.assetrack_chapters(cam_index);
create index if not exists idx_assetrack_chapters_sort on public.assetrack_chapters(sort_order);
create index if not exists idx_assetrack_hero_chips_sort on public.assetrack_hero_chips(sort_order);
