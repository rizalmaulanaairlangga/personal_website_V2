alter table public.proyek_web
  add column if not exists screenshot_layout text not null default 'responsive';

alter table public.proyek_web
  drop constraint if exists proyek_web_screenshot_layout_check;

alter table public.proyek_web
  add constraint proyek_web_screenshot_layout_check
  check (screenshot_layout in ('responsive', 'mobile_only'));

-- Existing and new projects default to the established responsive layout.
-- Mobile-only is an explicit project setting saved by the CMS, not inferred
-- from which screenshot rows happen to be present.
