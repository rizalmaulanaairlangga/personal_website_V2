-- Project records no longer sync from Notion; the integration columns are unused.
alter table public.proyek_web drop column if exists notion_id;
alter table public.proyek_web drop column if exists notion_url;
