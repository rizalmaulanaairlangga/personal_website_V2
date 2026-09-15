-- Storage buckets for portfolio
insert into storage.buckets (id, name, public) values
  ('portfolio-tools', 'portfolio-tools', true),
  ('portfolio-prestasi', 'portfolio-prestasi', true),
  ('portfolio-proyek', 'portfolio-proyek', true)
on conflict (id) do update set public = true;

-- Policies: public read for all buckets, service_role write (via bypass RLS already, but add explicit)
-- Need to enable RLS on storage.objects (already enabled by Supabase)

drop policy if exists "public read portfolio-tools" on storage.objects;
create policy "public read portfolio-tools" on storage.objects for select using (bucket_id = 'portfolio-tools');

drop policy if exists "public read portfolio-prestasi" on storage.objects;
create policy "public read portfolio-prestasi" on storage.objects for select using (bucket_id = 'portfolio-prestasi');

drop policy if exists "public read portfolio-proyek" on storage.objects;
create policy "public read portfolio-proyek" on storage.objects for select using (bucket_id = 'portfolio-proyek');

-- Allow service_role and anon insert/update/delete via service_role key (bypass RLS) — add for completeness
drop policy if exists "allow upload portfolio-tools" on storage.objects;
create policy "allow upload portfolio-tools" on storage.objects for insert with check (bucket_id = 'portfolio-tools');

drop policy if exists "allow upload portfolio-prestasi" on storage.objects;
create policy "allow upload portfolio-prestasi" on storage.objects for insert with check (bucket_id = 'portfolio-prestasi');

drop policy if exists "allow upload portfolio-proyek" on storage.objects;
create policy "allow upload portfolio-proyek" on storage.objects for insert with check (bucket_id = 'portfolio-proyek');

drop policy if exists "allow update portfolio" on storage.objects;
create policy "allow update portfolio" on storage.objects for update using (bucket_id in ('portfolio-tools','portfolio-prestasi','portfolio-proyek'));

drop policy if exists "allow delete portfolio" on storage.objects;
create policy "allow delete portfolio" on storage.objects for delete using (bucket_id in ('portfolio-tools','portfolio-prestasi','portfolio-proyek'));
