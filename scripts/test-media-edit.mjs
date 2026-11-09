import {createTestAccount} from "./test-account.mjs";
import sharp from "sharp";
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { Pool } from 'pg';
import { storageClient, bucket } from './storage-client.mjs';
const base=process.env.TEST_BASE_URL || 'http://localhost:3002';
const marker=`MEDIA-EDIT-${randomUUID()}`;
const url=new URL(process.env.DATABASE_URL);
for(const key of ['sslmode','sslrootcert','sslcert','sslkey'])url.searchParams.delete(key);
const pool=new Pool({connectionString:url.toString(),ssl:{rejectUnauthorized:true,ca:await readFile('certificates/supabase-ca.crt','utf8')},max:1});
const actor=await createTestAccount(pool);const cookie=actor.cookie;
const storage=storageClient();
const png=await readFile('public/logo.png');
const pdf=Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF');
const decode=s=>s.replace(/&quot;/g,'"').replace(/&#x27;/g,"'").replace(/&amp;/g,'&');
async function submit(route,field,values,files=[],auth=true){
 const html=await(await fetch(base+route,{headers:{cookie}})).text();
 const form=[...html.matchAll(/<form\b[^>]*>[\s\S]*?<\/form>/g)].map(m=>m[0]).find(f=>f.includes(`name="${field}"`));
 assert.ok(form,'form found');const fd=new FormData();
 for(const m of form.matchAll(/<input\b[^>]*>/g)){const n=m[0].match(/name="([^"]+)"/);if(n&&decode(n[1]).startsWith('$ACTION_'))fd.append(decode(n[1]),decode(m[0].match(/value="([^"]*)"/)?.[1]??''));}
 for(const [k,v]of Object.entries(values))fd.set(k,v);
 for(const [k,data,name]of files)fd.append(k,new Blob([data]),name);
 const r=await fetch(base+route,{method:'POST',headers:{...(auth?{cookie}:{}),origin:base},body:fd,redirect:'manual'});
 assert.ok(r.status<500,`POST ${route}: ${r.status}`);
 return (await r.text())+(r.headers.get('location')??'');
}
async function row(table,id){return(await pool.query(`SELECT * FROM ${table} WHERE id=$1`,[id])).rows[0];}
async function find(table){return(await pool.query(`SELECT * FROM ${table} WHERE title=$1`,[marker])).rows[0];}
async function files(){return(await pool.query('SELECT name FROM storage.objects WHERE bucket_id=$1 ORDER BY name',[bucket])).rows;}
async function publicTitle(path,title){assert.ok((await(await fetch(base+path)).text()).includes(title));}
const ids={};
try{
 await submit('/dashboard/galeri','image',{title:marker},[['image',png,'first.png']]);ids.gallery=(await find('gallery')).id;
 await submit('/dashboard/dokumen','file',{title:marker},[['file',pdf,'first.pdf']]);ids.documents=(await find('documents')).id;
 await submit('/dashboard/video','url',{title:marker,url:'https://youtu.be/M7lc1UVf-VE'});ids.videos=(await find('videos')).id;
 for(const [table,route,publicPath,key,blob,name]of [['gallery','galeri','/galeri','image',png,'new.png'],['documents','dokumen','/unduhan','file',pdf,'new.pdf']]){
  const id=ids[table],before=await row(table,id),edit=`/dashboard/${route}/${id}`;
  let result=await submit(edit,key,{id,title:marker+' forbidden'},[],false);assert.match(result,/login/);assert.deepEqual(await row(table,id),before);
  result=await submit(edit,key,{id,title:' '});assert.match(result,/Judul wajib/);assert.deepEqual(await row(table,id),before);
  await submit(edit,key,{id,title:marker+' renamed'});let saved=await row(table,id);assert.equal(saved.title,marker+' renamed');assert.equal(saved[key],before[key]);if(table==='documents')assert.equal(saved.size,before.size);await publicTitle(publicPath,saved.title);
  console.log('PASS '+route+' authentication and title-only edit');
  const beforeFiles=await files();result=await submit(edit,key,{id,title:marker+' invalid'},[[key,Buffer.from('fake'),name]]);assert.match(result,/Isi file tidak sesuai format/);assert.deepEqual(await row(table,id),saved);assert.deepEqual(await files(),beforeFiles);
  result=await submit(edit,key,{id,title:marker+' oversized'},[[key,Buffer.alloc(3*1024*1024+1),name]]);assert.match(result,/maksimal 3 MB/);assert.deepEqual(await row(table,id),saved);
  console.log('PASS '+route+' invalid replacement preserves data and files');
  await submit(edit,key,{id,title:marker+' replaced'},[[key,blob,name]]);saved=await row(table,id);assert.notEqual(saved[key],before[key]);const bytes=Buffer.from(await(await fetch(base+saved[key])).arrayBuffer());if(key==="image")assert.equal((await sharp(bytes).metadata()).format,"webp");else assert.deepEqual(bytes,blob);assert.equal((await fetch(base+before[key]+'?verify='+randomUUID())).status,404);await publicTitle(publicPath,saved.title);
  console.log('PASS '+route+' replacement and old file cleanup');
  result=await submit(edit,key,{id:randomUUID(),title:marker});assert.match(result,/Data tidak ditemukan/);
 }
 const id=ids.videos,edit='/dashboard/video/'+id,before=await row('videos',id);
 let result=await submit(edit,'url',{id,title:marker,url:'https://vimeo.com/123456789'},[],false);assert.match(result,/login/);assert.deepEqual(await row('videos',id),before);
 result=await submit(edit,'url',{id,title:marker+' invalid',url:'javascript:alert(1)'});assert.match(result,/URL video HTTPS/);assert.deepEqual(await row('videos',id),before);
 const beforeFiles=await files();await submit(edit,'url',{id,title:marker+' updated video',url:'https://youtube.com/shorts/aqz-KE-bpKQ?tracking=yes'});const saved=await row('videos',id);assert.equal(saved.url,'https://www.youtube.com/watch?v=aqz-KE-bpKQ');await publicTitle('/galeri',saved.title);assert.deepEqual(await files(),beforeFiles);
 console.log('PASS video title/URL edit, normalization, validation and no uploads');
 result=await submit(edit,'url',{id:randomUUID(),title:marker,url:'https://youtu.be/M7lc1UVf-VE'});assert.match(result,/Video tidak ditemukan/);
 for(const [table,route]of [['gallery','galeri'],['documents','dokumen'],['videos','video']]){
  await submit('/dashboard/'+route,'id',{id:ids[table]});assert.equal(await row(table,ids[table]),undefined);
  const r=await fetch(base+'/dashboard/'+route+'/'+ids[table],{headers:{cookie}}),html=await r.text();assert.ok(r.status===404||html.includes('NEXT_HTTP_ERROR_FALLBACK;404'));
  console.log('PASS '+route+' deletion and missing edit page');
 }
 console.log('All media CRUD checks passed.');
}finally{
 for(const [table,id]of Object.entries(ids)){const item=await row(table,id);if(item){const file=item.image??item.file;if(file?.startsWith('/uploads/'))await storage.storage.from(bucket).remove([file.slice(9)]);await pool.query(`DELETE FROM ${table} WHERE id=$1`,[id]);}}
 await actor.cleanup();await pool.end();console.log('Temporary media records and files cleaned.');
}
