import { readFile } from 'node:fs/promises';
import { Pool } from 'pg';
import {storageClient,bucket} from './storage-client.mjs';
const issues = [];
for (const key of ['DATABASE_URL','NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY','AUTH_SECRET','ADMIN_USERNAME','ADMIN_PASSWORD','SITE_URL']) if (!process.env[key]) issues.push(`${key} belum diatur`);
if ((process.env.AUTH_SECRET?.length??0)<32) issues.push('AUTH_SECRET minimal 32 karakter untuk produksi');
if ((process.env.ADMIN_PASSWORD?.length??0)<12) issues.push('ADMIN_PASSWORD minimal 12 karakter untuk produksi');
try {if(new URL(process.env.SITE_URL).protocol!=='https:')throw new Error();}catch{issues.push('SITE_URL harus berupa domain HTTPS produksi');}
if(!process.env.SUPABASE_STORAGE_SECRET_KEY&&!process.env.SUPABASE_SECRET_KEY&&!process.env.SUPABASE_SERVICE_ROLE_KEY)issues.push('Kunci server Supabase Storage belum diatur');
try{const {data,error}=await storageClient().storage.getBucket(bucket);if(error||!data||data.public||Number(data.file_size_limit)!==10*1024*1024)issues.push('Bucket Storage privat dengan batas 10 MB belum siap');}catch{issues.push('Koneksi Supabase Storage belum siap');}
let pool;
try{
 if(!process.env.DATABASE_URL?.startsWith('postgres'))throw new Error();
 pool=new Pool({connectionString:process.env.DATABASE_URL,max:1,connectionTimeoutMillis:10000,ssl:{rejectUnauthorized:true,ca:await readFile(new URL('../certificates/supabase-ca.crt',import.meta.url),'utf8')}});
 const {rows}=await pool.query("SELECT value FROM settings WHERE key='main'");const s=rows[0]?.value??{};
 if(!s.phone||s.phone.includes('000000')||!s.email||!s.address)issues.push('Kontak resmi satuan belum lengkap');
 if(!s.heroImage||!s.leaderPhoto||!s.leaderName||s.leaderName==='Kapolresta Batang')issues.push('Foto beranda dan identitas pimpinan belum lengkap');
 const {rows:sample}=await pool.query("SELECT COUNT(*) AS n FROM news WHERE status='published' AND content LIKE '%contoh konten awal%'");if(Number(sample[0].n)>0)issues.push(`${sample[0].n} berita contoh masih terbit`);
 const {rows:rls}=await pool.query("SELECT tablename,rowsecurity FROM pg_tables WHERE schemaname='public' AND tablename IN ('settings','news','gallery','documents','messages')");if(rls.length!==5||rls.some(r=>!r.rowsecurity))issues.push('RLS tabel website belum lengkap');
}catch{issues.push('Koneksi Supabase atau tabel belum siap');}finally{await pool?.end();}
if(issues.length){console.error('Belum siap publikasi:\n'+issues.map(i=>'- '+i).join('\n'));process.exitCode=1;}else console.log('Konfigurasi dan konten produksi lulus.');
