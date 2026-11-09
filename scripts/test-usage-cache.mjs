import assert from 'node:assert/strict';
import {randomUUID,createHmac}from'node:crypto';
import {readFile,readdir}from'node:fs/promises';
import {testPool,createTestAccount}from'./test-account.mjs';
import {optimizeImage}from'../src/lib/optimize-image.ts';
import {storageClient,bucket}from'./storage-client.mjs';
const base=process.env.TEST_BASE_URL||'http://localhost:3010',budget=2*1024*1024;
const marker='USAGE-TEST-'+randomUUID(),reservation=randomUUID(),ip='203.0.113.'+(Math.floor(Math.random()*200)+1);
const pool=await testPool(),actor=await createTestAccount(pool),cookie=actor.cookie;
const decode=s=>s.replace(/&quot;/g,'"').replace(/&#x27;/g,"'").replace(/&amp;/g,'&');
async function html(route,auth=false){return await(await fetch(base+route,{headers:auth?{cookie}:{}})).text();}
async function post(route,field,values,files=[],auth=true,extraHeaders={}){
 const page=await html(route,auth);const form=[...page.matchAll(/<form\b[^>]*>[\s\S]*?<\/form>/g)].map(m=>m[0]).find(f=>f.includes(`name="${field}"`));assert.ok(form,'form '+route);
 const fd=new FormData();for(const m of form.matchAll(/<input\b[^>]*>/g)){const n=m[0].match(/name="([^"]+)"/);if(n&&n[1].startsWith('$ACTION_'))fd.append(n[1],decode(m[0].match(/value="([^"]*)"/)?.[1]??''));}
 for(const[k,v]of Object.entries(values))fd.set(k,v);for(const[k,data,name]of files)fd.append(k,new Blob([data]),name);
 const r=await fetch(base+route,{method:'POST',headers:{origin:base,...(auth?{cookie}:{}),...extraHeaders},body:fd,redirect:'manual'});assert.ok(r.status<500,'POST '+route);return await r.text();
}
async function rows(table){return(await pool.query(`SELECT * FROM ${table} WHERE title LIKE $1`,[marker+'%'])).rows;}
async function storedBytes(){return Number((await pool.query("SELECT COALESCE(sum((metadata->>'size')::bigint),0) AS bytes FROM storage.objects")).rows[0].bytes);}
try{
 const dashboard=(await html('/dashboard',true)).replace(/<!--[\s\S]*?-->/g,'');assert.ok(dashboard.includes('Pemakaian Supabase'));assert.ok(dashboard.includes('2 MB batas internal'),'start test server with SUPABASE_STORAGE_BUDGET_MB=2; never simulate a full production quota');
 await html('/');await html('/berita');
 await post('/dashboard/berita/baru','title',{title:marker+' draft',content:marker+' body only',category:'Kegiatan Polresta Batang',status:'draft'});const draft=(await rows('news'))[0];assert.ok(!(await html('/')).includes(marker));
 await post('/dashboard/berita/'+draft.id,'title',{id:draft.id,title:marker+' published',content:marker+' body only',category:'Kegiatan Polresta Batang',status:'published'});
 assert.ok((await html('/')).includes(marker+' published'));assert.ok((await html('/berita')).includes(marker+' published'));assert.ok((await html('/berita/'+draft.slug)).includes(marker+' body only'));
 await post('/dashboard/berita/'+draft.id,'title',{id:draft.id,title:marker+' unpublished',content:marker+' body only',category:'Kegiatan Polresta Batang',status:'draft'});
 assert.ok(!(await html('/')).includes(marker));const missing=await html('/berita/'+draft.slug);assert.ok(missing.includes('NEXT_HTTP_ERROR_FALLBACK;404'));console.log('PASS public cache updates immediately; drafts/unpublished articles remain private');
 const first=await fetch(base+'/');const second=await fetch(base+'/');assert.ok(['HIT','STALE'].includes(second.headers.get('x-nextjs-cache')));assert.equal(first.status,200);console.log('PASS homepage served from incremental cache');
 const input=await readFile('public/logo.png');await post('/dashboard/galeri','image',{title:marker+' photo'},[['image',input,'photo.png']]);let photo=(await rows('gallery'))[0];let asset=await fetch(base+photo.image);assert.equal(asset.status,200);assert.ok(asset.headers.get('vercel-cdn-cache-control')?.includes('s-maxage=3600'));await asset.arrayBuffer();await(await fetch(base+photo.image)).arrayBuffer();
 const cacheFiles=await readdir('.next/cache/fetch-cache').catch(()=>[]);let mediaCache=false;for(const name of cacheFiles){try{const record=JSON.parse(await readFile('.next/cache/fetch-cache/'+name,'utf8'));if(JSON.stringify(record).includes(photo.image.slice(9))&&JSON.stringify(record).includes('/storage/v1/object/'))mediaCache=true;}catch{}}
 assert.ok(mediaCache,'Storage image is in the server data cache');
 await post('/dashboard/galeri','id',{id:photo.id});asset=await fetch(base+photo.image+'?verify='+randomUUID());assert.equal(asset.status,404);console.log('PASS Storage image caching and invalidation after delete');
 const used=await storedBytes(),imageBytes=(await optimizeImage(input)).length;assert.ok(used+imageBytes*2<budget);
 await pool.query('INSERT INTO upload_reservations(id,bytes) VALUES($1,$2)',[reservation,budget-used+1]);
 let result=await post('/dashboard/galeri','image',{title:marker+' blocked'},[['image',input,'photo.png']]);assert.ok(result.includes('batas aman internal'));assert.equal((await rows('gallery')).length,0);assert.equal(await storedBytes(),used);console.log('PASS upload blocked before Storage when safe capacity is exhausted');
 await pool.query('UPDATE upload_reservations SET bytes=$2 WHERE id=$1',[reservation,Math.floor(budget-used-imageBytes*1.5)]);
 const results=await Promise.all([post('/dashboard/galeri','image',{title:marker+' concurrent a'},[['image',input,'a.png']]),post('/dashboard/galeri','image',{title:marker+' concurrent b'},[['image',input,'b.png']])]);
 assert.equal(results.filter(r=>r.includes('batas aman internal')).length,1);assert.equal((await rows('gallery')).length,1);await pool.query('DELETE FROM upload_reservations WHERE id=$1',[reservation]);for(photo of await rows('gallery'))await post('/dashboard/galeri','id',{id:photo.id});console.log('PASS concurrent upload reservations prevent overshooting capacity');
 for(let i=0;i<6;i++){result=await post('/pengaduan','message',{name:marker,email:'',message:'Temporary quota test.',subject:marker},[],false,{'x-forwarded-for':ip});if(i===5)assert.ok(result.includes('Terlalu banyak pesan'));}
 assert.equal(Number((await pool.query('SELECT count(*) FROM messages WHERE subject=$1',[marker])).rows[0].count),5);console.log('PASS public contact form rate limit');
 for(const page of ['/berita?page=999999','/galeri?foto=999999&video=999999'])assert.ok(!(await html(page)).includes('Internal Server Error'));console.log('PASS bounded archive and gallery pagination');
}finally{
 await pool.query('DELETE FROM upload_reservations WHERE id=$1',[reservation]);
 const storage=storageClient();for(const photo of await rows('gallery'))if(photo.image?.startsWith('/uploads/'))await storage.storage.from(bucket).remove([photo.image.slice(9)]);
 for(const table of ['gallery','news'])await pool.query(`DELETE FROM ${table} WHERE title LIKE $1`,[marker+'%']);await pool.query('DELETE FROM messages WHERE subject=$1',[marker]);const key=createHmac('sha256',process.env.AUTH_SECRET).update('contact:'+ip).digest('hex');await pool.query('DELETE FROM app_rate_limits WHERE key=$1',[key]);await actor.cleanup();await pool.end();console.log('Temporary quota data and files cleaned.');
}
