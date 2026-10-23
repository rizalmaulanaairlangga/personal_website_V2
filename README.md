# Portfolio CMS

A private admin interface for the projects published on the public portfolio site.

It is a **separate application** with its own repository and its own Vercel
project, but it reads and writes the **same Supabase database and Storage
bucket** that the public portfolio uses. The public site is not modified by
anything that happens here — the CMS writes records in the exact shape the
public site already expects, and the site picks them up on its next data
refresh.

---

## What it manages

| CMS concept | Database column | Storage path |
|---|---|---|
| Project name | `proyek_web.name` | — |
| Slug | `proyek_web.slug` | — |
| Short description | `proyek_web.description` | — |
| Hero subtitle | `proyek_web.hero_subtitle` | — |
| Category | `proyek_web.project_type` | — |
| Project date | `proyek_web.date` | — |
| Development period | `proyek_web.timeframe` | — |
| Client / context | `proyek_web.project_context` | — |
| Origin | `proyek_web.source` | — |
| Technologies | `proyek_web.frameworks` | — |
| Overview / process / result | `proyek_web.brief`, `.challenge`, `.solution` | — |
| Team & roles | `proyek_web.credits` | — |
| Team quote | `proyek_web.team_quote` | — |
| Live URL | `proyek_web.link_web` | — |
| Repository URL | `proyek_web.repo_link` | — |
| Screenshot layout | `proyek_web.screenshot_layout` (`responsive` or `mobile_only`) | — |
| Hero image | `proyek_web.foto_public_url` / `.foto_storage_path` / `.foto_file_name` | `<Project Name>/Foto/hero-<slug>.<ext>` |
| Mobile screenshots | `project_screenshots` rows, `view_type = 'mobile'`, `sort_order = 0–2` | `<Project Name>/Foto/mobile-<slug>.<ext>` |
| Tablet image | `project_screenshots` row, `view_type = 'tablet'` | `<Project Name>/Foto/tablet-<slug>.<ext>` |
| Desktop Additional image | `project_screenshots` row, `view_type = 'desktop'` | `<Project Name>/Foto/desktop-<slug>.<ext>` |

The hero image is shown as a phone mockup for `mobile_only` projects. The
existing `mobile` screenshot role supports up to three additional screenshots,
ordered by `sort_order`; tablet and desktop roles remain unchanged.

The Storage bucket is the existing public bucket `portfolio-proyek`. Files are
stored under the project folder that already exists for that project, so the
CMS writes alongside the assets that are already there.

The legacy `proyek_web.gallery` column is left untouched. The public project
page reads `project_screenshots`, which is what the CMS writes.

### AI prompt and JSON import

The project form starts with the AI prompt copy action and a JSON import field.
Paste the JSON object returned by the prompt and choose **Apply JSON to form**
to populate project metadata. The CMS validates required fields, dates, URLs,
and origin values before applying anything; it does not save automatically.
Blank or omitted values leave current form values unchanged. An explicitly
blank date clears the prefilled date on a new project so an unknown date is not
saved as today's date. Screenshot files are managed separately and are not
modified by a JSON import.

### Database migration

Apply `supabase/migrations/20261022033231_add_project_screenshot_layout.sql`
from the public portfolio repository before using the layout selector. This
additive migration adds `proyek_web.screenshot_layout` with a `responsive`
default and marks existing projects as `mobile_only` only when they have mobile
screenshots and no tablet or desktop screenshots.

---

## Requirements

- Node.js 18 or newer
- Access to the existing Supabase project
- A Supabase Auth user (email + password) for the CMS

---

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in the real values
npm run dev
```

The app starts on <http://localhost:3000>.

### Environment variables

| Variable | Where it runs | What it is |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | browser + server | Your Supabase project URL, e.g. `https://<ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser + server | The anon/public key. RLS still applies to it. |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | The service-role key. Used for privileged reads/writes and Storage uploads. Never prefix it with `NEXT_PUBLIC_`. |

`.env.local` is already in `.gitignore`. Do not commit real keys.

---

## Supabase setup

### 1. Create the admin user

