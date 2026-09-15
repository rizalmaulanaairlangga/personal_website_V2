import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';

const root = path.resolve('C:/Rizal_IT_B/Portofolio/Coba UI/personal website');
const exportRoot = 'C:/Rizal_IT_B/Portofolio/Coba UI/notion_export';
const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || fs.readFileSync(path.join(root, '.env.local'), 'utf8').match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || fs.readFileSync(path.join(root, '.env.local'), 'utf8').match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim();

if (!supaUrl || !serviceKey) {
  console.error('Missing SUPABASE URL or SERVICE_ROLE_KEY');
  process.exit(1);
}
const supabase = createClient(supaUrl, serviceKey);
const PROJECT_REF = 'awirklcfkguisnfkxary';

function sanitize(s){ if(!s) return 'untitled'; return s.replace(/[\\/:*?"<>|]/g,'_').replace(/[\x00-\x1F]/g,'_').trim().slice(0,80) || 'untitled'; }

// Load manifest (handle BOM)
const manifestPath = path.join(exportRoot, 'download_manifest.json');
let manifestRaw = fs.readFileSync(manifestPath, 'utf8');
if (manifestRaw.charCodeAt(0) === 0xFEFF) manifestRaw = manifestRaw.slice(1);
const manifest = JSON.parse(manifestRaw);
console.log(`Manifest total ${manifest.length} files`);

// Filter: skip Proyek_Logika
const filteredManifest = manifest.filter(m => m.db !== 'Proyek_Logika');
console.log(`Filtered (skip Proyek_Logika): ${filteredManifest.length} files (expected 54)`);

// Map bucket
function bucketFor(db){
  if (db === 'Tools') return 'portfolio-tools';
  if (db === 'Prestasi_Akademik' || db === 'Prestasi_NonAkademik') return 'portfolio-prestasi';
  if (db === 'Proyek_Web' || db === 'Proyek_Web_Kolaborasi') return 'portfolio-proyek';
  return null;
}

// Upload files
let uploaded = 0;
let failed = 0;
const fileMap = new Map(); // key: db|title|prop|filename -> {storage_path, public_url}

for (const item of filteredManifest) {
  const bucket = bucketFor(item.db);
  if (!bucket) continue;
  // dest is absolute path like C:\...\assets\Tools\Railway\logo\file.png
  const localPath = item.dest;
  if (!fs.existsSync(localPath)) {
    // try alternative: assets folder maybe with forward slashes
    console.warn(`Missing local file: ${localPath}`);
    failed++;
    continue;
  }
  let rel = path.relative(path.join(exportRoot, 'assets'), localPath).replace(/\\/g, '/'); // e.g., Tools/Railway/logo/file.png
  // Sanitize storage path: Supabase disallows curly quotes and some unicode; replace anything not safe
  // Keep ASCII letters, numbers, / . _ - and space, replace others with _
  rel = rel.replace(/[“”"']/g, '_').replace(/[^\x20-\x7E]/g, '_').replace(/[<>:"|?*\\]/g, '_');
  const storagePath = rel; // e.g., Tools/Railway/logo/11zon_cropped.png
  const buffer = fs.readFileSync(localPath);
  // Determine content type by extension
  const ext = path.extname(localPath).toLowerCase();
  let contentType = 'application/octet-stream';
  if (ext === '.png') contentType = 'image/png';
  else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
  else if (ext === '.pdf') contentType = 'application/pdf';
  else if (ext === '.svg') contentType = 'image/svg+xml';

  const { error } = await supabase.storage.from(bucket).upload(storagePath, buffer, {
    contentType,
    upsert: true
  });
  if (error) {
    console.error(`Upload FAIL ${bucket}/${storagePath}:`, error.message);
    failed++;
  } else {
    uploaded++;
    const publicUrl = `${supaUrl}/storage/v1/object/public/${bucket}/${storagePath}`;
    const key = `${item.db}|${item.title}|${item.prop}|${item.file}`;
    fileMap.set(key, { storage_path: storagePath, public_url: publicUrl, bucket, file: item.file });
    if (uploaded % 10 === 0) console.log(`Uploaded ${uploaded}/${filteredManifest.length} ...`);
  }
}
console.log(`Upload done: ${uploaded} ok, ${failed} fail`);

// Helper to find file for a row
function findFile(db, title, prop) {
  // find first entry matching db+title+prop
  for (const [k,v] of fileMap.entries()) {
    const [kDb, kTitle, kProp] = k.split('|');
    if (kDb === db && kTitle === title && kProp === prop) return v;
  }
  return null;
}
function findFileFallback(db, title, prop) {
  // try without exact prop match (e.g., File vs Files)
  for (const [k,v] of fileMap.entries()) {
    const [kDb, kTitle] = k.split('|');
    if (kDb === db && kTitle === title) {
      // if prop contains File but kProp also contains File
      if (k.includes(prop) || prop.includes(k.split('|')[2])) return v;
    }
  }
  return null;
}

// Clear existing data (optional for re-run)
console.log('\nClearing existing rows...');
for (const t of ['tools','prestasi_akademik','prestasi_nonakademik','proyek_web']) {
  const { error } = await supabase.from(t).delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) console.warn(`Clear ${t}:`, error.message);
  else console.log(`Cleared ${t}`);
}

// Seed Tools (12)
console.log('\nSeeding tools...');
let toolsCsv = fs.readFileSync(path.join(exportRoot, 'Tools.csv'), 'utf8');
if (toolsCsv.charCodeAt(0) === 0xFEFF) toolsCsv = toolsCsv.slice(1);
const toolsRows = parse(toolsCsv, { columns: true, skip_empty_lines: true, bom: true });
let toolsInserted = 0;
for (const r of toolsRows) {
  const title = r.Name;
  const logoInfo = findFile('Tools', title, 'logo');
  const payload = {
    notion_id: r.id,
    name: r.Name,
    tool_id: r.tool_id ? parseInt(r.tool_id) : null,
    short_desc: r.short_desc,
    logo_file_name: r.logo || (logoInfo?.file || null),
    logo_storage_path: logoInfo ? `${logoInfo.bucket}/${logoInfo.storage_path}` : null,
    logo_public_url: logoInfo?.public_url || null,
    notion_url: r.url,
    created_time: r.created_time || null,
    updated_time: r.last_edited_time || null
  };
  const { error } = await supabase.from('tools').insert(payload);
  if (error) console.error(`Insert tools ${title}:`, error.message);
  else toolsInserted++;
}
console.log(`Tools inserted: ${toolsInserted}/${toolsRows.length}`);

// Seed Prestasi_Akademik (9)
console.log('\nSeeding prestasi_akademik...');
let akademikCsv = fs.readFileSync(path.join(exportRoot, 'Prestasi_Akademik.csv'), 'utf8');
if (akademikCsv.charCodeAt(0) === 0xFEFF) akademikCsv = akademikCsv.slice(1);
const akademikRows = parse(akademikCsv, { columns: true, skip_empty_lines: true, bom: true });
let akademikInserted = 0;
for (const r of akademikRows) {
  const title = r.Name;
  if (!title) continue;
  const fotoInfo = findFile('Prestasi_Akademik', title, 'Foto');
  const fileInfo = findFile('Prestasi_Akademik', title, 'File');
  const payload = {
    notion_id: r.id,
    name: r.Name,
    date: r.Date || null,
    status: r.Status,
    foto_file_name: r.Foto || (fotoInfo?.file || null),
    foto_storage_path: fotoInfo ? `${fotoInfo.bucket}/${fotoInfo.storage_path}` : null,
    foto_public_url: fotoInfo?.public_url || null,
    file_file_name: r.File || (fileInfo?.file || null),
    file_storage_path: fileInfo ? `${fileInfo.bucket}/${fileInfo.storage_path}` : null,
    file_public_url: fileInfo?.public_url || null,
    terbaik: r.Terbaik === 'True' || r.Terbaik === 'true',
    notion_url: r.url,
    created_time: r.created_time || null,
    updated_time: r.last_edited_time || null
  };
  const { error } = await supabase.from('prestasi_akademik').insert(payload);
  if (error) console.error(`Insert akademik ${title}:`, error.message);
  else akademikInserted++;
}
console.log(`Akademik inserted: ${akademikInserted}/${akademikRows.length}`);

// Seed Prestasi_NonAkademik (11)
console.log('\nSeeding prestasi_nonakademik...');
let nonAkademikCsv = fs.readFileSync(path.join(exportRoot, 'Prestasi_NonAkademik.csv'), 'utf8');
if (nonAkademikCsv.charCodeAt(0) === 0xFEFF) nonAkademikCsv = nonAkademikCsv.slice(1);
const nonRows = parse(nonAkademikCsv, { columns: true, skip_empty_lines: true, bom: true });
let nonInserted = 0;
for (const r of nonRows) {
  const title = r.Name || '';
  // skip if id is placeholder empty row? Keep it but with null name
  const fotoInfo = findFile('Prestasi_NonAkademik', title || r.id, 'Foto') || (title ? findFile('Prestasi_NonAkademik', title, 'Foto') : null);
  // Files column: search prop Files
  let filesInfo = null;
  if (title) filesInfo = findFile('Prestasi_NonAkademik', title, 'Files');
  // fallback scan manifest for this title
  if (!fotoInfo && title) {
    for (const [k,v] of fileMap.entries()) {
      if (k.startsWith(`Prestasi_NonAkademik|${title}|Foto`)) { fotoInfo = v; break; }
    }
  }
  if (!filesInfo && title) {
    for (const [k,v] of fileMap.entries()) {
      if (k.startsWith(`Prestasi_NonAkademik|${title}|Files`)) { filesInfo = v; break; }
    }
  }
  const payload = {
    notion_id: r.id,
    name: r.Name || null,
    date: r.Date || null,
    status: r.Status || null,
    foto_file_name: r.Foto || (fotoInfo?.file || null),
    foto_storage_path: fotoInfo ? `${fotoInfo.bucket}/${fotoInfo.storage_path}` : null,
    foto_public_url: fotoInfo?.public_url || null,
    files_file_name: r.Files || (filesInfo?.file || null),
    files_storage_path: filesInfo ? `${filesInfo.bucket}/${filesInfo.storage_path}` : null,
    files_public_url: filesInfo?.public_url || null,
    terbaik: r.Terbaik === 'True',
    link: r.Link === 'True',
    link_lainnya: r['Link lainnya'] || null,
    notion_url: r.url,
    created_time: r.created_time || null,
    updated_time: r.last_edited_time || null
  };
  const { error } = await supabase.from('prestasi_nonakademik').insert(payload);
  if (error) console.error(`Insert non ${title || r.id}:`, error.message);
  else nonInserted++;
}
console.log(`NonAkademik inserted: ${nonInserted}/${nonRows.length}`);

// Seed proyek_web merged (4)
console.log('\nSeeding proyek_web (merged)...');
let proyekWebCsv = fs.readFileSync(path.join(exportRoot, 'Proyek_Web.csv'), 'utf8');
if (proyekWebCsv.charCodeAt(0) === 0xFEFF) proyekWebCsv = proyekWebCsv.slice(1);
const proyekWebRows = parse(proyekWebCsv, { columns: true, skip_empty_lines: true, bom: true });
let kolabCsv = fs.readFileSync(path.join(exportRoot, 'Proyek_Web_Kolaborasi.csv'), 'utf8');
if (kolabCsv.charCodeAt(0) === 0xFEFF) kolabCsv = kolabCsv.slice(1);
const kolabRows = parse(kolabCsv, { columns: true, skip_empty_lines: true, bom: true });

let proyekInserted = 0;
const allProyek = [
  ...kolabRows.map(r => ({ ...r, source: 'kolaborasi', db: 'Proyek_Web_Kolaborasi' })),
  ...proyekWebRows.map(r => ({ ...r, source: 'personal', db: 'Proyek_Web' }))
];
for (const r of allProyek) {
  const title = r.Name;
  const fotoInfo = findFile(r.db, title, 'Foto');
  const payload = {
    notion_id: r.id,
    name: r.Name,
    description: r.Description,
    date: r.Date || null,
    foto_file_name: r.Foto || (fotoInfo?.file || null),
    foto_storage_path: fotoInfo ? `${fotoInfo.bucket}/${fotoInfo.storage_path}` : null,
    foto_public_url: fotoInfo?.public_url || null,
    link_web: r.LinkWeb,
    repo_link: r.RepoLink,
    terbaik: r.Terbaik === 'True',
    source: r.source,
    notion_url: r.url,
    created_time: r.created_time || null,
    updated_time: r.last_edited_time || null
  };
  const { error } = await supabase.from('proyek_web').insert(payload);
  if (error) console.error(`Insert proyek ${title}:`, error.message);
  else proyekInserted++;
}
console.log(`Proyek_web inserted: ${proyekInserted}/${allProyek.length}`);

console.log('\n=== SEED COMPLETE ===');
console.log(`Uploaded files: ${uploaded}`);
console.log(`Tools: ${toolsInserted}, Akademik: ${akademikInserted}, Non: ${nonInserted}, Proyek: ${proyekInserted}`);
