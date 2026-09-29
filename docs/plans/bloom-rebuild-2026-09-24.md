# Plan: Rebuild Halaman Detail Proyek Web → Referensi martin-luke.framer.website/projects/bloom

> Status: PLAN ONLY — tidak ada kode diubah. Video dipotong 1fps (13 frame) di `C:\Users\Pongo\AppData\Local\Temp\opencode\frames_bloom\` + fetch `martin-luke.framer.website/projects/bloom`.

---

## 1) Hasil Potong Video Per-Frame (13 frame, 1280x678)

**Video:** `C:\Users\Pongo\Videos\Screen Recordings\Screen Recording 2026-09-24 094602.mp4` (12MB, 13 detik) → `fps=1, scale=1280:-2` → 13 jpg (27KB–110KB).
Frame lama (`frames_detail`, `frames_gis`, `frames_sticky`, `analyze*.py`) sudah dihapus di `C:\Users\Pongo\AppData\Local\Temp\opencode\`.

| Frame | Scroll Position | Konten Terlihat |
|-------|-----------------|-----------------|
| 0001-0002 | Top (0%) | Header pill MARTIN LUKE, hero split Bloom + deskripsi |
| 0003 | Top-meta | 4 info cards (Service/Year/Timeline/Client) |
| 0004-0005 | 20% | Hero image full-width (3 tubes) parallax reveal |
| 0005-0006 | 35% | Transisi hero → testimonial sticky + Project overview |
| 0006-0009 | 45-65% | Body: kiri testimonial Sarah Chen (sticky), kanan Project overview → Project process |
| 0009-0010 | 70% | Final result |
| 0010-0011 | 80% | Gallery 2 kolom (5 tubes + open tube) |
| 0011-0013 | 90-100% | CTA footer biru "Let's design your next great package" |

---

## 2) Analisis Bloom Per-Komponen (dari frame + fetch)

### A. Global
- **BG:** `#F5F5F5` (light warm grey), bukan hitam. Semua card putih `#FFFFFF` dengan `border #EAEAEA`, `radius 14-16px`, `shadow soft 0 8px 32px rgba(0,0,0,0.06)`.
- **Header:** sticky pill `MARTIN LUKE` (avatar 24px + nama 12px medium, `rounded-full bg-white border`), kanan hamburger `rounded-full bg-white`. Tinggi ~56px, padding 6%. Tidak ada WORK/STUDIO/WHISPERS hitam.
- **Typography:** Headings `Inter/General Sans` bold tight `-0.05em`, body `14px/1.7` `text-[#111]` dan `text-[#6B6B6B]`. CTA script font untuk kata `design` (cursive italic).
- **Spacing:** `max-w 1200px`, `px 5%`, gap besar (80px section). Mobile: stack single column.

### B. Hero Split (Frame 0001)
- **Kiri:** `← All projects` 11px mono grey (12px di Figma), `Bloom` 72-96px `font-black tracking -0.05`. 
- **Kanan:** deskripsi `13px max-w 28ch text #6B6B6B line 1.5` ("Minimal skincare..."), di bawahnya pill `Contact me →` (`bg white rounded-full px 16 py 8 text 12px shadow` + blue dot arrow `#6EB4E6`).
- **Grid:** `lg:grid-cols-[1.15fr_0.85fr]`, align top. Mobile stack.

### C. Info Cards (Frame 0003)
- `grid lg:grid-cols-4 gap 12px`. Setiap card: `bg white rounded 12px p 16 border #EFEFEF`, label `10px uppercase tracking 0.12 grey #9A9A9A`, value `14px semibold #111`. (Service=Packaging Design, Year=2025, Timeline=3 Weeks, Client=Verde)

### D. Hero Image (Frame 0004-0005)
- `w-full rounded 16px overflow-hidden bg #EDEBE6` (beige warm), `aspect 16/9` di desktop, `object-cover` shadow dalam. Tidak ada overlay tech list seperti GIS sekarang. 3 tube mockup (biru, merah, ungu) diagonal dengan bayangan keras. Padding 0 — image bleed ke edge container.

