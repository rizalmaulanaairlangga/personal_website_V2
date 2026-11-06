# Plan: Sync screenshots, gallery fix, button, Notion removal, quotes

- [ ] 1. Storage + DB sync: upload tablet + renamed desktop-<slug>, delete desktop1/desktop2/old desktop3, update `project_screenshots`, verify listing + rows.
- [ ] 2. Gallery bug: reproduce with Playwright (first load, client nav, back nav), fix root cause in ScreenshotGallery.
- [ ] 3. Move Visit Live Site button below gallery in `src/app/work/[slug]/page.js`.
- [ ] 4. Remove notion_id / notion_url: frontend check, scripts, DB migration via psql, verify queries.
- [ ] 5. Team quotes for assetrack-3d-landing-page + absensi-muda-mudi-gemurung-2 (research local projects + live sites).
- [ ] 6. Verification: lint, build, Playwright gallery/button/quote checks, final report.
