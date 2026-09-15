import fs from 'fs';
const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) { console.error('SUPABASE_ACCESS_TOKEN env required'); process.exit(1); }
const ref = 'awirklcfkguisnfkxary';
const sqlFile = process.argv[2];
if (!sqlFile) { console.error('usage: node run-sql.mjs <sql-file>'); process.exit(1); }
const sql = fs.readFileSync(sqlFile, 'utf8');
console.log('SQL length', sql.length);
const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: sql })
});
const text = await res.text();
console.log('Status', res.status);
console.log(text);
if (!res.ok) process.exit(1);