### E. Body Dua Kolom (Frame 0006-0009)
- **Wrap:** `grid lg:grid-cols-[0.82fr_1.18fr] gap 40px` — kiri 1 card sticky, kanan scroll.
- **Kiri sticky:** `Testimonial card` (`bg white rounded 14px p 24 border`) — avatar 36px rounded 8px, quote 13px `text #5A5A5A leading 1.7`, footer `Sarah Chen 12px bold + Founder & CEO 11px grey + X icon rounded-full bg #F2F2F2`. `position: sticky top 80px`. Di personal website sekarang tidak ada.
- **Kanan scroll:** 3 section vertikal:
  - `h2 22px bold tracking -0.02` + `p 14px/1.7 text #555` justify left.
  - Titles: "Project overview", "Project process", "Final result" — masing 1 h2 + 1 paragraf panjang (copy dari Bloom: discovery call → refinement → production).
  - Gap antar h2: 32px top margin.
- **Gambar tidak ada di tengah body** — hanya text. Beda dengan GIS sekarang yang ada Brief/Challenge/Solution masing dengan visual.

### F. Gallery (Frame 0011)
- `grid 2 cols gap 16px mt 40`. Setiap item `rounded 14px bg #EDEBE6 overflow-hidden aspect 4/3`. Kiri 5 tube stack, kanan open tube close-up. Tidak ada border.

### G. CTA Footer (Frame 0012-0013)
- Full-width `bg #8FC6F0` (Bloom blue) `py 80 lg 120`. `Get started` 11px white/80 uppercase, `Let's *design* your next great package` 40-56px bold (design = script italic 48px blue-300), subtitle 13px white/70 max 42ch, button `Start a project →` pill white + blue arrow. Rounded top 0 — full bleed. Mobile stack center.

### H. Next CTA
- Di bawah Final result ada `Next →` 13px bold. Di Bloom link ke `/projects/roast`. Di personal website kita pakai "more projects" grid — perlu dipetakan.

---

## 3) Mapping ke Personal Website Sekarang (`src/app/work/[slug]/page.js:1` + DB)

