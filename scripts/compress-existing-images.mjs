import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { Pool } from 'pg';
import { storageClient, bucket } from './storage-client.mjs';
import { optimizeImage } from '../src/lib/optimize-image.ts';

const url=new URL(process.env.DATABASE_URL);
for(const key of ['sslmode','sslrootcert','sslcert','sslkey'])url.searchParams.delete(key);
const pool=new Pool({connectionString:url.toString(),ssl:{rejectUnauthorized:true,ca:await readFile('certificates/supabase-ca.crt','utf8')},max:1});
const storage=storageClient();
const apply=process.argv.includes('--apply');
try {
 const rows=(await pool.query(`SELECT image AS url FROM gallery UNION SELECT image FROM news WHERE image IS NOT NULL UNION SELECT value->>'heroImage' FROM settings UNION SELECT value->>'leaderPhoto' FROM settings UNION SELECT thumbnail FROM videos`)).rows;
 const urls=[...new Set(rows.map(r=>r.url).filter(u=>/^\/uploads\/[\w-]+\.(?:jpe?g|png|gif|webp)$/i.test(u??'')))];
 let count=0,before=0,after=0;
 for(const oldUrl of urls){
  const {data,error}=await storage.storage.from(bucket).download(oldUrl.slice(9));
  if(error||!data)throw new Error('Referenced photo could not be downloaded.');
  const original=Buffer.from(await data.arrayBuffer());const compressed=await optimizeImage(original);
  if(compressed.length>=original.length*0.95)continue;
  before+=original.length;after+=compressed.length;count++;
  if(!apply)continue;
  const name=randomUUID()+'.webp',newUrl='/uploads/'+name;
  const uploaded=await storage.storage.from(bucket).upload(name,compressed,{contentType:'image/webp',cacheControl:'3600',upsert:false});
  if(uploaded.error)throw new Error('Compressed photo could not be uploaded.');
  const client=await pool.connect();
  try{
   await client.query('BEGIN');
   await client.query('UPDATE gallery SET image=$2 WHERE image=$1',[oldUrl,newUrl]);
   await client.query('UPDATE news SET image=$2 WHERE image=$1',[oldUrl,newUrl]);
   await client.query('UPDATE videos SET thumbnail=$2 WHERE thumbnail=$1',[oldUrl,newUrl]);
   for(const field of ['heroImage','leaderPhoto'])await client.query('UPDATE settings SET value=jsonb_set(value,ARRAY[$3]::text[],to_jsonb($2::text)) WHERE value->>$3=$1',[oldUrl,newUrl,field]);
   await client.query('COMMIT');
  }catch(e){await client.query('ROLLBACK');await storage.storage.from(bucket).remove([name]);throw e;}
  finally{client.release();}
  const removed=await storage.storage.from(bucket).remove([oldUrl.slice(9)]);
  if(removed.error)console.log('Photo replaced, old file cleanup pending.');
 }
 console.log(JSON.stringify({mode:apply?'applied':'preview',photos:count,beforeBytes:before,afterBytes:after,savedBytes:before-after}));
}finally{await pool.end();}
