import "server-only";
import { randomUUID } from "node:crypto";
import { query,transaction } from "./postgres";
import type { Account,UserSession,UserRole } from "./account-types";
type Row={id:string;username:string;display_name:string;password_hash:string;role:UserRole;active:boolean;session_version:number;must_change_password:boolean;created_at:Date;last_login:Date|null};
const publicColumns="id,username,display_name,role,active,session_version,must_change_password,created_at,last_login";
const toAccount=(r:Row):UserSession=>({id:r.id,username:r.username,displayName:r.display_name,role:r.role,active:r.active,sessionVersion:r.session_version,mustChangePassword:r.must_change_password,createdAt:new Date(r.created_at).toISOString(),lastLogin:r.last_login?new Date(r.last_login).toISOString():null});
export async function getAccount(id:string){const [r]=await query<Row>(`SELECT ${publicColumns} FROM app_users WHERE id=@v0`,[id]);return r?toAccount(r):null;}
export async function getAccountForLogin(username:string){const [r]=await query<Row>("SELECT * FROM app_users WHERE username=@v0",[username.toLowerCase()]);return r?{account:toAccount(r),passwordHash:r.password_hash}:null;}
export async function getPasswordHash(id:string){const [r]=await query<{password_hash:string}>("SELECT password_hash FROM app_users WHERE id=@v0",[id]);return r?.password_hash;}
export async function listAccounts():Promise<Account[]>{return(await query<Row>(`SELECT ${publicColumns} FROM app_users ORDER BY created_at,username`)).map(r=>{const {sessionVersion:_,...account}=toAccount(r);void _;return account;});}
export async function recordLogin(id:string){await query("UPDATE app_users SET last_login=now() WHERE id=@v0",[id]);}
type Input={id?:string;username:string;displayName:string;role:UserRole;active:boolean;passwordHash?:string};
export async function saveAccount(input:Input,actorId:string){
 return transaction(async execute=>{
  await execute("LOCK TABLE app_users IN SHARE ROW EXCLUSIVE MODE");
  const rows=await execute<Row>("SELECT * FROM app_users");
  const existing=rows.find(r=>r.id===input.id);
  if(input.id&&!existing)throw new Error("Akun tidak ditemukan.");
  if(rows.some(r=>r.username===input.username&&r.id!==input.id))throw new Error("Username sudah digunakan.");
  if(input.id===actorId&&(!input.active||input.role!=="admin"))throw new Error("Akun sendiri tidak dapat dinonaktifkan atau diturunkan perannya dari sini.");
  if(existing?.role==="admin"&&existing.active&&(!input.active||input.role!=="admin")&&rows.filter(r=>r.role==="admin"&&r.active).length<=1)throw new Error("Minimal satu administrator aktif harus tersedia.");
  if(!existing){
   if(!input.passwordHash)throw new Error("Password akun baru wajib diisi.");
   const id=randomUUID();await execute("INSERT INTO app_users(id,username,display_name,password_hash,role,active) VALUES(@v0,@v1,@v2,@v3,@v4,@v5)",[id,input.username,input.displayName,input.passwordHash,input.role,input.active]);return id;
  }
  await execute("UPDATE app_users SET username=@v1,display_name=@v2,role=@v3,active=@v4,password_hash=COALESCE(@v5,password_hash),must_change_password=CASE WHEN @v5::text IS NOT NULL THEN true ELSE must_change_password END,session_version=session_version+1 WHERE id=@v0",[input.id!,input.username,input.displayName,input.role,input.active,input.passwordHash??null]);
  await execute("UPDATE news SET author=@v1 WHERE created_by=@v0",[input.id!,input.displayName]);
  for(const table of ["gallery","videos"])await execute(`UPDATE ${table} SET uploaded_by_name=@v1 WHERE created_by=@v0`,[input.id!,input.displayName]);
  return input.id!;
 });
}
export async function deleteAccount(id:string,actorId:string){
 return transaction(async execute=>{
  await execute("LOCK TABLE app_users IN SHARE ROW EXCLUSIVE MODE");
  if(id===actorId)throw new Error("Akun sendiri tidak dapat dihapus.");
  const rows=await execute<Row>("SELECT * FROM app_users");const item=rows.find(r=>r.id===id);
  if(item?.role==="admin"&&item.active&&rows.filter(r=>r.role==="admin"&&r.active).length<=1)throw new Error("Administrator aktif terakhir tidak dapat dihapus.");
  await execute("DELETE FROM app_users WHERE id=@v0",[id]);
 });
}
export async function updateOwnProfile(id:string,displayName:string){await transaction(async execute=>{
 await execute("UPDATE app_users SET display_name=@v1 WHERE id=@v0",[id,displayName]);
 await execute("UPDATE news SET author=@v1 WHERE created_by=@v0",[id,displayName]);
 for(const table of ["gallery","videos"])await execute(`UPDATE ${table} SET uploaded_by_name=@v1 WHERE created_by=@v0`,[id,displayName]);
});}
export async function changeOwnPassword(id:string,oldHash:string,newHash:string){
 const rows=await query("UPDATE app_users SET password_hash=@v2,must_change_password=false,session_version=session_version+1 WHERE id=@v0 AND password_hash=@v1 RETURNING id",[id,oldHash,newHash]);
 if(!rows.length)throw new Error("Password sudah berubah. Silakan masuk kembali.");
}