| Bloom | Personal Website Sekarang (GIS style) | Adaptasi Plan |
|-------|----------------------------------------|---------------|
| Light theme `#F5F5F5` + white cards | Dark `#0A0A0A` Blackwell + rulers | **Ganti total** ke light Bloom. Alternatif keep dark tapi Bloom light lebih cocok untuk portfolio clean — rekomendasi ikut Bloom light (konfirmasi user). |
| Hero split Bloom + deskripsi + Contact pill | Hero sticky black 2 kol split + frameworks overlay + Visit Live Site merah | Map: `project.name` → Bloom title, `project.hero_subtitle/description` → kanan deskripsi, `link_web` → Contact/Visit pill (biru #6EB4E6, bukan merah). Hapus overlay frameworks di atas gambar, pindah ke info cards. |
| Info cards 4 (Service/Year/Timeline/Client) | Detail Umum 5 field (Built For/Project Type/Released/Technology/Timeframe) dark grid | Map 1:1 → Service=`project_type`, Year=`date→year`, Timeline=`timeframe`, Client=`project_context` (atau source). Technology/frameworks pindah ke bawah atau sebagai tags di bawah hero image? Bloom tidak show tech di cards — bisa tambah row kedua kalau mau. |
| Hero image 1 full-width beige | Hero image di kolom kanan hero (50%) + sticky layers | Pindah jadi **single full-width banner** di bawah cards (seperti Bloom). Pakai `foto_public_url`. |
| Testimonial sticky kiri | Tidak ada | Map `credits[0]` atau buat `testimonial` baru dari `project_context`? Atau pakai `credits` sebagai pengganti: avatar kosong, kutipan dari `brief/solution`. Jika tidak ada kutipan, pakai `brief.body` sebagai quote. |
| Body 3 section (overview/process/result) | Brief/Challenge/Solution + StickyIntro + Credits | Map `brief → Project overview`, `challenge → Project process`, `solution → Final result`. Tetap 3 h2, hapus StickyIntro parallax text. |
| Gallery 2 kolom | `gallery[]` (kosong sekarang) + more projects grid | Jika `gallery` kosong, tampilkan 2 card dari `foto_public_url` duplicate dengan crop berbeda atau hide gallery. `more` tetap di bawah. |
| CTA biru Let's design... | Credits beige + more projects + footer hitam | Ganti footer jadi **Bloom CTA blue**: `Let's design your next great [project]` + `Start a project` → link ke `/#contact` atau `link_web`. |

**DB fields existing yang langsung pakai:** `name, slug, description, hero_subtitle, intro_title, project_type, project_context, date, timeframe, frameworks[], tags[], brief{}, challenge{}, solution{}, credits[], foto_public_url, link_web, gallery[]`.
**Tidak perlu migration baru** untuk v1, tapi butuh fallback jika `project_context`/`timeframe` kosong.

---

## 4) Plan Implementasi (Urutan, Tanpa Ubah Kode Dulu)

### Fase 0 — Keputusan Desain (butuh jawaban user sebelum eksekusi)
1. **Theme:** Ikut Bloom light (`#F5F5F5` + white) atau keep dark? Rekomendasi: light untuk Bloom fidelity.
2. **CTA:** Pakai Bloom blue `#8FC6F0` atau sesuaikan brand personal (misal `#FF4D2E` merah existing)?
3. **Tech stack:** Tampilkan `frameworks` di mana? Opsi A: tambah card ke-5 di bawah info cards, Opsi B: sebagai pills di bawah hero image.
4. **Testimonial:** Pakai `credits` atau kosongkan? Kalau kosong, hide kiri sticky dan buat body full-width.

### Fase 1 — Struktur Baru (`src/app/work/[slug]/page.js`)
- Hapus 7 section sticky lama (hero sticky, Detail Umum sticky, StickyIntro, Brief, Challenge, Solution dark, Credits dark).
- Bangun 6 section baru sesuai Bloom:
  1. `Header` pill light (reuse `layout.js` header atau override per-page)
  2. `HeroSplit` (Back link + Title kiri, deskripsi + pill kanan)
  3. `InfoCards` (grid 4)
  4. `HeroBanner` (full width rounded image)
  5. `BodySplit` (sticky testimonial + 3 article sections)
  6. `Gallery` (if gallery.length)
  7. `MoreProjects` (grid 2) + `CTA Footer` blue

### Fase 2 — Komponen & Style
- Buat `src/app/work/[slug]/BloomSection.jsx` (optional) — body renderer untuk overview/process/result.
- Tailwind: `bg-[#F5F5F5]`, `text-[#111]`, `rounded-[14px]`, `border-[#EAEAEA]`, `shadow-[0_8px_32px_rgba(0,0,0,0.06)]`. Hapus `bg-[#0A0A0A]` dan rulers.
- Responsive: `lg:grid-cols-*` → `grid-cols-1` mobile, hero image `aspect-[16/10]` mobile.
- Aksesibilitas: kontras `#111` on `#F5F5F5` aman, link `Contact me` keyboard focus.

### Fase 3 — Data Wiring
- `WorkDetail` tetap `select *` anon, tapi mapping di JSX sesuai tabel di atas.
- `generateStaticParams/Metadata` tidak berubah.
- `more` query tetap `limit 4` — tampil 2 di gallery + 2 di Next? Atau 4 grid seperti Bloom next?

### Fase 4 — QA
- Test 6 slug existing (gis-surabaya-health, pensquiz, soulstory, survent, simple-e-commerce, copy-pens-website).
- Cek mobile 375px, tablet 768, desktop 1280 (match frame 1280).
- Hapus `StickyIntro.jsx` import jika tidak dipakai (atau keep untuk reuse lain).

---

## 5) Risiko & Catatan
- **Foto frame lama sudah dihapus** — backup tidak ada, tapi frame Bloom baru disimpan di temp (13 file, bisa dihapus setelah review).
- Video 13 detik cukup lengkap — tidak ada scroll mobile terekam, jadi estimasi mobile dari web fetch.
- Jika user ingin keep dark theme, plan perlu varian dark-Bloom (bg #0A0A0A tapi card #1A1A1A) — tidak rekomendasi karena hilang fidelity.

---

## 6) Next Step (Menunggu Approval)
1. Konfirmasi 4 jawaban Fase 0.
2. Jika approve light Bloom, eksekusi Fase 1-4 (estimasi 1 sesi, ~233 → ~180 lines page.js, - `StickyIntro`).
3. Hapus frame temp setelah approve (`frames_bloom`).

