import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
const derive=(password:string,salt:Buffer,legacy=false)=>new Promise<Buffer>((resolve,reject)=>scrypt(password,salt,64,{N:legacy?16384:32768,r:8,p:legacy?1:3,maxmem:64*1024*1024},(error,key)=>error?reject(error):resolve(key)));
export async function hashPassword(password:string){const salt=randomBytes(16);const key=await derive(password,salt);return `scrypt-v2$${salt.toString("base64url")}$${key.toString("base64url")}`;}
export async function verifyPassword(password:string,hash:string){
 const [format,saltText,keyText]=hash.split("$");if(!["scrypt","scrypt-v2"].includes(format)||!saltText||!keyText||password.length>128)return false;
 const salt=Buffer.from(saltText,"base64url"),expected=Buffer.from(keyText,"base64url");
 if(salt.length!==16||expected.length!==64)return false;
 return timingSafeEqual(await derive(password,salt,format==="scrypt"),expected);
}
export function passwordError(password:string){return password.length<12||password.length>128?"Password harus 12–128 karakter.":undefined;}
