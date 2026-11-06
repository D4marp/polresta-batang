import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {createClient} from '@supabase/supabase-js';
import {storageClient,bucket} from './storage-client.mjs';
const admin=storageClient();
const anon=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false}});
const name=`STORAGE-TEST-${randomUUID()}.png`;const forbidden=`STORAGE-TEST-${randomUUID()}.png`;
try{
 const {data:info,error:infoError}=await admin.storage.getBucket(bucket);assert.ok(!infoError);assert.equal(info.public,false);assert.equal(Number(info.file_size_limit),10*1024*1024);console.log('PASS bucket privat dengan batas 10 MB');
 const data=await readFile('public/logo.png');
 const {error:uploadError}=await admin.storage.from(bucket).upload(name,data,{contentType:'image/png'});assert.ok(!uploadError);console.log('PASS unggah melalui kunci server');
 const {data:download,error:downloadError}=await admin.storage.from(bucket).download(name);assert.ok(!downloadError);assert.deepEqual(Buffer.from(await download.arrayBuffer()),data);console.log('PASS unduh Storage identik dengan file asli');
 const {error:publicRead}=await anon.storage.from(bucket).download(name);assert.ok(publicRead);console.log('PASS akses langsung privat tanpa hak ditolak');
 const {error:publicWrite}=await anon.storage.from(bucket).upload(forbidden,data,{contentType:'image/png'});assert.ok(publicWrite);console.log('PASS unggah langsung publishable key ditolak');
 await anon.storage.from(bucket).remove([name]);const {error:stillExists}=await admin.storage.from(bucket).download(name);assert.ok(!stillExists);console.log('PASS publishable key tidak dapat menghapus file');
 const {error:deleteError}=await admin.storage.from(bucket).remove([name]);assert.ok(!deleteError);const {error:missing}=await admin.storage.from(bucket).download(name);assert.ok(missing);console.log('PASS hapus melalui kunci server');
}finally{const {error}=await admin.storage.from(bucket).remove([name,forbidden]);assert.ok(!error,'pembersihan file uji');console.log('File uji Storage dibersihkan.');}
