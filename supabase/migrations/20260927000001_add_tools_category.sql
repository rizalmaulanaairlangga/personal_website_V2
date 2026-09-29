-- Add category to tools + backfill (applied 2026-09-27)
-- Categories describe what each tool is for: Database, UI/UX, Frontend, etc.
alter table public.tools add column if not exists category text;

update public.tools set category = case tool_id
  when 1 then 'Code Editor'
  when 2 then 'Hosting'
  when 3 then 'Version Control'
  when 4 then 'Productivity'
  when 5 then 'Frontend'
  when 6 then 'Frontend'
  when 7 then 'UI/UX'
  when 8 then 'Design'
  when 9 then 'AI'
  when 10 then 'Design'
  when 11 then 'Mobile'
  when 12 then 'Hosting'
  when 13 then 'Database'
  when 14 then 'Database'
  when 15 then 'DevOps'
  when 16 then 'Backend'
  when 17 then 'Frontend'
  when 18 then 'UI/UX'
  when 19 then 'Frontend'
  when 20 then 'Frontend'
  when 21 then 'Backend'
  when 22 then 'Frontend'
  when 23 then 'Frontend'
end;
