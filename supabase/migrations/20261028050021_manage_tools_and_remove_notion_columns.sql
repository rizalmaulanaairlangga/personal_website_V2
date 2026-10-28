begin;

alter table public.tools
  drop column if exists notion_id,
  drop column if exists notion_url;

alter table public.prestasi_akademik
  drop column if exists notion_id,
  drop column if exists notion_url;

alter table public.prestasi_nonakademik
  drop column if exists notion_id,
  drop column if exists notion_url;

create sequence if not exists public.tools_tool_id_seq as integer;

select setval(
  'public.tools_tool_id_seq',
  coalesce((select max(tool_id) from public.tools), 0) + 1,
  false
);

alter table public.tools
  alter column tool_id set default nextval('public.tools_tool_id_seq');

alter sequence public.tools_tool_id_seq
  owned by public.tools.tool_id;

grant usage, select on sequence public.tools_tool_id_seq to authenticated;
grant select on public.tools to anon, authenticated;
grant insert on public.tools to authenticated;
revoke insert, update, delete on public.tools from anon;

alter table public.tools enable row level security;

drop policy if exists "cms tools public read" on public.tools;
create policy "cms tools public read"
  on public.tools
  for select
  to anon, authenticated
  using (true);

do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select p.polname
    from pg_policy as p
    where p.polrelid = 'public.tools'::regclass
      and p.polcmd in ('a', 'w', 'd', '*')
      and (
        0::oid = any(p.polroles)
        or (select oid from pg_roles where rolname = 'anon') = any(p.polroles)
        or (select oid from pg_roles where rolname = 'authenticated') = any(p.polroles)
      )
  loop
    execute format('drop policy %I on public.tools', existing_policy.polname);
  end loop;
end
$$;

drop policy if exists "cms admin insert tools" on public.tools;
create policy "cms admin insert tools"
  on public.tools
  for insert
  to authenticated
  with check (public.is_cms_admin());

drop policy if exists "cms admin write portfolio-tools" on storage.objects;
create policy "cms admin write portfolio-tools"
  on storage.objects
  for all
  to authenticated
  using (bucket_id = 'portfolio-tools' and public.is_cms_admin())
  with check (bucket_id = 'portfolio-tools' and public.is_cms_admin());

commit;
