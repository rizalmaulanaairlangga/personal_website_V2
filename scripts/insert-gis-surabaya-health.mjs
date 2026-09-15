import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const root = 'C:/Rizal_IT_B/Portofolio/Coba UI/personal website';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(root, '.env.local') });
const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('URL:', supaUrl);
if (!supaUrl || !serviceKey) {
  console.error('Missing env');
  process.exit(1);
}
const supabase = createClient(supaUrl, serviceKey);

const bucket = 'portfolio-proyek';
// Path pattern mengikuti existing: portfolio-proyek/Proyek_Web/GIS Surabaya Health/Foto/...
// Storage path relatif terhadap bucket: Proyek_Web/GIS Surabaya Health/Foto/GIS Surabaya Health.png
const projectName = 'GIS Surabaya Health';
const source = 'personal'; // personal | kolaborasi
const storagePathRelative = `Proyek_Web/${projectName}/Foto/GIS Surabaya Health.png`;
const fullStoragePath = `${bucket}/${storagePathRelative}`;
const publicUrl = `${supaUrl}/storage/v1/object/public/${bucket}/${storagePathRelative}`;

const localImagePath = 'C:/Users/Pongo/Downloads/GIS Surabaya Health.png';
if (!fs.existsSync(localImagePath)) {
  console.error('Gambar tidak ditemukan:', localImagePath);
  process.exit(1);
}
const buffer = fs.readFileSync(localImagePath);
console.log(`Gambar ditemukan: ${localImagePath} (${(buffer.length/1024).toFixed(0)} KB)`);

// Upload
console.log(`\nUploading ke ${bucket}/${storagePathRelative} ...`);
const { data: uploadData, error: uploadError } = await supabase.storage
  .from(bucket)
  .upload(storagePathRelative, buffer, {
    contentType: 'image/png',
    upsert: true,
  });

if (uploadError) {
  console.error('Upload error:', uploadError.message);
  process.exit(1);
}
console.log('Upload success:', uploadData.path);
console.log('Public URL:', publicUrl);

// Verify public URL accessible
try {
  const res = await fetch(publicUrl, { method: 'HEAD' });
  console.log(`HEAD ${publicUrl} -> ${res.status} ${res.headers.get('content-type')}`);
} catch (e) {
  console.warn('HEAD check failed:', e.message);
}

// Prepare insert payload
const notionId = crypto.randomUUID();
console.log('\nGenerated notion_id:', notionId);

const payload = {
  notion_id: notionId,
  name: projectName,
  description: 'Sistem Informasi Geografis (GIS) interaktif untuk menganalisis dan memvisualisasikan distribusi, kepadatan, dan rasio fasilitas kesehatan (Faskes) di seluruh kecamatan Kota Surabaya. Menampilkan peta interaktif berbasis Leaflet & React Leaflet dengan GeoJSON, tooltip/popup dinamis, skala klasifikasi warna, serta dashboard analitik premium dengan SVG Donut Chart proporsional (fixed gap), Bar & Line Chart animasi, tabel sorting multi-dimensi, dan desain Glassmorphism responsif yang optimal. Data disajikan statis dari JSON/GeoJSON tanpa backend terpisah.',
  date: '2026-09-13',
  foto_file_name: 'GIS Surabaya Health.png',
  foto_storage_path: fullStoragePath,
  foto_public_url: publicUrl,
  link_web: 'https://health-facility-gis-surabaya.vercel.app/',
  repo_link: 'https://github.com/rizalmaulanaairlangga/health-facility-gis-surabaya',
  source: source,
  notion_url: null,
  created_time: new Date().toISOString(),
  updated_time: new Date().toISOString(),
  frameworks: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Leaflet', 'React Leaflet', 'React Router', 'Axios']
};

// Check duplicate
const { data: existing } = await supabase.from('proyek_web').select('id,name').eq('name', projectName).maybeSingle();
if (existing) {
  console.log(`\nProyek dengan nama "${projectName}" sudah ada (id=${existing.id}), akan update...`);
  const { data, error } = await supabase.from('proyek_web').update(payload).eq('id', existing.id).select().single();
  if (error) {
    console.error('Update error:', error.message);
    process.exit(1);
  }
  console.log('Update success:', data);
} else {
  const { data, error } = await supabase.from('proyek_web').insert(payload).select().single();
  if (error) {
    console.error('Insert error:', error.message);
    console.error(error);
    process.exit(1);
  }
  console.log('\nInsert success:');
  console.log(JSON.stringify(data, null, 2));
}

console.log('\n=== DONE ===');
