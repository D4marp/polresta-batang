import { MIME } from "@/lib/uploads";
import { getStorageAdmin, STORAGE_BUCKET } from "@/lib/supabase/admin";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ name: string }> },
) {
  const { name } = await ctx.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-z0-9]+$/i.test(name)) return new Response("Not found", { status: 404 });

  const ext = name.split(".").pop()!.toLowerCase();
  const type = MIME[ext];
  if (!type) return new Response("Not found", { status: 404 });

  try {
    const { data, error } = await getStorageAdmin({cacheDownloads:true}).storage.from(STORAGE_BUCKET).download(name);
    if (error || !data) {
      console.error("Storage download failed", { bucket: STORAGE_BUCKET, status: error?.statusCode, message: error?.message });
      const missing = error && "statusCode" in error && ["404", "400"].includes(String(error.statusCode));
      return new Response(missing ? "Not found" : "Storage unavailable", { status: missing ? 404 : 503,headers:missing?{"Cache-Control":"public, max-age=60","Vercel-CDN-Cache-Control":"public, s-maxage=60"}:{"Cache-Control":"no-store"} });
    }
    return new Response(data, {
      headers: {
        "Content-Type": type,
        "Content-Length": String(data.size),
        "Cache-Control": "public, max-age=3600",
        "Vercel-CDN-Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "X-Content-Type-Options": "nosniff",
        ...(type.startsWith("image/") ? {} : { "Content-Disposition": `inline; filename="${name}"` }),
      },
    });
  } catch {
    return new Response("Storage unavailable", { status: 503,headers:{"Cache-Control":"no-store"} });
  }
}
