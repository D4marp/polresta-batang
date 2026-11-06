import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {Pool} from 'pg';
import {storageClient,bucket,mime} from './storage-client.mjs';
const pool=new Pool({connectionString:process.env.DATABASE_URL,max:1,ssl:{rejectUnauthorized:true,ca:await readFile('certificates/supabase-ca.crt','utf8')}});
const client=storageClient();
try{
 const refs=new Set();
 for(const [table,column]of [['news','image'],['gallery','image'],['documents','file']]){
  const {rows}=await pool.query(`SELECT ${column} AS url FROM ${table} WHERE ${column} LIKE '/uploads/%'`);
  rows.forEach(r=>refs.add(r.url));
 }
 const {rows}=await pool.query("SELECT value FROM settings WHERE key='main'");
 if(rows[0])for(const k of ['heroImage','leaderPhoto']){const v=rows[0].value[k];if(v?.startsWith('/uploads/'))refs.add(v);}
 const hash=b=>createHash('sha256').update(b).digest('hex');let count=0;
 for(const url of refs){
  const name=url.slice(9);if(!/^[\w-]+\.[a-z0-9]+$/i.test(name))throw new Error('Nama file lama tidak valid.');
  const ext=name.split('.').pop().toLowerCase();if(!mime[ext])throw new Error('Format file lama tidak didukung.');
  const local=await readFile(path.join(process.env.DATA_DIR||'data','uploads',name));
  const {data:existing,error:lookup}=await client.storage.from(bucket).download(name);
  if(existing){if(hash(Buffer.from(await existing.arrayBuffer()))!==hash(local))throw new Error('Isi file cloud berbeda; file tidak ditimpa.');}
  else{
   if(lookup&&!['400','404'].includes(String(lookup.statusCode)))throw new Error('Tidak dapat memeriksa file Storage.');
   const {error}=await client.storage.from(bucket).upload(name,local,{contentType:mime[ext],upsert:false});if(error)throw new Error('Migrasi file gagal.');
   const {data:check,error:downloadError}=await client.storage.from(bucket).download(name);if(downloadError||!check||hash(Buffer.from(await check.arrayBuffer()))!==hash(local))throw new Error('Verifikasi file cloud gagal.');
  }
  count++;
 }
 console.log(`${count} file yang direferensikan database tersedia dan terverifikasi di Supabase Storage. File lokal tidak dihapus.`);
}finally{await pool.end();}
