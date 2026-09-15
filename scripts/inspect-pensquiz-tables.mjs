import fs from 'fs';
import path from 'path';
const root = 'C:/Rizal_IT_B/Portofolio/Coba UI/personal website';
const env = fs.readFileSync(path.join(root, '.env.local'), 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim();
const anon = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)[1].trim();
const service = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)[1].trim();
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(url, service);

console.log('=== Supabase project awirklcfkguisnfkxary ===');
console.log('URL', url);

// Try to list tables via pg via Supabase REST? We can brute force by querying many potential pensquiz tables
const pensquizCandidateTables = [
  'academic_years','attempt_answer_options','attempt_answers','attempts','classes','courses','folders','lecturers','majors','options','profiles','questions','quiz_copies','quiz_histories','quiz_snapshots','quiz_tags','quiz_topics','quizzes','snapshot_options','snapshot_questions','tags','topics','user_quiz_stats',
  // extra
  'tools','prestasi_akademik','prestasi_nonakademik','proyek_web'
];

console.log('\n=== TABLE EXISTENCE & COUNTS (via service_role) ===');
for (const t of pensquizCandidateTables) {
  const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
  if (error) {
    if (error.code === 'PGRST205') console.log(`${t}: NOT_EXISTS`);
    else console.log(`${t}: ERROR ${error.message} code=${error.code}`);
  } else {
    console.log(`${t}: ${count} rows`);
  }
}

console.log('\n=== SAMPLE from quizzes (if exists) ===');
try {
  const { data, error } = await supabase.from('quizzes').select('id, title, description, created_at, visibility, access').limit(3);
  if (error) console.log('quizzes error', error.message);
  else console.log(JSON.stringify(data,null,2));
} catch(e){ console.log(e.message)}

console.log('\n=== SAMPLE from profiles ===');
try {
  const { data, error } = await supabase.from('profiles').select('id, username, role, created_at').limit(3);
  if (error) console.log('profiles error', error.message);
  else console.log(JSON.stringify(data,null,2));
} catch(e){ console.log(e.message)}

console.log('\n=== STORAGE BUCKETS ===');
const { data: buckets, error: berr } = await supabase.storage.listBuckets();
if (berr) console.log('bucket err', berr.message);
else console.log(buckets.map(b=> `${b.name} public=${b.public}`).join('\n'));

console.log('\n=== STORAGE list portfolio-proyek recursive ===');
async function listRecursive(bucket, prefix='') {
  const { data, error } = await supabase.storage.from(bucket).list(prefix, { limit: 100, sortBy: { column: 'name', order: 'asc'}});
  if (error) { console.log('list err', error.message); return; }
  for (const item of data||[]) {
    const full = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.id === null) {
      console.log(`DIR: ${full}/`);
      await listRecursive(bucket, full);
    } else {
      console.log(`FILE: ${full} size=${item.metadata?.size} mimetype=${item.metadata?.mimetype}`);
    }
  }
}
await listRecursive('portfolio-proyek');

console.log('\n=== proyek_web existing rows ===');
const { data: pwRows, error: pwErr } = await supabase.from('proyek_web').select('id, name, source, frameworks, foto_storage_path, foto_public_url').order('created_time', { ascending: true });
if (pwErr) console.log(pwErr.message);
else {
  for (const r of pwRows) {
    console.log(`- ${r.name} [${r.source}] frameworks=${JSON.stringify(r.frameworks)} path=${r.foto_storage_path}`);
  }
}
