import "server-only";
import { createClient } from "@supabase/supabase-js";
import { mediaCacheTag } from "../cache-policy";

export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "website-media";

/** Khusus server; secret key tidak boleh masuk bundle browser. */
export function getStorageAdmin({cacheDownloads=false}:{cacheDownloads?:boolean}={}) {
  const url = process.env.SUPABASE_STORAGE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_STORAGE_SECRET_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Konfigurasi Supabase Storage belum lengkap pada server.");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => {
      const url=new URL(typeof input==="string"?input:input instanceof URL?input.href:input.url);
      const name=decodeURIComponent(url.pathname.split("/").pop()??"");
      const method=(init?.method??(input instanceof Request?input.method:"GET")).toUpperCase();
      const cacheable=cacheDownloads&&method==="GET"&&url.pathname.includes("/storage/v1/object/")&&/\.(?:webp|png|jpe?g|gif)$/i.test(name);
      return fetch(input,cacheable?{...init,cache:"force-cache",next:{revalidate:604800,tags:[mediaCacheTag(name)]}}:{...init,cache:"no-store"});
    } },
  });
}
