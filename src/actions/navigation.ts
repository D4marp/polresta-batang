"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { saveMenuItem, deleteMenuItem, moveMenuItem } from "@/lib/db";
import { validMenuHref } from "@/lib/navigation";
import type { FormState } from "./auth";

export async function saveMenuAction(_:FormState,fd:FormData):Promise<FormState>{
 await requireAdmin();
 const str=(key:string)=>String(fd.get(key)??"").trim();
 const id=str("id"),label=str("label"),href=str("href"),parentId=str("parentId")||null;
 const position=Number(str("position"));
 if(!label||label.length>80)return {error:"Nama menu wajib diisi, maksimal 80 karakter."};
 if(!validMenuHref(href))return {error:"Gunakan alamat halaman /..., URL HTTPS, atau # untuk induk menu."};
 if(!Number.isInteger(position)||position<0||position>9999)return {error:"Urutan harus berupa angka 0 sampai 9999."};
 if((id&&!/^[\w-]{1,100}$/.test(id))||(parentId&&!/^[\w-]{1,100}$/.test(parentId)))return {error:"Identitas menu tidak valid."};
 try {await saveMenuItem({id:id||randomUUID(),label,href,parentId,position,enabled:fd.get("enabled")==="on"},!id);}
 catch(e){
  const message=e instanceof Error?e.message:"";
  return {error:message.startsWith("Menu ")?message:"Menu belum dapat disimpan. Coba kembali."};
 }
 revalidatePath("/","layout");
 return {ok:true};
}
export async function deleteMenuAction(fd:FormData){
 await requireAdmin();
 await deleteMenuItem(String(fd.get("id")??""));
 revalidatePath("/","layout");
}
export async function moveMenuAction(fd:FormData){
 await requireAdmin();
 await moveMenuItem(String(fd.get("id")??""),fd.get("direction")==="up"?-1:1);
 revalidatePath("/","layout");
}
