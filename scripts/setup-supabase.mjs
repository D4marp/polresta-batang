import { readFile } from 'node:fs/promises';
import { Pool } from 'pg';
if (!process.env.DATABASE_URL?.startsWith('postgres')) throw new Error('DATABASE_URL PostgreSQL belum diatur.');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: true, ca: await readFile(new URL('../certificates/supabase-ca.crt', import.meta.url), 'utf8') }, connectionTimeoutMillis: 10000, max: 1 });
const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query(await readFile(new URL('../supabase/migrations/202611060001_content.sql', import.meta.url), 'utf8'));
  await client.query('COMMIT');
  console.log('Tabel Supabase siap; RLS aktif dan akses langsung anon/authenticated dibatasi.');
} catch (e) { await client.query('ROLLBACK'); console.error('Setup gagal:', e.code ?? e.name, e.message, 'posisi', e.position); process.exitCode = 1; }
finally { client.release(); await pool.end(); }
