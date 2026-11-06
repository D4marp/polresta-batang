import assert from 'node:assert/strict';
import { createHmac, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import {storageClient,bucket} from './storage-client.mjs';
import { Pool } from 'pg';
const base='http://localhost:3000';
const marker=`UPLOAD-TEST-${randomUUID()}`;
const p=Buffer.from(JSON.stringify({u:process.env.ADMIN_USERNAME,exp:Date.now()+3600000})).toString('base64url');
const cookie=`pb_session=${p}.${createHmac('sha256',process.env.AUTH_SECRET).update(p).digest('base64url')}`;
const url=process.env.DATABASE_URL;
const pool=new Pool({connectionString:url,ssl:{rejectUnauthorized:true,ca:await readFile('certificates/supabase-ca.crt','utf8')},max:1});
const storage=storageClient();
const png=await readFile('public/logo.png');
const pdf=Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');
const decode=s=>s.replace(/&quot;/g,'"').replace(/&#x27;/g,"'").replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
async function form(route,field){const t=await(await fetch(base+route,{headers:{cookie}})).text();const f=[...t.matchAll(/<form\b[^>]*>[\s\S]*?<\/form>/g)].map(m=>m[0]).find(f=>f.includes(`name="${field}"`));assert.ok(f,'form ditemukan');const fd=new FormData();for(const m of f.matchAll(/<input\b[^>]*>/g)){const n=m[0].match(/name="([^"]+)"/);if(n&&decode(n[1]).startsWith('$ACTION_'))fd.append(decode(n[1]),decode(m[0].match(/value="([^"]*)"/)?.[1]??''));}return fd;}
async function submit(route,field,values,files=[],auth=true){const fd=await form(route,field);for(const [k,v]of Object.entries(values))fd.set(k,v);for(const [k,data,name]of files)fd.append(k,new Blob([data]),name);const r=await fetch(base+route,{method:'POST',headers:{...(auth?{cookie}:{}),origin:base},body:fd,redirect:'manual'});const body=await r.text();assert.ok(r.status<500,`POST ${route} status ${r.status}`);return body+(r.headers.get('location')??'');}
async function rows(table){return(await pool.query(`SELECT * FROM ${table} WHERE title=$1`,[marker])).rows;}
async function files(){return (await pool.query('SELECT name FROM storage.objects WHERE bucket_id=$1 ORDER BY name',[bucket])).rows.map(r=>r.name);}
let passed=0;function pass(s){passed++;console.log('PASS '+s);}
try{
 const initial=await files();
 let t=await submit('/dashboard/galeri','image',{title:marker},[['image',png,'foto.png']],false);assert.equal((await rows('gallery')).length,0);assert.match(t,/login/);pass('unggahan tanpa login ditolak');
 t=await submit('/dashboard/galeri','image',{title:marker});assert.match(t,/Pilih minimal satu foto/);pass('galeri tanpa file ditolak');
 t=await submit('/dashboard/galeri','image',{title:marker},[['image',png,'valid.png'],['image',Buffer.from('bukan gambar'),'palsu.png']]);assert.match(t,/Isi file tidak sesuai format/);assert.equal((await rows('gallery')).length,0);assert.deepEqual(await files(),initial);pass('batch campuran ditolak tanpa data atau file tersisa');
 t=await submit('/dashboard/galeri','image',{title:marker},[['image',Buffer.alloc(10*1024*1024+1),'besar.png']]);assert.match(t,/total ukuran 10 MB/);pass('batas total ukuran ditolak dengan pesan formulir');
 t=await submit('/dashboard/galeri','image',{title:marker},Array.from({length:11},()=>['image',png,'foto.png']));assert.match(t,/Maksimal 10 foto/);pass('batas jumlah foto ditolak');
 await submit('/dashboard/galeri','image',{title:marker},[['image',png,'satu.png'],['image',png,'dua.PNG']]);const gallery=await rows('gallery');assert.equal(gallery.length,2);for(const g of gallery){const r=await fetch(base+g.image);assert.equal(r.status,200);assert.deepEqual(Buffer.from(await r.arrayBuffer()),png);}pass('dua foto tersimpan di database dan dapat dibuka dengan isi identik');
 assert.ok((await(await fetch(base+'/galeri')).text()).includes(marker));pass('foto tampil pada galeri publik');
 t=await submit('/dashboard/dokumen','file',{title:marker},[['file',Buffer.from('fake'),'palsu.pdf']]);assert.match(t,/Isi file tidak sesuai format/);assert.equal((await rows('documents')).length,0);pass('dokumen dengan ekstensi palsu ditolak');
 await submit('/dashboard/dokumen','file',{title:marker},[['file',pdf,'dokumen.pdf']]);const docs=await rows('documents');assert.equal(docs.length,1);const download=await fetch(base+docs[0].file);assert.equal(download.headers.get('content-type'),'application/pdf');assert.deepEqual(Buffer.from(await download.arrayBuffer()),pdf);assert.ok((await(await fetch(base+'/unduhan')).text()).includes(marker));pass('PDF tersimpan, dapat diunduh, dan tampil di halaman publik');
 await submit('/dashboard/berita/baru','image',{title:marker,content:'Konten uji unggahan sementara.',status:'draft',category:'Kegiatan'},[['image',png,'berita.png']]);let news=await rows('news');assert.equal(news.length,1);assert.equal(news[0].status,'draft');assert.equal((await fetch(base+news[0].image)).status,200);assert.ok(!(await(await fetch(base+'/berita')).text()).includes(marker));pass('foto berita tersimpan dan draf tidak tampil di publik');
 const oldImage=news[0].image;
 await submit('/dashboard/berita/'+news[0].id,'image',{id:news[0].id,title:marker,content:'Konten uji penggantian foto.',status:'draft',category:'Kegiatan'},[['image',png,'pengganti.png']]);news=await rows('news');assert.notEqual(news[0].image,oldImage);assert.equal((await fetch(base+oldImage)).status,404);pass('penggantian foto berita membersihkan file lama');
 const replaced=news[0].image;
 await submit('/dashboard/berita/'+news[0].id,'image',{id:news[0].id,title:marker,content:'Konten uji hapus foto.',status:'draft',category:'Kegiatan',removeImage:'on'});news=await rows('news');assert.equal(news[0].image,null);assert.equal((await fetch(base+replaced)).status,404);pass('opsi hapus foto berita berfungsi');
 const beforeSettings=(await pool.query("SELECT value FROM settings WHERE key='main'")).rows;
 const beforeFiles=await files();
 t=await submit('/dashboard/pengaturan','heroImage',{name:'Uji validasi',heroTitle:'Uji validasi',hotline:'110'},[['heroImage',png,'hero.png'],['leaderPhoto',Buffer.from('bukan foto'),'pimpinan.png']]);
 assert.match(t,/Isi file tidak sesuai format/);assert.deepEqual((await pool.query("SELECT value FROM settings WHERE key='main'")).rows,beforeSettings);assert.deepEqual(await files(),beforeFiles);pass('pengaturan gagal pada foto kedua: file pertama dibersihkan dan data asli tetap utuh');
 await submit('/pengaduan','message',{name:marker,subject:marker,message:'Pesan uji migrasi Supabase.'},[],false);
 let messages=(await pool.query('SELECT * FROM messages WHERE subject=$1',[marker])).rows;assert.equal(messages.length,1);assert.equal(messages[0].read,false);pass('formulir pengaduan tersimpan di Supabase sebagai belum dibaca');
 await submit('/dashboard/pesan','read',{id:messages[0].id,read:'true'});messages=(await pool.query('SELECT * FROM messages WHERE subject=$1',[marker])).rows;assert.equal(messages[0].read,true);pass('admin dapat menandai pesan sudah dibaca di Supabase');
 console.log(`${passed} pemeriksaan unggahan lulus.`);
}finally{
 for(const table of ['gallery','documents','news']){const items=await rows(table);for(const item of items){const file=item.image??item.file;if(file?.startsWith('/uploads/')){const {error}=await storage.storage.from(bucket).remove([file.slice(9)]);assert.ok(!error,'file uji cloud dibersihkan');}}await pool.query(`DELETE FROM ${table} WHERE title=$1`,[marker]);}
 await pool.query('DELETE FROM messages WHERE subject=$1',[marker]);await pool.end();console.log('Data dan file uji dibersihkan.');
}
