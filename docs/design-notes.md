# Portfolio CMS — design notes

**Date:** 2026-10-21
**Status:** Implemented

These notes record what the CMS was built on, so the reasoning behind the
current shape is not lost. The public portfolio is a separate application and
is not modified by anything here.

## Existing application and schema

- The public site is Next.js 14 App Router with Supabase JS, reading
  `proyek_web` for projects and `project_screenshots` for the device showcase.
- The project detail page renders `foto_public_url` as the hero and reads the
  `mobile`, `tablet`, and `desktop` screenshot rows for the gallery. A project
  with no screenshot rows simply renders no gallery, and the renderer never
  draws an empty device frame.
- `proyek_web` columns: `id`, `name`, `description`, `date`, `foto_file_name`,
  `foto_storage_path`, `foto_public_url`, `link_web`, `repo_link`, `source`,
  `created_time`, `updated_time`, `frameworks`, `hero_subtitle`, `project_type`,
  `timeframe`, `brief`, `challenge`, `solution`, `credits`, `gallery`, `slug`,
  `seo_title`, `seo_desc`, `project_context`, `team_quote`.
- `brief`, `challenge`, and `solution` are JSON objects shaped
  `{ kicker, title, body }`; `credits` is an array of `{ name, role }`;
  `frameworks` is an array of strings.
- `project_screenshots` columns: `id`, `project_id`, `image_path`, `view_type`,
  `sort_order`, `alt_text`, `created_at`. `view_type` is constrained to
  `hero`, `mobile`, `tablet`, `desktop`. A foreign key cascades the rows when
  the project is deleted.
- `proyek_web.source` is constrained to `kolaborasi` or `personal`, so the CMS
  offers those two as a choice rather than free text.
- The `gallery` column is a legacy field the current renderer does not read.
  It is preserved untouched rather than rewritten.
- Storage objects live in the public bucket `portfolio-proyek`, under
  `<Project Name>/Foto/`, named `<role>-<slug>.<ext>`. The public URL is
  `{SUPABASE_URL}/storage/v1/object/public/portfolio-proyek/{path}`.

## Access control

- Supabase Auth with a cookie-backed session. The session is read by the
  middleware, by pages, and by every route handler.
- Authorisation is based on the email claim inside the **signed** access
  token, so the account holder cannot change it. The allowlist is the
  `cms_admins` table, mirrored by the `CMS_ADMIN_EMAILS` environment variable.
- The CMS talks to Supabase with the **caller's own access token**, never with
  the service-role key, so Row Level Security decides what each request may
  touch. The service-role key is not required anywhere in the app.
- Row Level Security was already enabled on both tables with read-only
  policies for `public`. The migration in `supabase/migrations/` adds write
  policies for an approved administrator and leaves the read policies intact.

## Screenshot and save lifecycle

- The four logical roles map to the hero columns on the project row and to
  `project_screenshots` rows for the other three, with the sort orders the
  renderer expects.
- A replacement upload gets a **fresh object name**. The object the database
  still points at is left alone until the database save succeeds, and is only
  released afterwards — and only when nothing else references it.
- Uploads are written to Storage first, then the record and the screenshot
  rows are saved, then the new objects are confirmed to exist. A success
  message is only shown after all of that.
- If the database write fails after an upload, the objects from that attempt
  are released and the failure is reported.
- Deleting a project removes its row and its screenshot rows. Storage objects
  are released only when no remaining row references them.

## Known gaps in the live database

These are recorded rather than changed, because fixing them is a separate
decision:

- `proyek_web.slug` has **no unique constraint**. The CMS checks uniqueness
  before saving, but two concurrent saves could still collide. A unique index
  would close this; it is additive and reversible.
- The Storage policies `allow upload portfolio-*`, `allow update portfolio`,
  and `allow delete portfolio` grant INSERT, UPDATE, and DELETE to the
  `public` role. The public portfolio never writes to Storage, so these are
  attack surface rather than a feature. The migration lists the statements
  that remove them, commented out and explained.

## Verification

The automated check covers: unauthenticated access to pages and API routes,
sign-in and sign-out, project listing and search, slug format and uniqueness,
create, update, screenshot upload, replacement, removal, confirmation of the
objects in Storage, the release of replaced objects, the partial-failure
path, deletion, and the survival of the original eight records.
