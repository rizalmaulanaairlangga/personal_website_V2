// Downloads every project screenshot from the consolidated `portfolio-proyek`
// bucket into public/images/projects/. Repeatable: filenames are deterministic
// per project slug, stale files for a slug are removed before writing.
// Reads Supabase URL + anon key from .env.local. Never logs credentials.
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const envRaw = fs.readFileSync(path.join(root, '.env.local'), 'utf8').replace(/^\uFEFF/, '');
const get = (k) => (envRaw.match(new RegExp('^' + k + '=(.*)$', 'm')) || [])[1]?.trim();
const supa = createClient(get('NEXT_PUBLIC_SUPABASE_URL'), get('NEXT_PUBLIC_SUPABASE_ANON_KEY'));

const outDir = path.join(root, 'public', 'images', 'projects');
fs.mkdirSync(outDir, { recursive: true });

const extOf = (u) => {
  const m = decodeURIComponent(u).match(/\.([a-zA-Z0-9]{2,5})(?:[?#]|$)/);
  return m ? '.' + m[1].toLowerCase() : '.png';
};

const { data: rows, error } = await supa.from('proyek_web').select('slug,foto_public_url,gallery').order('slug');
if (error) throw new Error('DB query failed: ' + error.message);

const failures = [];
for (const r of rows) {
  const urls = [r.foto_public_url, ...(r.gallery || [])].filter(Boolean);
  const multiple = urls.length > 1;
  // Remove stale files for this slug so reruns never leave ambiguous names.
  for (const f of fs.readdirSync(outDir)) {
    if (f === r.slug || f.startsWith(r.slug + '-') || f.startsWith(r.slug + '.')) fs.rmSync(path.join(outDir, f), { force: true });
  }
  let i = 0;
  for (const u of urls) {
    i += 1;
    const name = multiple ? r.slug + '-' + String(i).padStart(2, '0') + extOf(u) : r.slug + extOf(u);
    try {
      const res = await fetch(u);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      fs.writeFileSync(path.join(outDir, name), Buffer.from(await res.arrayBuffer()));
      console.log('saved', name);
    } catch (e) {
      failures.push(r.slug + ' <- ' + u + ' :: ' + e.message);
    }
  }
}
if (failures.length) {
  console.error('FAILURES:');
  failures.forEach((f) => console.error(' -', f));
  process.exit(1);
}
console.log('DONE: all screenshots downloaded to public/images/projects/');
