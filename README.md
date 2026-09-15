# Personal Website — Supabase Backend

Project Supabase: **portofolio-rizal** (`awirklcfkguisnfkxary`) — `ap-southeast-1` (Singapore) — `ACTIVE_HEALTHY`

## Stack
- Supabase Postgres 17.6, Storage (public buckets)
- Next.js skeleton (belum ada UI, siap untuk build personal website)

## Database: 4 Tabel (sesuai request)
- `tools` — 12 rows (dari Notion Tools, `tool_id 1-12`)
- `prestasi_akademik` — 9 rows
- `prestasi_nonakademik` — 11 rows (1 row kosong bawaan Notion, `name=null`)
- `proyek_web` — 4 rows (merge `Proyek_Web` 2 + `Proyek_Web_Kolaborasi` 2, kolom `source` = `kolaborasi`/`personal`)
- ❌ `Proyek_Logika` diabaikan sesuai instruksi

Semua tabel RLS `public read` (anon `SELECT` true), write via `service_role`.

## Storage: 3 Bucket Public
- `portfolio-tools` — 12 files (logo png)
- `portfolio-prestasi` — 37 files (Foto png/jpg + File pdf)
- `portfolio-proyek` — 4 files (Foto png)
- Total 53 files terverifikasi via SQL `storage.objects` (manifest 54, 1 file kosong legit dari row tanpa judul)
- Public URL pattern: `https://awirklcfkguisnfkxary.supabase.co/storage/v1/object/public/<bucket>/<path>`

Contoh:
- Tools: `https://awirklcfkguisnfkxary.supabase.co/storage/v1/object/public/portfolio-tools/Tools/Railway/logo/11zon_cropped.png` (200 OK, 16KB)
- Akademik: `portfolio-prestasi/Prestasi_Akademik/Samsung Innovation Campus Batch 6/File/Sertifikat...pdf`

## Env
Lihat `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://awirklcfkguisnfkxary.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_PROJECT_REF=awirklcfkguisnfkxary
DATABASE_URL=postgresql://postgres.awirklcfkguisnfkxary:***@db.awirklcfkguisnfkxary.supabase.co:5432/postgres
```
Jangan commit `.env.local`. `.env.example` sudah ada.

## Struktur Repo
```
personal website/
  supabase/migrations/
    20260913000001_portfolio_schema.sql  — 4 tabel + RLS + index
    20260913000002_storage.sql          — 3 bucket + policies
  scripts/
    run-sql.mjs          — helper Management API
    seed-supabase.mjs    — upload 54 file + insert 36 row (idempotent)
    verify-supabase.mjs  — cek counts, anon read, storage, public URL
  notion_export/          — symlink/copy sumber? asli di ../notion_export
  .env.local / .env.example
```

## Cara Pakai
```bash
# install
npm install

# seed ulang (idempotent, upsert)
node scripts/seed-supabase.mjs

# verifikasi
node scripts/verify-supabase.mjs

# query via supabase-js (anon read ok)
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
const { data } = await supabase.from('tools').select('*').order('tool_id')
```

## Dashboard
https://supabase.com/dashboard/project/awirklcfkguisnfkxary

## Catatan Migrasi
- CSV dan assets dari Notion di `C:\Rizal_IT_B\Portofolio\Coba UI\notion_export\` (60 file, 12.94 MB, expiry S3 sudah lewat — sekarang di Supabase permanen)
- Sanitized storage path: `”` → `_` agar lolos `Invalid key` Supabase
- `proyek_web.source` untuk bedakan kolaborasi vs personal
- Tools `logo_storage_path` disimpan sebagai `bucket/path`, `logo_public_url` full URL

Next step: build UI personal website (Next.js) baca 4 tabel ini via `supabase-js` anon.
