# CMS tools catalog and image optimization

**Status:** ready for review
**Date:** 2026-10-28

## Goal

Extend the private Portfolio CMS so an administrator can add tools to the
existing public portfolio catalog. New records contain a name, short
description, category, and logo. All new CMS image uploads are compressed by
the backend before they reach Supabase Storage. Remove the obsolete Notion
columns from the three tables where they exist.

## Verified current state

- Supabase already has a `public.tools` table with `name`, `short_desc`,
  `category`, `tool_id`, and `logo_file_name`, `logo_storage_path`, and
  `logo_public_url` fields.
- The table has 23 records with `tool_id` values 1 to 23 and 12 distinct
  categories. The public portfolio reads these tool fields through the
  Data API.
- Tool objects are in the `portfolio-tools` bucket. The current object key
  follows `Tools/<name>/logo/<filename>`; `logo_storage_path` includes the
  `portfolio-tools/` prefix while the Storage key does not.
- The current project image endpoint stores project images in
  `portfolio-proyek` and accepts PNG, JPEG, WebP, and GIF files.
- `notion_id` and `notion_url` exist in `tools`, `prestasi_akademik`, and
  `prestasi_nonakademik`. Each table has non-null values in both columns. The
  user approved dropping both columns from all three tables, including those
  values.
- No Notion column references were found in the CMS or the public site source.

## CMS experience

Add a Tools entry point from the existing dashboard. The `/tools` page lists
the current tools and links to a dedicated add form. The form includes:

- `name`
- `short_desc`
- `category`, using a styled dropdown with current categories and an inline
  **Add category** option
- a logo file picker with local preview

Categories remain plain text in `tools.category`; there is no separate
category table. The option list is the distinct category values in `tools`.
A newly typed category is saved along with its tool and then appears in the
dropdown for future tools. Creating a category without creating a tool is out
of scope.

The form creates tools only; editing and deleting existing tools are out of
scope. The page and API require the existing CMS administrator session.

## Data and API flow

The existing tools row receives `name`, `short_desc`, `category`,
`logo_file_name`, `logo_storage_path`, `logo_public_url`, `created_time`, and
`updated_time`. Generate `id` server-side. Use a database sequence for
`tool_id`, initialized after the current maximum, so concurrent creates do
not choose the same number and public ordering stays numeric.

The authenticated tools API handles a create request as one server workflow:

1. Validate the fields and image.
2. Compress the image and upload it to bucket `portfolio-tools` with a key
   under `Tools/<name>/logo/`.
3. Insert the tools row with the public URL and the existing DB path convention
   (`portfolio-tools/Tools/<name>/logo/<filename>`).
4. If the row insert fails after upload, remove that newly uploaded object and
   return the error.

Category choices are fetched from the existing tools table, so no category
endpoint or new database table is needed.

## Backend image compression

Use Sharp in an explicitly Node.js server helper shared by `/api/upload` and
the tools create endpoint. All new project hero, project screenshot, and tool logo
uploads pass through this helper. Existing stored objects remain unchanged.

The helper validates decoded image metadata, auto-orients from EXIF, avoids
upscaling, caps the largest dimension at 2400 px, and emits WebP at a target
quality of 82. It preserves transparency and reads all frames for animated
GIF input so the output remains animated. The Storage object name and MIME
type become `.webp` and `image/webp`; API responses report compressed size as
well as original size. Existing 10 MB input limits remain in place.

Sharp's animated input mode and WebP encoder support these behaviors:
[constructor options](https://sharp.pixelplumbing.com/api-constructor/),
[output options](https://sharp.pixelplumbing.com/api-output/).

## Supabase schema and access

Use a versioned migration for schema changes. It will:

1. Drop `notion_id` and `notion_url` from `tools`, `prestasi_akademik`, and
   `prestasi_nonakademik` with `IF EXISTS` and without `CASCADE`.
2. Add the `tools.tool_id` sequence/default and grant authenticated users the
   sequence usage required by the CMS insert.
3. Enable RLS on `tools`, preserving anonymous read access for the public site
   with a `SELECT` policy for `anon` and `authenticated`, and granting writes
   only through the existing `public.is_cms_admin()` authorization function.
   Keep an explicit `SELECT` grant for `anon` and grant the required CRUD
   privileges to `authenticated`.
4. Add an administrator Storage policy for `portfolio-tools`, matching the
   existing CMS access pattern used for project images.

The migration will not alter existing public site reads or rewrite current
tool image paths. Supabase's October 30, 2026 Data API grant change concerns
new public tables; this design reuses the existing `tools` table and does not
create a category table.

## Error handling and safety

- Reject missing names, descriptions, or categories and unsupported or invalid
  images with a form-level error.
- Keep the existing 10 MB upload cap and Sharp's input-pixel safety limit.
- Do not create a tools row when Storage upload fails.
- Remove the new Storage object if the database insert fails.
- Apply the column drops without `CASCADE` so unexpected database dependencies
  stop the migration instead of being removed implicitly.
- Never send the service-role key to the browser. Use the current user-scoped
  Supabase client and an explicit admin RLS policy.

## Verification criteria

- The Tools page lists current records and the form can create a tool with an
  existing category or a newly entered category.
- The created row has a sequential `tool_id`, and its logo URL loads from
  `portfolio-tools` at the existing path convention.
- A failed database insert removes the just-uploaded logo.
- Uploads through both project and tool flows are WebP, report the compressed
  byte size, and preserve alpha and animated GIF frames.
- Anonymous reads of `tools` still work for the public site; writes require a
  CMS admin session.
- The three tables no longer expose either Notion column after the migration.

## Deployment constraint

The service-role key in `.env.local` permits read-only schema and row inspection
through the Data API, but it cannot execute DDL. The current direct
`DATABASE_URL` host did not resolve from this session, and `supabase db query
--linked` reports that the Supabase CLI has no access token. Applying the
versioned migration to the live database therefore requires a reachable
Postgres pooler connection in `.env.local` or a completed `supabase login`.

## Alternatives considered

- A separate category table was rejected because categories are already plain
  text in `tools.category`, and the requested inline add flow can persist new
  values through tool creation.
- Supabase on-demand image transformations were rejected for upload
  compression because they optimize served responses without replacing the
  original Storage object. This design compresses files before persistence.

## References

- [Supabase database migrations](https://supabase.com/docs/guides/deployment/database-migrations)
- [Supabase Data API exposure change](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically)
- [Supabase Postgres connections](https://supabase.com/docs/guides/database/connecting-to-postgres)
