import assert from 'node:assert/strict';
import { createHmac, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';

import { Pool } from 'pg';
const base=process.env.TEST_BASE_URL || 'http://localhost:3000';
const marker=`UPLOAD-TEST-${randomUUID()}`;
const p=Buffer.from(JSON.stringify({u:process.env.ADMIN_USERNAME,exp:Date.now()+3600000})).toString('base64url');
const cookie=`pb_session=${p}.${createHmac('sha256',process.env.AUTH_SECRET).update(p).digest('base64url')}`;
const parsed=new URL(process.env.DATABASE_URL);for(const key of ['sslmode','sslrootcert','sslcert','sslkey'])parsed.searchParams.delete(key);const url=parsed.toString();
const pool=new Pool({connectionString:url,ssl:{rejectUnauthorized:true,ca:await readFile('certificates/supabase-ca.crt','utf8')},max:1});


const decode=s=>s.replace(/&quot;/g,'"').replace(/&#x27;/g,"'").replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
async function form(route,field){const t=await(await fetch(base+route,{headers:{cookie}})).text();const f=[...t.matchAll(/<form\b[^>]*>[\s\S]*?<\/form>/g)].map(m=>m[0]).find(f=>f.includes(`name="${field}"`));assert.ok(f,'form ditemukan');const fd=new FormData();for(const m of f.matchAll(/<input\b[^>]*>/g)){const n=m[0].match(/name="([^"]+)"/);if(n&&decode(n[1]).startsWith('$ACTION_'))fd.append(decode(n[1]),decode(m[0].match(/value="([^"]*)"/)?.[1]??''));}return fd;}
async function submit(route,field,values,files=[],auth=true){const fd=await form(route,field);for(const [k,v]of Object.entries(values))fd.set(k,v);for(const [k,data,name]of files)fd.append(k,new Blob([data]),name);const r=await fetch(base+route,{method:'POST',headers:{...(auth?{cookie}:{}),origin:base},body:fd,redirect:'manual'});const body=await r.text();assert.ok(r.status<500,`POST ${route} status ${r.status}`);return body+(r.headers.get('location')??'');}
async function rows(table){return(await pool.query(`SELECT * FROM ${table} WHERE title=$1`,[marker])).rows;}
async function files(){return (await pool.query('SELECT name FROM storage.objects WHERE bucket_id=$1 ORDER BY name',['website-media'])).rows.map(r=>r.name);}

try {
 let result=await submit('/dashboard/video','url',{title:marker,url:'https://youtu.be/M7lc1UVf-VE'},[],false);
 assert.match(result,/login/);assert.equal((await rows('videos')).length,0);console.log('PASS unauthenticated mutation rejected');
 for(const url of ['javascript:alert(1)','http://youtu.be/M7lc1UVf-VE','https://youtube.com.evil.test/watch?v=M7lc1UVf-VE','https://www.youtube.com/watch?v=bad']) {
  result=await submit('/dashboard/video','url',{title:marker,url});assert.match(result,/URL video HTTPS/);assert.equal((await rows('videos')).length,0);
 }console.log('PASS invalid URLs rejected');
 for(const extra of [{description:'x'.repeat(5001)},{thumbnail:'javascript:alert(1)'},{thumbnail:'http://example.com/a.jpg'}]) {
  const result=await submit('/dashboard/video','url',{title:marker,url:'https://youtu.be/M7lc1UVf-VE',...extra});assert.match(result,/Narasi maksimal|URL thumbnail/);assert.equal((await rows('videos')).length,0);
 }console.log('PASS narrative and thumbnail validation');
 const before=await files();
 await submit('/dashboard/video','url',{title:marker,url:'https://youtu.be/M7lc1UVf-VE?si=tracking',description:marker+' narasi kegiatan\nBaris kedua.',thumbnail:''});
 let items=await rows('videos');assert.equal(items.length,1);assert.equal(items[0].url,'https://www.youtube.com/watch?v=M7lc1UVf-VE');
 assert.deepEqual(await files(),before);console.log('PASS URL saved without Storage upload');
 assert.equal(items[0].description.replaceAll("\r\n","\n"),marker+' narasi kegiatan\nBaris kedua.');
 for(const path of ['/galeri','/']){const html=await(await fetch(base+path)).text();assert.ok(html.includes(marker+' narasi kegiatan'));assert.ok(html.includes('https://i.ytimg.com/vi/M7lc1UVf-VE/hqdefault.jpg'));assert.ok(html.includes('Tonton di sini'));assert.ok(!html.includes('<iframe'));}console.log('PASS narrative and automatic thumbnail appear publicly; player loads on click');
 const edit='/dashboard/video/'+items[0].id;
 await submit(edit,'url',{id:items[0].id,title:marker,url:items[0].url,description:marker+' updated narrative',thumbnail:'https://i.ytimg.com/vi/M7lc1UVf-VE/mqdefault.jpg'});
 items=await rows('videos');assert.equal(items[0].description,marker+' updated narrative');assert.equal(items[0].thumbnail,'https://i.ytimg.com/vi/M7lc1UVf-VE/mqdefault.jpg');
 const editPage=await(await fetch(base+edit,{headers:{cookie}})).text();assert.ok(editPage.includes(marker+' updated narrative'));console.log('PASS narrative and thumbnail edit persistence');
 await submit('/dashboard/video','url',{title:marker,url:'https://www.instagram.com/p/TESTVIDEO/'});assert.equal((await rows('videos')).length,2);console.log('PASS Instagram link saved');
 for(const item of await rows('videos'))await submit('/dashboard/video','id',{id:item.id});
 assert.equal((await rows('videos')).length,0);assert.ok(!(await(await fetch(base+'/galeri')).text()).includes(marker));console.log('PASS admin deletion removes public entries');
} finally {await pool.query('DELETE FROM videos WHERE title=$1',[marker]);await pool.end();console.log('Temporary video records cleaned.');}
