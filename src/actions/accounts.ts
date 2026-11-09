"use server";
import { invalidatePublicContent } from "@/lib/invalidate-public";
import {revalidatePath} from "next/cache";
import {requireAdmin,requireUser,createSession} from "@/lib/auth";
import {saveAccount,deleteAccount,getAccount,getPasswordHash,changeOwnPassword,updateOwnProfile} from "@/lib/accounts";
import {hashPassword,verifyPassword,passwordError} from "@/lib/password";
import type {FormState} from "./auth";
const accountError=(e:unknown)=>e instanceof Error&&/^(Akun |Username |Minimal |Administrator |Password )/.test(e.message)?e.message:"Perubahan akun belum dapat disimpan. Coba kembali.";

export async function saveAccountAction(_:FormState,fd:FormData):Promise<FormState>{
 const actor=await requireAdmin();
 const username=String(fd.get("username")??"").trim().toLowerCase(),displayName=String(fd.get("displayName")??"").trim();
 const id=String(fd.get("id")??"").trim()||undefined,role=String(fd.get("role")),password=String(fd.get("password")??"");
 if(!/^[a-z0-9][a-z0-9._-]{2,39}$/.test(username))return {error:"Username 3–40 karakter: huruf, angka, titik, garis bawah, atau tanda hubung."};
 if(!displayName||displayName.length>120)return {error:"Nama penulis wajib diisi, maksimal 120 karakter."};
 if(role!=="admin"&&role!=="contributor")return {error:"Peran akun tidak valid."};
 if(!id||password){const error=passwordError(password);if(error)return {error};}
 try{
  const savedId=await saveAccount({id,username,displayName,role,active:fd.get("active")==="on",passwordHash:password?await hashPassword(password):undefined},actor.id);
  if(savedId===actor.id){const updated=await getAccount(savedId);if(updated)await createSession(updated);}
 }catch(e){return {error:accountError(e)};}
 invalidatePublicContent();return {ok:true};
}
export async function deleteAccountAction(_:FormState,fd:FormData):Promise<FormState>{
 const actor=await requireAdmin();try{await deleteAccount(String(fd.get("id")??""),actor.id);}catch(e){return {error:accountError(e)};}
 invalidatePublicContent();return {ok:true};
}
export async function changePasswordAction(_:FormState,fd:FormData):Promise<FormState>{
 const user=await requireUser(),current=String(fd.get("currentPassword")??""),password=String(fd.get("newPassword")??"");
 const error=passwordError(password);if(error)return {error};
 if(password!==String(fd.get("confirmPassword")))return {error:"Konfirmasi password tidak sama."};
 const oldHash=await getPasswordHash(user.id);
 if(!oldHash||!await verifyPassword(current,oldHash))return {error:"Password saat ini tidak sesuai."};
 if(await verifyPassword(password,oldHash))return {error:"Gunakan password baru yang berbeda."};
 try{await changeOwnPassword(user.id,oldHash,await hashPassword(password));const updated=await getAccount(user.id);if(updated)await createSession(updated);}catch{return {error:"Password belum dapat diperbarui. Coba masuk kembali."};}
 revalidatePath("/dashboard","layout");return {ok:true};
}
export async function updateProfileAction(_:FormState,fd:FormData):Promise<FormState>{
 const user=await requireUser(),name=String(fd.get("displayName")??"").trim();
 if(!name||name.length>120)return {error:"Nama penulis wajib diisi, maksimal 120 karakter."};
 await updateOwnProfile(user.id,name);invalidatePublicContent();return {ok:true};
}
