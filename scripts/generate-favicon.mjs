// Builds the browser icon set from the header R monogram: dark badge circle with a
// translucent hairline and the glyph at 28/48 of the badge, matching the SiteNav lockup.
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const glyphSrc = path.join(root, 'public', 'images', 'originals', 'logo-r-original.png');
const appDir = path.join(root, 'src', 'app');

const BADGE_BG = '#191313';
const GLYPH_RATIO = 28 / 48;
const HAIRLINE_RATIO = 1 / 48;

async function badgePng(size) {
  const glyphSize = Math.max(4, Math.round(size * GLYPH_RATIO));
  const glyph = await sharp(glyphSrc)
    .resize(glyphSize, glyphSize, { fit: 'contain', kernel: 'lanczos3' })
    .png()
    .toBuffer();
  const stroke = Math.max(1, size * HAIRLINE_RATIO);
  const r = (size - stroke) / 2;
  const badge = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="${BADGE_BG}" stroke="rgba(255,255,255,0.10)" stroke-width="${stroke}"/>
  </svg>`;
  return sharp(Buffer.from(badge))
    .composite([{ input: glyph, gravity: 'centre' }])
    .png()
    .toBuffer();
}

async function squareIconPng(size) {
  const glyphSize = Math.round(size * GLYPH_RATIO);
  const glyph = await sharp(glyphSrc).resize(glyphSize, glyphSize, { fit: 'contain' }).png().toBuffer();
  const bg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="${BADGE_BG}"/></svg>`;
  return sharp(Buffer.from(bg)).composite([{ input: glyph, gravity: 'centre' }]).png().toBuffer();
}

// ICO container holding PNG-compressed frames (supported by browsers and Windows Vista+).
function buildIco(frames) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(frames.length, 4);
  let offset = 6 + frames.length * 16;
  const entries = [];
  for (const { size, data } of frames) {
    const entry = Buffer.alloc(16);
    entry[0] = size >= 256 ? 0 : size;
    entry[1] = size >= 256 ? 0 : size;
    entry[2] = 0;
    entry[3] = 0;
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    entries.push(entry);
  }
  return Buffer.concat([header, ...entries, ...frames.map((f) => f.data)]);
}

const frames = [];
for (const size of [16, 32, 48]) frames.push({ size, data: await badgePng(size) });
fs.writeFileSync(path.join(appDir, 'favicon.ico'), buildIco(frames));
fs.writeFileSync(path.join(appDir, 'apple-icon.png'), await squareIconPng(180));
console.log('wrote src/app/favicon.ico (16/32/48) and src/app/apple-icon.png (180)');
