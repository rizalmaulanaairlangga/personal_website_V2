-- Project screenshots metadata: mobile/desktop/hero views per project.
-- proyek_web.id is uuid; both personal and team projects share this table.
create table if not exists public.project_screenshots (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.proyek_web (id) on delete cascade,
  image_path text not null,
  view_type text not null check (view_type in ('hero', 'mobile', 'desktop')),
  sort_order int not null default 0,
  alt_text text,
  created_at timestamptz not null default now(),
  unique (project_id, image_path)
);

create index if not exists idx_screenshots_project_view
  on public.project_screenshots (project_id, view_type, sort_order);

alter table public.project_screenshots enable row level security;

drop policy if exists "public read screenshots" on public.project_screenshots;
create policy "public read screenshots" on public.project_screenshots for select using (true);
