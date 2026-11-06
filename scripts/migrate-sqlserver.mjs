import { readFile } from 'node:fs/promises';
import { Pool } from 'pg';
const legacy = process.env.LEGACY_DATABASE_URL;
if (!legacy || !process.env.DATABASE_URL?.startsWith('postgres')) throw new Error('LEGACY_DATABASE_URL dan DATABASE_URL Supabase wajib tersedia.');
const driver = /^\s*driver=/i.test(legacy) ? (await import('mssql/msnodesqlv8.js')).default : (await import('mssql')).default;
const source = await new driver.ConnectionPool(/^\s*driver=/i.test(legacy) ? { connectionString: legacy } : legacy).connect();
const target = new Pool({ connectionString: process.env.DATABASE_URL, max: 1, ssl: { rejectUnauthorized: true, ca: await readFile(new URL('../certificates/supabase-ca.crt', import.meta.url), 'utf8') } });
const client = await target.connect();
try {
  await client.query('BEGIN');
  for (const table of ['settings','news','gallery','documents','messages']) {
    const rows = (await source.request().query(`SELECT * FROM dbo.[${table}]`)).recordset;
    let inserted = 0;
    for (const row of rows) {
      if (table === 'settings') row.value = JSON.parse(row.value);
      const columns = Object.keys(row);
      const result = await client.query(`INSERT INTO public.${table} (${columns.map(c=>'"'+c+'"').join(',')}) VALUES (${columns.map((_,i)=>'$'+(i+1)).join(',')}) ON CONFLICT (${table==='settings'?'"key"':'id'}) DO NOTHING`, Object.values(row));
      inserted += result.rowCount;
    }
    console.log(`${table}: ${rows.length} data sumber, ${inserted} disalin.`);
  }
  await client.query('COMMIT');
  console.log('Migrasi selesai. Data SQL Server tidak diubah atau dihapus.');
} catch(e) { await client.query('ROLLBACK'); console.error('Migrasi dibatalkan:',e.code??e.name); process.exitCode=1; }
finally { client.release(); await target.end(); await source.close(); }
