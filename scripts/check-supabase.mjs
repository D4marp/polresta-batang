import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Pool} from 'pg';
import {createClient} from '@supabase/supabase-js';
const pool=new Pool({connectionString:process.env.DATABASE_URL,max:1,ssl:{rejectUnauthorized:true,ca:await readFile('certificates/supabase-ca.crt','utf8')}});
try{
 const {rows}=await pool.query("SELECT tablename,rowsecurity FROM pg_tables WHERE schemaname='public' AND tablename IN ('settings','news','gallery','documents','messages','videos','navigation','app_users')");assert.equal(rows.length,8);assert.ok(rows.every(r=>r.rowsecurity));console.log('PASS delapan tabel ada dan RLS aktif');
 const client=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false}});
 for(const table of ['settings','news','gallery','documents','messages','videos','navigation','app_users']){const {data,error}=await client.from(table).select('*').limit(1);assert.ok(error,'publishable key wajib ditolak');assert.equal(error.code,'42501');assert.equal(data,null);console.log('PASS akses langsung publishable key ditolak: '+table);}
}finally{await pool.end();}
