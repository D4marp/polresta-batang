import "server-only";
import {randomUUID,createHmac} from "node:crypto";
import {unstable_cache} from "next/cache";
import {headers} from "next/headers";
import {query,transaction} from "./postgres";
const MB=1024*1024;
function budget(value:string|undefined,fallback:number){const n=Number(value);return (Number.isFinite(n)&&n>0?n:fallback)*MB;}
export const STORAGE_BUDGET=budget(process.env.SUPABASE_STORAGE_BUDGET_MB,800);
export const DATABASE_BUDGET=budget(process.env.SUPABASE_DATABASE_BUDGET_MB,400);
const storageBytesSql="COALESCE(sum(CASE WHEN metadata->>'size' ~ '^[0-9]+$' THEN (metadata->>'size')::bigint ELSE 0 END),0)";
export async function measureUsage(){
 const [db,storage]=await Promise.all([query<{bytes:string}>("SELECT pg_database_size(current_database()) AS bytes"),query<{bytes:string;files:string}>(`SELECT ${storageBytesSql} AS bytes,count(*) AS files FROM storage.objects`)]);
 return {databaseBytes:Number(db[0].bytes),storageBytes:Number(storage[0].bytes),storageFiles:Number(storage[0].files),storageBudget:STORAGE_BUDGET,databaseBudget:DATABASE_BUDGET};
}
export const getUsage=unstable_cache(measureUsage,["usage-v1",String(STORAGE_BUDGET),String(DATABASE_BUDGET)],{revalidate:60});
export async function assertDatabaseCapacity(){
 const [r]=await query<{bytes:string}>("SELECT pg_database_size(current_database()) AS bytes");
 if(Number(r.bytes)>=DATABASE_BUDGET)throw new Error("Database mencapai batas aman internal. Hubungi administrator sebelum menambah konten.");
}
export async function reserveUpload(bytes:number){
 return transaction(async execute=>{
  await execute("SELECT pg_advisory_xact_lock(81420917)");
  await execute("DELETE FROM upload_reservations WHERE expires_at<now()");
  const [used]=await execute<{bytes:string}>(`SELECT ${storageBytesSql} AS bytes FROM storage.objects`);
  const [pending]=await execute<{bytes:string}>("SELECT COALESCE(sum(bytes),0) AS bytes FROM upload_reservations");
  if(Number(used.bytes)+Number(pending.bytes)+bytes>STORAGE_BUDGET)throw new Error("Storage mencapai batas aman internal. Hubungi administrator untuk meninjau pemakaian.");
  const id=randomUUID();await execute("INSERT INTO upload_reservations(id,bytes) VALUES(@v0,@v1)",[id,bytes]);return id;
 });
}
export async function releaseUpload(id:string){await query("DELETE FROM upload_reservations WHERE id=@v0",[id]);}
export async function consumeRateLimit(scope:string,identity:string,maximum:number,seconds:number){
 const key=createHmac("sha256",process.env.AUTH_SECRET!).update(scope+":"+identity).digest("hex");
 await query("DELETE FROM app_rate_limits WHERE expires_at<now()-interval '1 day'");
 const [row]=await query<{attempts:number}>("INSERT INTO app_rate_limits(key,attempts,expires_at) VALUES(@v0,1,now()+(@v1*interval '1 second')) ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN app_rate_limits.expires_at<=now() THEN 1 ELSE LEAST(app_rate_limits.attempts+1,1000000) END,expires_at=CASE WHEN app_rate_limits.expires_at<=now() THEN EXCLUDED.expires_at ELSE app_rate_limits.expires_at END RETURNING attempts",[key,seconds]);
 return row.attempts<=maximum;
}
export async function allowContactMessage(){
 const h=await headers();
 const ip=(h.get("x-forwarded-for")||h.get("x-vercel-forwarded-for")||"unknown").split(",")[0].trim();
 return consumeRateLimit("contact",ip,5,3600);
}
