-- Portfolio CMS — admin access policies
--
-- Purpose: let the signed-in CMS administrator read and write project rows,
-- while the public portfolio keeps read-only access through the anon key.
--
-- Nothing here drops a table, a column, or a row. Every statement is
-- additive, and each policy can be removed on its own:
--
--   drop policy "cms admin write proyek_web" on public.proyek_web;
--   drop policy "cms admin write project_screenshots" on public.project_screenshots;
--   drop policy "cms admin write storage" on storage.objects;
--   drop table if exists public.cms_admins;
--   drop function if exists public.is_cms_admin();
--
-- Apply with: Supabase Dashboard > SQL Editor, or the Management API.

-- ---------------------------------------------------------------------------
-- 1. The approved administrators.
--
-- Authorisation is based on the email claim inside the signed access token,
-- which the account holder cannot edit. The table stores the allowlist; it is
-- never exposed to the browser and the CMS reads the same list from the
-- CMS_ADMIN_EMAILS environment variable.
-- ---------------------------------------------------------------------------
create table if not exists public.cms_admins (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. Helper that resolves the caller's signed email claim against that list.
--
-- security definer so the policy can read cms_admins without granting the
-- table to the caller. search_path is pinned so the function cannot be
-- hijacked through a shadowed schema.
-- ---------------------------------------------------------------------------
create or replace function public.is_cms_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.cms_admins a
    where a.email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- ---------------------------------------------------------------------------
-- 3. Seed the allowlist.
--
-- These are the accounts allowed to use the CMS. The account itself lives in
-- Supabase Auth; this table only records which signed-in identity may write.
-- Add or remove addresses here to change who has access.
-- ---------------------------------------------------------------------------
insert into public.cms_admins (email)
values
  ('rizal@student.pens.ac.id'),
  ('cms-admin@student.pens.ac.id')
on conflict (email) do nothing;

-- ---------------------------------------------------------------------------
-- 4. Table policies.
--
-- The existing "public read ..." policies stay exactly as they are: the
-- portfolio reads through them. These new policies only add write access,
-- and only for an approved administrator.
-- ---------------------------------------------------------------------------
drop policy if exists "cms admin write proyek_web" on public.proyek_web;
create policy "cms admin write proyek_web"
  on public.proyek_web
  for all
  to authenticated
  using (public.is_cms_admin())
  with check (public.is_cms_admin());

drop policy if exists "cms admin write project_screenshots" on public.project_screenshots;
create policy "cms admin write project_screenshots"
  on public.project_screenshots
  for all
  to authenticated
  using (public.is_cms_admin())
  with check (public.is_cms_admin());

-- ---------------------------------------------------------------------------
-- 5. Storage policy.
--
-- The bucket stays public so the portfolio can render the images. This policy
-- gives the administrator write access to it.
-- ---------------------------------------------------------------------------
drop policy if exists "cms admin write storage" on storage.objects;
create policy "cms admin write storage"
  on storage.objects
  for all
  to authenticated
  using (bucket_id = 'portfolio-proyek' and public.is_cms_admin())
  with check (bucket_id = 'portfolio-proyek' and public.is_cms_admin());

-- ---------------------------------------------------------------------------
-- 6. Optional hardening — read before running.
--
-- The bucket currently carries these policies, which grant INSERT, UPDATE and
-- DELETE to the "public" role, meaning any holder of the anon key can write
-- to or delete files in portfolio-proyek, portfolio-tools and
-- portfolio-prestasi:
--
--   allow delete portfolio          (DELETE, roles={public})
--   allow update portfolio          (UPDATE, roles={public})
--   allow upload portfolio-proyek   (INSERT, roles={public})
--   allow upload portfolio-tools    (INSERT, roles={public})
--   allow upload portfolio-prestasi (INSERT, roles={public})
--
-- The public portfolio only ever reads from these buckets — it has no upload
-- code — so removing them closes that hole without affecting the site. The
-- statements below are commented out on purpose. Uncomment them to apply.
--
--   drop policy if exists "allow delete portfolio" on storage.objects;
--   drop policy if exists "allow update portfolio" on storage.objects;
--   drop policy if exists "allow upload portfolio-proyek" on storage.objects;
--   drop policy if exists "allow upload portfolio-tools" on storage.objects;
--   drop policy if exists "allow upload portfolio-prestasi" on storage.objects;
--
-- After that, the only way to write to the buckets is through the CMS with
-- an approved administrator account, using the policy created in step 5.