In the Supabase dashboard: **Authentication → Users → Add user**.

- Set an email and a password.
- Tick **Auto Confirm User** so the account is usable immediately.
- If email confirmation is enabled on the project, the user must confirm before
  the first sign-in.

### 2. Row Level Security

The CMS authenticates every request and then acts with the service-role key, so
RLS does not gate the CMS itself. It still gates the **public portfolio**, which
reads with the anon key.

Recommended for `proyek_web` and `project_screenshots`:

- Keep the tables behind RLS with a read policy for `anon` (the portfolio needs
  to read them) and no write policy for `anon` or `authenticated`.
- The public portfolio only ever reads, so no client should be able to insert
  or update rows.

Example — read-only access for the public site:

```sql
-- run once in the Supabase SQL editor
alter table public.proyek_web enable row level security;
alter table public.project_screenshots enable row level security;

create policy "public read projects"
  on public.proyek_web for select
  using (true);

create policy "public read screenshots"
  on public.project_screenshots for select
  using (true);
```

There is deliberately **no** insert/update/delete policy for `anon` or
`authenticated`, so a leaked anon key cannot write to the table.

### 3. Storage

The `portfolio-proyek` bucket is already public, which is what the portfolio
relies on when it renders `foto_public_url` and the screenshot paths. No
change is needed. If you ever make the bucket private, the public site would
need signed URLs — that is a separate change and out of scope here.

---

## Deployment to a separate Vercel project

The CMS deploys independently of the public portfolio.

1. Push this directory to its own repository (it is not a subfolder of the
   portfolio repo).
2. In Vercel, **Add New → Project** and import that repository. Do not reuse
   the portfolio's Vercel project.
3. Under **Settings → Environment Variables**, add all three variables for
   **Production**, **Preview**, and **Development** as needed:

   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   ```

4. Deploy. Vercel detects Next.js automatically; no build settings needed.
5. The CMS gets a URL like `https://<project>-<hash>.vercel.app`. You can
   attach a custom domain under **Settings → Domains**.

### After deploying

- Visit the URL. You should land on the login page.
- Sign in with the Supabase Auth user you created.
- The public portfolio is unaffected — it keeps reading the same rows.

---

## Security notes

- Every page and every API route is behind a session check. Unauthenticated
  requests are redirected to `/login`; API routes answer `401`.
- The service-role key is read only on the server. It is never sent to the
  browser and is never logged.
- Route handlers that touch the database or Storage re-verify the session
  before doing anything, so a middleware gap cannot expose the data.
- The delete endpoint for Storage refuses any path that does not start with
  the target project's own folder and checks that the object is no longer
  referenced before deleting it, so one project cannot delete another's files
  or remove an asset still in use.
- Deleting a project removes its database row and its `project_screenshots`
  rows. The Storage objects are **left in place** on purpose — a folder may
  still be referenced by legacy rows. Prune the bucket separately once you
  have confirmed a folder is unused.

---

## Verification scripts

`scripts/` holds three checks that exercise the running application against
the real database and the real Storage bucket. They create and remove their
own test records, and clean up after themselves.

```bash
# start the app first
npm run dev

# in another shell
export CMS_ADMIN_EMAIL="you@example.com"
export CMS_ADMIN_PASSWORD="your-password"
export CMS_BASE="http://localhost:3000"

python scripts/verify_cms.py       # auth, CRUD, uploads, replacement, removal, deletion
python scripts/verify_failure.py   # a failed write releases the objects it uploaded
python scripts/verify_ui.py        # tooltips, slug validation, preview, responsive layout
```

`verify_ui.py` needs Playwright with Chromium:

```bash
pip install playwright pillow
playwright install chromium
```

The scripts read `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
and `SUPABASE_SERVICE_ROLE_KEY` from `.env.local` so they can confirm the
bucket state directly. The service-role key is used by the checks only, never
by the application.

---

## Commands

```bash
npm run dev       # start the dev server
npm run build     # production build
npm run start     # serve the production build
npm run lint      # eslint
npm run typecheck # tsc --noEmit
```
