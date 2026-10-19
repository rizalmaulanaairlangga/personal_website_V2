-- The device showcase now uses a dedicated tablet screenshot, so the allowed
-- view types gain 'tablet' next to hero/mobile/desktop.
alter table public.project_screenshots
  drop constraint if exists project_screenshots_view_type_check;

alter table public.project_screenshots
  add constraint project_screenshots_view_type_check
  check (view_type in ('hero', 'mobile', 'tablet', 'desktop'));
