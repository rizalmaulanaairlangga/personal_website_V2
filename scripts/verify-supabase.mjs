import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const root = 'C:/Rizal_IT_B/Portofolio/Coba UI/personal website';
const env = fs.readFileSync(path.join(root, '.env.local'), 'utf8');
const supaUrl = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim();
const anon = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)[1].trim();
const service = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)[1].trim();

const anonClient = createClient(supaUrl, anon);
const serviceClient = createClient(supaUrl, service);

console.log('URL:', supaUrl);
console.log('\n=== TABLE COUNTS ===');
for (const t of ['tools','prestasi_akademik','prestasi_nonakademik','proyek_web']) {
  const { count, error } = await serviceClient.from(t).select('*', { count: 'exact', head: true });
  if (error) console.error(t, error.message);
  else console.log(`${t}: ${count} rows`);
}

console.log('\n=== SAMPLE DATA (anon read) ===');
for (const t of ['tools','prestasi_akademik','prestasi_nonakademik','proyek_web']) {
  const { data, error } = await anonClient.from(t).select('*').limit(1);
  if (error) console.error(t, error.message);
  else console.log(t, JSON.stringify(data[0], null, 2).slice(0, 800));
}

console.log('\n=== STORAGE BUCKETS ===');
for (const bucket of ['portfolio-tools','portfolio-prestasi','portfolio-proyek']) {
  const { data, error } = await serviceClient.storage.from(bucket).list('', { limit: 100, sortBy: { column: 'name', order: 'asc' }});
  if (error) console.error(bucket, error.message);
  else {
    console.log(`${bucket}: ${data.length} top-level items`);
    // recursive count via list all prefixes
    async function countAll(prefix='') {
      const { data } = await serviceClient.storage.from(bucket).list(prefix, { limit: 100 });
      let total = 0;
      for (const item of data || []) {
        if (item.id === null) { // folder
          total += await countAll(prefix ? `${prefix}/${item.name}` : item.name);
        } else total++;
      }
      return total;
    }
    const totalFiles = await countAll();
    console.log(`  total files recursive: ${totalFiles}`);
  }
}

console.log('\n=== PUBLIC URL TEST ===');
const { data: toolSample } = await anonClient.from('tools').select('logo_public_url').limit(1).single();
if (toolSample?.logo_public_url) {
  console.log('Testing', toolSample.logo_public_url.slice(0, 120));
  const res = await fetch(toolSample.logo_public_url);
  console.log('Status', res.status, 'Content-Type', res.headers.get('content-type'), 'Size', res.headers.get('content-length'));
}

console.log('\n=== PROJECT INFO ===');
console.log(`Project ref: awirklcfkguisnfkxary, region: ap-southeast-1`);
console.log(`Dashboard: https://supabase.com/dashboard/project/awirklcfkguisnfkxary`);
