import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAccount,getAccountForLogin,recordLogin } from "./accounts";
import { hashPassword,verifyPassword } from "./password";
import type { UserSession } from "./account-types";
export { canManageContent } from "./account-types";
const COOKIE="pb_session",MAX_AGE=60*60*8;
function secret(){const value=process.env.AUTH_SECRET;if(!value||value.length<16)throw new Error("AUTH_SECRET belum diatur.");return value;}
const sign=(payload:string)=>createHmac("sha256",secret()).update(payload).digest("base64url");
function safeEqual(a:string,b:string){const left=Buffer.from(a),right=Buffer.from(b);return left.length===right.length&&timingSafeEqual(left,right);}
export async function checkCredentials(username:string,password:string){
 if(username.length>40||password.length>128)return null;
 const found=await getAccountForLogin(username.trim());
 if(!found){await hashPassword(password);return null;}
 const valid=await verifyPassword(password,found.passwordHash);
 if(!valid||!found.account.active)return null;
 await recordLogin(found.account.id);return found.account;
}
export async function createSession(user:UserSession){
 const payload=Buffer.from(JSON.stringify({uid:user.id,ver:user.sessionVersion,exp:Date.now()+MAX_AGE*1000})).toString("base64url");
 (await cookies()).set(COOKIE,`${payload}.${sign(payload)}`,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:MAX_AGE});
}
export async function destroySession(){(await cookies()).delete(COOKIE);}
export const getSession=cache(async():Promise<UserSession|null>=>{
 const token=(await cookies()).get(COOKIE)?.value;if(!token||token.length>4096)return null;
 const parts=token.split(".");if(parts.length!==2||!safeEqual(parts[1],sign(parts[0])))return null;
 let data:{uid?:unknown;ver?:unknown;exp?:unknown};
 try{data=JSON.parse(Buffer.from(parts[0],"base64url").toString());}catch{return null;}
 if(typeof data.uid!=="string"||typeof data.exp!=="number"||data.exp<Date.now()||!Number.isInteger(data.ver))return null;
 const account=await getAccount(data.uid);
 return account?.active&&account.sessionVersion===data.ver?account:null;
});
export async function requireUser(){const user=await getSession();if(!user)redirect("/login");return user;}
export async function requireEditor(){const user=await requireUser();if(user.mustChangePassword)redirect("/dashboard/akun");return user;}
export async function requireAdmin(){const user=await requireEditor();if(user.role!=="admin")redirect("/dashboard?akses=ditolak");return user;}
