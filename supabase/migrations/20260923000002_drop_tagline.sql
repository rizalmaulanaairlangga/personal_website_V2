-- Remove tagline column per request 2026-09-23 — hero redesign Image 1
alter table public.proyek_web drop column if exists tagline;
