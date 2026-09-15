const fs = require('fs');
const path = require('path');
const pgPath = path.join(__dirname, '..', 'node_modules', 'pg');
const pg = require(pgPath);
const env = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const connStr = env.match(/DATABASE_URL=(.+)/)[1].trim();
console.log('Connecting to', connStr.slice(0,60) + '...');
const client = new pg.Client({ connectionString: connStr, ssl: { rejectUnauthorized: false } });
(async () => {
  await client.connect();
  console.log('connected');
  let r = await client.query("select table_name from information_schema.tables where table_schema='public' order by table_name");
  console.log('Tables before:', r.rows.map(x=>x.table_name).join(', '));
  // Identify pensquiz tables (all except the 4 portfolio tables)
  const portfolioTables = ['tools','prestasi_akademik','prestasi_nonakademik','proyek_web'];
  const pensquizTables = r.rows.map(x=>x.table_name).filter(t => !portfolioTables.includes(t));
  console.log('Pensquiz tables to drop:', pensquizTables);
  // Drop in correct order to handle FKs: use CASCADE
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
