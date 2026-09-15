# Letakkan file asli di sini

1. Foto hero asli (Image 1 - jas hitam, dasi ungu, background rak buku):
   -> simpan sebagai  public/images/originals/hero-original.jpg
   -> atau .png

2. Logo R (Image 2 - huruf R putih biru):
   -> simpan sebagai  public/images/originals/logo-r-original.png

Setelah itu jalankan:  npm run edit:images
Atau:  node scripts/edit-hero.mjs

Script akan: flip horizontal (mirror), hapus background (jadi PNG transparan), crop setengah badan di atas telapak tangan.
Output: public/images/hero.png  (siap pakai di landing)  dan  public/images/logo-r.png
