import sharp from 'sharp';

const heroSvg = `<svg width="800" height="1000" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#1E1E24"/>
  <rect x="40" y="40" width="720" height="920" fill="none" stroke="#3A3A44" stroke-width="2" stroke-dasharray="12 8"/>
  <text x="50%" y="44%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="18" fill="#9A9AA0">HERO PLACEHOLDER</text>
  <text x="50%" y="49%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#6A6A72">copy foto asli ke</text>
  <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="10" fill="#E8E8EA">public/images/originals/hero-original.jpg</text>
  <text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#9A9AA0">lalu: npm run edit:images</text>
  <text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#5A5A64">flip horizontal + hapus bg + crop 77%</text>
</svg>`;

await sharp(Buffer.from(heroSvg)).png().toFile('public/images/hero.png');
await sharp(Buffer.from(heroSvg)).webp({quality:85}).toFile('public/images/hero.webp');
console.log('hero recreated');

const logoSvg = `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0F0F13" rx="256"/>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="serif" font-size="280" font-style="italic" font-weight="700" fill="white">R</text>
  <text x="50%" y="82%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="14" fill="#9A9AA0">RIZAL ®</text>
</svg>`;

await sharp(Buffer.from(logoSvg)).png().toFile('public/images/logo-r.png');
await sharp(Buffer.from(logoSvg)).webp({quality:90}).toFile('public/images/logo-r.webp');
console.log('logo recreated');
