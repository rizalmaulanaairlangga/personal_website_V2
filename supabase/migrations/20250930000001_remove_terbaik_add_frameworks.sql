-- Remove 'terbaik' column from all tables (user request) and add frameworks column to proyek_web
alter table public.prestasi_akademik drop column if exists terbaik;
alter table public.prestasi_nonakademik drop column if exists terbaik;
alter table public.proyek_web drop column if exists terbaik;

drop index if exists public.idx_prestasi_akademik_terbaik;
drop index if exists public.idx_prestasi_nonakademik_terbaik;
drop index if exists public.idx_proyek_web_terbaik;

-- Frameworks/tools for web projects (array of strings)
alter table public.proyek_web add column if not exists frameworks text[] default '{}';
