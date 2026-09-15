# Analisis Frame-by-Frame: Nakula - Design Studio (What Can I Do)

## Sumber
- Video: `C:\Users\Pongo\Downloads\Nakula - Design Studio.mp4` (1280x720, 25fps, 367 frames ~14.7s)
- Ekstraksi: every 6 frames (62 frames) + dense 40-85, 115-155, 185-225, 255-295 per-frame untuk transisi.
- Output: `C:\Users\Pongo\AppData\Local\Temp\opencode\nakula_frames\` & `nakula_dense\` & `nakula_transitions\`

## Ringkasan Visual
- Background hitam #0a0a0a, 4 row accordion (01 Web Design & Development, 02 Branding, 03 Social Media, 04 Motion Design).
- Border horizontal 1px #ffffff ~12-15% opacity (tidak tebal, tapi terlihat karena kontras). Saat expanded, border row hovered tetap 1px, hanya jarak antar border membesar.
- Layout header Kiri "NAKULA" kanan "Available for project" mirip milik kita (kita sudah punya Services header).

## Fase Animasi (Hover 01 - detail)
**Idle (frame 0-55):** 4 row tinggi ~84-88px, `01.` 18-20px mono gray #888 + dot merah 4px, `Web Design & Development` 22-24px putih 90% right-aligned.

**Trigger (56):** Cursor masuk area row 01. Row 01 mulai expand. Di frame 56, terlihat kapsul gelap kecil (lebar ~120px, tinggi ~18px) di tengah row (x ~32% dari kiri), opacity ~15%, ini adalah image placeholder awal. Bottom border row 01 baru turun ~8px. Row 02 belum bergerak banyak.

**Ekspansi (57-62, ~0.24s, 6 frames):**
- Tinggi row 01: 88 → ~280px (3.2x). Easing: slow→fast awal, lalu fast→slow di akhir — kurva ~ `cubic-bezier(0.76,0,0.24,1)` atau `[0.42,0,0.24,1]`. Terlihat percepatan awal (frame 57-59 jarak border besar), pelambatan akhir (60-62 jarak mengecil).
- Garis border bawah row 01 bergerak turun smooth, **mendorong** row 02/03/04 ke bawah dengan translasi Y yang sama (tidak ada gap, tidak lompat). Row lain tidak berubah tinggi, hanya posisi Y.
- Nomor `01.`: 24px → ~52px, weight 500→900, color `rgba(255,255,255,0.42)` → `0.15`, scale uniform via `fontSize` (tidak `transform scale` — aspect ratio tetap). Posisi X tetap di kiri, Y tetap vertical center di expanded (sekarang di area tinggi, jadi tampak naik sedikit karena row lebih tinggi).
- Image: dari kapsul gelap → full card `~320x180 rounded 12px` putih dengan foto orang merah. Animasi: `opacity 0→1`, `scale 0.6→1` (kecil di tengah lalu membesar ke ukuran final), `y 12→0`, dan `clipPath`/`width` membesar. Di 57: lebar ~40% final, 58: 65%, 59: 85%, 60: 95%, 61: 100%. Background image fade-in bersama scale.
- Teks kanan: Judul `Web Design & Development` tetap di posisi kanan-atas expanded (tidak pindah), tapi opacity sedikit turun dari 1→0.85 saat expanded? Subtitle `Logos, colors...` + tags `Responsive Design` muncul dengan `opacity 0→1, y 8→0` stagger 40-60ms per baris, delay ~80ms setelah image mulai. Tidak patah-patah — satu blok fade.

**Settled (62-90):** Row stabil 280px, image full, teks full. Tidak ada perubahan sampai hover pindah.

**Pindah hover ke 02 (frame ~115-135):** Row 01 collapse 280→88 dengan easing sama (reverse), bersamaan row 02 expand 88→280. Kedua border bergerak simultan, terlihat seperti accordion push. Tidak ada jeda blank.

**Leave (tidak hover apapun):** Semua collapse kembali ke 88.

## Insight untuk Replikasi
- **Easing:** Nakula pakai `easeInOut` halus, bukan `easeIn` tajam. Interval 0.45-0.55s terasa pas untuk tinggi. Untuk slow→fast awal, pakai `[0.42,0,1,1]` atau `[0.76,0,0.24,1]` — keduanya slow→fast, tapi `[0.76,0,0.24,1]` lebih smooth (dipakai Framer default spring-ish).
- **Height:** Jangan pakai `display:none` + `height:auto` toggle instant. Pakai `motion.div layout` untuk outer card + `AnimatePresence` untuk inner `height:0↔auto` dengan durasi sama, agar border ikut animasi, tidak loncat.
- **Garis:** 1px tapi opacity perlu `0.22-0.28` agar terlihat (saat ini 0.20/0.24 sudah dekat, mau lebih tebal request).
- **Gambar:** Harus `scale 0.85-0.88 →1` + `opacity 0→1` + `y 10→0`. Jangan `display:none` instant — pakai `AnimatePresence` atau tetap di DOM dengan `height 0` wrapper, agar transisi terlihat membesar dari kecil, bukan tiba-tiba muncul.
- **Nomor:** `fontSize` 26→62 (desktop) dengan durasi 0.65-0.75s, easing sama, bukan `scale` (yang bikin melebar dulu). Saat ini kita sudah pakai `fontSize`, sudah benar.
- **Teks:** Sekarang kita sudah ubah ke satu blok `opacity` saja, sudah sesuai — jangan stagger terpisah.

## Rencana Implementasi (Framer Motion only)
1. Outer card: `motion.div layout transition {duration:0.6, ease:[0.76,0,0.24,1]}` — border `border-white/[0.22-0.28]`.
2. Nomor: `motion.span` `fontSize` anim `0.65s [0.76,0,0.24,1]`.
3. Collapsed title wrapper: `motion.div` `height 108↔0 opacity y` `0.6s [0.76,0,0.24,1]`.
4. Expanded wrapper: `AnimatePresence mode="wait"` + `motion.div` `height 0↔auto opacity` `0.6s [0.76,0,0.24,1]`. Di dalamnya, image `motion.div` `scale 0.85→1 opacity y`, teks `motion.div` `opacity y` tanpa stagger.
5. Image wrapper: jangan `display:none`, pakai `AnimatePresence` atau `height` clip agar scale terlihat.
6. Test: hover lambat, pindah antar card, leave — semua border bergerak smooth, tidak ada lompat.

## File Terlibat
- `src/app/page.js:588-852` `WhatCanIDo`
- `package.json:25` framer-motion sudah ada, tidak perlu install.
