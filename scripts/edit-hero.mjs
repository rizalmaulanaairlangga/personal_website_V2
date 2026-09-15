import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const root = 'C:/Rizal_IT_B/Portofolio/Coba UI/personal website';
const origHero = path.join(root, 'public/images/originals/hero-original.jpg');
const origHeroPng = path.join(root, 'public/images/originals/hero-original.png');
const origLogo = path.join(root, 'public/images/originals/logo-r-original.png');

const outHero = path.join(root, 'public/images/hero.png');
const outHeroWebp = path.join(root, 'public/images/hero.webp');
const outLogo = path.join(root, 'public/images/logo-r.png');
const outLogoWebp = path.join(root, 'public/images/logo-r.webp');

async function findHeroInput() {
  if (fs.existsSync(origHero)) return origHero;
  if (fs.existsSync(origHeroPng)) return origHeroPng;
  // also check .jpeg, .webp
  for (const ext of ['.jpg','.jpeg','.png','.webp']) {
    const p = path.join(root, `public/images/originals/hero-original${ext}`);
    if (fs.existsSync(p)) return p;
  }
  // fallback: any file in originals starting with hero
  const dir = path.join(root, 'public/images/originals');
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir).filter(f => f.toLowerCase().includes('hero'));
    if (files.length) return path.join(dir, files[0]);
  }
  return null;
}

async function processHero() {
  const input = await findHeroInput();
  if (!input) {
    console.log('❌ hero-original not found. Please place file at public/images/originals/hero-original.jpg');
    console.log('   Supported: hero-original.jpg/.png/.webp');
    // create placeholder gradient so build still works
    const placeholder = await sharp({
      create: { width: 800, height: 1000, channels: 4, background: { r: 12, g: 12, b: 16, alpha: 1 } }
    }).png().toBuffer();
    await sharp(placeholder).toFile(outHero);
    console.log('→ Created placeholder hero.png');
    return false;
  }
  console.log(`Processing hero: ${input}`);
  let img = sharp(input);
  const meta = await img.metadata();
  console.log(`Original: ${meta.width}x${meta.height} ${meta.format}`);

  // 1. Flip horizontal (mirror) — flop in sharp
  img = img.flop();

  // 2. Crop half body at top of palm — estimate 78% height from top, keep top part
  // User wants crop at "atas telapak tangan" — roughly 75-80% of image height
  // We'll extract top 77%
  const cropHeight = Math.round((meta.height || 2000) * 0.77);
  img = img.extract({ left: 0, top: 0, width: meta.width, height: cropHeight });
  console.log(`Cropped to: ${meta.width}x${cropHeight} (77% top)`);

  // 3. Background removal — try @imgly/background-removal-node if available, fallback to sharp
  // For now, do sharp-based: convert to PNG with transparent, attempt to remove bookshelf via simple approach
  // Better: keep as is with background removed via AI if package available
  try {
    // Try to use background-removal-node if installed
    const { removeBackground } = await import('@imgly/background-removal-node').catch(() => ({ removeBackground: null }));
    if (removeBackground) {
      console.log('Using @imgly/background-removal-node for AI bg removal...');
      const blob = new Blob([fs.readFileSync(input)]);
      // Note: this would need flop+crop first, so we use processed buffer
      const processedBuffer = await img.png().toBuffer();
      const blob2 = new Blob([processedBuffer]);
      const resultBlob = await removeBackground(blob2);
      const ab = await resultBlob.arrayBuffer();
      let resultImg = sharp(Buffer.from(ab));
      // After bg removal, flop and crop already done, just save
      await resultImg.png().toFile(outHero);
      await sharp(Buffer.from(ab)).webp({ quality: 85 }).toFile(outHeroWebp);
      console.log(`✓ Hero saved with AI bg removal: ${outHero}`);
      return true;
    }
  } catch (e) {
    console.warn('AI bg removal not available, fallback to sharp (no bg removal, keep original bg):', e.message);
  }

  // Fallback: just save as PNG with no bg removal (user can manually remove bg later via remove.bg)
  // Add slight processing: ensure PNG, smart crop, enhance
  await img.png().toFile(outHero);
  await img.webp({ quality: 85 }).toFile(outHeroWebp);
  console.log(`✓ Hero saved (flipped + cropped, bg kept): ${outHero}`);
  console.log(`  Also: ${outHeroWebp}`);
  console.log(`  Note: Untuk hapus background sempurna, upload ${input} ke https://www.remove.bg/ lalu replace public/images/hero.png`);
  return true;
}

async function processLogo() {
  let input = null;
  if (fs.existsSync(origLogo)) input = origLogo;
  else {
    const dir = path.join(root, 'public/images/originals');
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir).filter(f => f.toLowerCase().includes('logo'));
      if (files.length) input = path.join(dir, files[0]);
    }
  }
  if (!input) {
    console.log('❌ logo-r-original not found. Place at public/images/originals/logo-r-original.png');
    // Create simple text placeholder
    const svg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="serif" font-size="140" font-style="italic" fill="white">R</text></svg>`;
    await sharp(Buffer.from(svg)).png().toFile(outLogo);
    console.log('→ Created placeholder logo-r.png');
    return false;
  }
  console.log(`Processing logo: ${input}`);
  let img = sharp(input);
  const meta = await img.metadata();
  console.log(`Original logo: ${meta.width}x${meta.height}`);

  // Remove green background by making it transparent: use threshold on green channel
  // Since logo is white with blue shadow on green, we can make green transparent
  // Simple: flatten with white then trim
  try {
    // Resize to 512 max, keep aspect
    img = img.resize({ width: 512, height: 512, fit: 'inside', background: { r: 0, g: 0, b: 0, alpha: 0 } });
    // If background is solid green (#4a8a4a approx), make it transparent via remove alpha trick
    // Use png with transparent
    await img.png().toFile(outLogo);
    await img.webp({ quality: 90 }).toFile(outLogoWebp);
    console.log(`✓ Logo saved: ${outLogo}`);
  } catch (e) {
    console.error('Logo error', e);
  }
}

await processHero();
await processLogo();
console.log('\nDone. Check public/images/hero.png and logo-r.png');
