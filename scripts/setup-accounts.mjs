import {randomUUID,randomBytes} from 'node:crypto';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {Pool} from 'pg';
import {hashPassword,verifyPassword} from '../src/lib/password.ts';
const url=new URL(process.env.DATABASE_URL);for(const key of ['sslmode','sslrootcert','sslcert','sslkey'])url.searchParams.delete(key);
const pool=new Pool({connectionString:url.toString(),ssl:{rejectUnauthorized:true,ca:await readFile('certificates/supabase-ca.crt','utf8')},max:1});
const client=await pool.connect();
try{
 await client.query('BEGIN');
 await client.query(await readFile('supabase/migrations/202611090001_accounts.sql','utf8'));
 await client.query('LOCK TABLE app_users IN SHARE ROW EXCLUSIVE MODE');
 const username=process.env.ADMIN_USERNAME?.trim().toLowerCase(),password=process.env.ADMIN_PASSWORD;
 if(!username||!password)throw new Error('Admin bootstrap variables are missing.');
 let admin=(await client.query('SELECT id,password_hash,display_name FROM app_users WHERE username=$1',[username])).rows[0];
 if(!admin){admin={id:randomUUID()};await client.query('INSERT INTO app_users(id,username,display_name,password_hash,role) VALUES($1,$2,$3,$4,$5)',[admin.id,username,'Admin Utama',await hashPassword(password),'admin']);}
 else if(admin.password_hash.startsWith('scrypt$')&&await verifyPassword(password,admin.password_hash))await client.query('UPDATE app_users SET password_hash=$2 WHERE id=$1',[admin.id,await hashPassword(password)]);
 const operator=(await client.query("SELECT id,password_hash FROM app_users WHERE username='operator'")).rows[0];
 if(!operator){
  const password=randomBytes(18).toString('base64url');
  await client.query('INSERT INTO app_users(id,username,display_name,password_hash,role) VALUES($1,$2,$3,$4,$5)',[randomUUID(),'operator','Operator Redaksi',await hashPassword(password),'contributor']);
  await mkdir('data',{recursive:true});
  await writeFile('data/operator-initial-login.json',JSON.stringify({loginUrl:'https://polresta-batang.vercel.app/login',username:'operator',initialPassword:password,mustChangePassword:true},null,2),{mode:0o600});
  console.log('Operator created; initial login saved in ignored local data/operator-initial-login.json.');
 }
 else if(operator.password_hash.startsWith('scrypt$')){
  const initial=JSON.parse(await readFile('data/operator-initial-login.json','utf8'));
  if(await verifyPassword(initial.initialPassword,operator.password_hash))await client.query('UPDATE app_users SET password_hash=$2 WHERE id=$1',[operator.id,await hashPassword(initial.initialPassword)]);
 }
 await client.query('UPDATE news SET created_by=$1,author=$3 WHERE created_by IS NULL AND lower(author)=lower($2)',[admin.id,username,admin.display_name??'Admin Utama']);
 for(const table of ['gallery','videos'])await client.query(`UPDATE ${table} SET created_by=$1,uploaded_by_name=$2 WHERE created_by IS NULL`,[admin.id,admin.display_name??'Admin Utama']);
 await client.query('COMMIT');
 console.log('Accounts ready: existing admin login retained, operator restricted to content; passwords hashed.');
}catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();await pool.end();}
