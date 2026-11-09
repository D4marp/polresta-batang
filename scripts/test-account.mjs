import {createHmac,randomUUID,randomBytes}from'node:crypto';
import {readFile}from'node:fs/promises';
import {Pool}from'pg';
import {hashPassword}from'../src/lib/password.ts';
export async function testPool(){const url=new URL(process.env.DATABASE_URL);for(const key of ['sslmode','sslrootcert','sslcert','sslkey'])url.searchParams.delete(key);return new Pool({connectionString:url.toString(),ssl:{rejectUnauthorized:true,ca:await readFile('certificates/supabase-ca.crt','utf8')},max:1});}
export function sessionCookie(account){const payload=Buffer.from(JSON.stringify({uid:account.id,ver:account.session_version??1,exp:Date.now()+3600000})).toString('base64url');return `pb_session=${payload}.${createHmac('sha256',process.env.AUTH_SECRET).update(payload).digest('base64url')}`;}
export async function createTestAccount(pool,role='admin',mustChange=false){
 const id=randomUUID(),username='qa-'+id.slice(0,12),password=randomBytes(18).toString('base64url'),displayName='QA Redaksi '+id.slice(0,8);
 await pool.query('INSERT INTO app_users(id,username,display_name,password_hash,role,must_change_password) VALUES($1,$2,$3,$4,$5,$6)',[id,username,displayName,await hashPassword(password),role,mustChange]);
 return {id,username,password,displayName,role,cookie:sessionCookie({id,session_version:1}),cleanup:()=>pool.query('DELETE FROM app_users WHERE id=$1',[id])};
}
