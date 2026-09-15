import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const root = 'C:/Rizal_IT_B/Portofolio/Coba UI/personal website';
const env = fs.readFileSync(path.join(root, '.env.local'), 'utf8');
const supaUrl = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim();
const service = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)[1].trim();
const supabase = createClient(supaUrl, service);

// Frameworks determined from reading PensQuiz project
// frontend: React 19, Vite 8, Tailwind CSS 4, React Router 7, Chart.js 4, Supabase JS
// backend: ASP.NET Core 8, Dapper, Npgsql, PostgreSQL
// landing: React + Tailwind
const frameworks = ["React", "Vite", "Tailwind CSS", "React Router", "Chart.js", "ASP.NET Core", "Supabase", "PostgreSQL"];

const imagePath = 'C:/Users/Pongo/Downloads/pensquiz-frontend.png';
if (!fs.existsSync(imagePath)) {
  console.error('Image not found at', imagePath);
  process.exit(1);
}
const buffer = fs.readFileSync(imagePath);
const storagePath = 'Proyek_Web/PENSQuiz/Foto/pensquiz-frontend.png';
const bucket = 'portfolio-proyek';

console.log('Uploading image to', `${bucket}/${storagePath}`, `size=${buffer.length}`);
const { error: uploadError } = await supabase.storage.from(bucket).upload(storagePath, buffer, {
  contentType: 'image/png',
  upsert: true
});
if (uploadError) {
  console.error('Upload error', uploadError);
  process.exit(1);
}
const publicUrl = `${supaUrl}/storage/v1/object/public/${bucket}/${storagePath}`;
console.log('Public URL:', publicUrl);

// Check if already exists
const { data: existing, error: checkErr } = await supabase.from('proyek_web').select('id, name').eq('name', 'PENSQuiz').limit(1);
if (checkErr) console.error('check err', checkErr.message);
if (existing && existing.length > 0) {
  console.log('PENSQuiz already exists, updating...');
  const { data, error } = await supabase.from('proyek_web').update({
    description: 'Platform quiz interaktif untuk mahasiswa PENS dengan manajemen quiz, role dosen/mahasiswa, dashboard statistik, dan sistem tamu ephemeral (auto-hapus 12 jam). Dibangun dengan React + Vite + Tailwind di frontend, ASP.NET Core 8 + PostgreSQL (Supabase) di backend, serta landing page terpisah.',
    date: '2025-09-14',
    foto_file_name: 'pensquiz-frontend.png',
    foto_storage_path: `${bucket}/${storagePath}`,
    foto_public_url: publicUrl,
    link_web: 'https://frontend-pens-quiz.vercel.app',
    repo_link: 'https://github.com/rizalmaulanaairlangga/landing-page_PENSQuiz',
    source: 'personal',
    frameworks: frameworks,
    updated_time: new Date().toISOString()
  }).eq('id', existing[0].id).select();
  if (error) console.error('Update error', error);
  else console.log('Updated:', data);
} else {
  console.log('Inserting new proyek_web row for PENSQuiz...');
  const payload = {
    notion_id: 'manual-pensquiz-' + Date.now(),
    name: 'PENSQuiz',
    description: 'Platform quiz interaktif untuk mahasiswa PENS dengan manajemen quiz, role dosen/mahasiswa, dashboard statistik, dan sistem tamu ephemeral (auto-hapus 12 jam). Dibangun dengan React + Vite + Tailwind di frontend, ASP.NET Core 8 + PostgreSQL (Supabase) di backend, serta landing page terpisah.',
    date: '2025-09-14',
    foto_file_name: 'pensquiz-frontend.png',
    foto_storage_path: `${bucket}/${storagePath}`,
    foto_public_url: publicUrl,
    link_web: 'https://frontend-pens-quiz.vercel.app',
    repo_link: 'https://github.com/rizalmaulanaairlangga/landing-page_PENSQuiz',
    source: 'personal',
    notion_url: null,
    created_time: new Date().toISOString(),
    updated_time: new Date().toISOString(),
    frameworks: frameworks
  };
  const { data, error } = await supabase.from('proyek_web').insert(payload).select();
  if (error) console.error('Insert error', error.message, error.details, error.hint);
  else console.log('Inserted:', JSON.stringify(data,null,2));
}

// Verify
const { data: all, error: e } = await supabase.from('proyek_web').select('id, name, source, frameworks, foto_public_url').order('created_time', { ascending: true });
if (!e) {
  console.log('\n=== proyek_web all rows ===');
  for (const r of all) console.log(`- ${r.name} [${r.source}] frameworks=${JSON.stringify(r.frameworks)} url=${r.foto_public_url.slice(0,80)}...`);
}
