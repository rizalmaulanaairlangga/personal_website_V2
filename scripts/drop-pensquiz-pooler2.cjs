const fs = require('fs');
const path = require('path');
const pg = require(path.join(__dirname, '..', 'node_modules', 'pg'));
const backendEnv = fs.readFileSync('C:/Rizal_IT_B/Portofolio/Coba UI/PENSQuiz/backend/.env','utf8');
let host = backendEnv.match(/Host=([^;]+)/)[1];
let db = backendEnv.match(/Database=([^;]+)/)[1];
let user = backendEnv.match(/Username=([^;]+)/)[1];
let pass = backendEnv.match(/Password=([^;]+)/)[1];
let port = backendEnv.match(/Port=([^;]+)/)[1];
const connStr = `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:${port}/${db}`;
console.log('Connecting via pooler', host);
const client = new pg.Client({ connectionString: connStr, ssl: { rejectUnauthorized: false } });
(async () => {
  await client.connect();
  console.log('connected pooler');
  let r = await client.query("select table_name from information_schema.tables where table_schema='public' order by table_name");
  console.log('Tables before:', r.rows.map(x=>x.table_name).join(', '));
  const portfolioTables = ['tools','prestasi_akademik','prestasi_nonakademik','proyek_web'];
  const pensquizTables = r.rows.map(x=>x.table_name).filter(t => !portfolioTables.includes(t));
  console.log('Pensquiz tables to drop:', pensquizTables.join(', '));
  for (const t of pensquizTables) {
    try {
      console.log(`Dropping ${t} CASCADE...`);
      await client.query(`DROP TABLE IF EXISTS public."${t}" CASCADE`);
      console.log(`Dropped ${t}`);
    } catch(e) { console.error(`Failed ${t}:`, e.message); }
  }
  r = await client.query("select table_name from information_schema.tables where table_schema='public' order by table_name");
  console.log('Tables after:', r.rows.map(x=>x.table_name).join(', '));
  await client.end();
})();
