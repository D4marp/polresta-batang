import { MIME } from "@/lib/uploads";
import { getStorageAdmin, STORAGE_BUCKET } from "@/lib/supabase/admin";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ name: string }> },
) {
  const { name } = await ctx.params;
  if (!/^[\w-]+\.[a-z0-9]+$/i.test(name)) return new Response("Not found", { status: 404 });

  const ext = name.split(".").pop()!.toLowerCase();
  const type = MIME[ext];
  if (!type) return new Response("Not found", { status: 404 });

  try {
    const { data, error } = await getStorageAdmin().storage.from(STORAGE_BUCKET).download(name);
    if (error || !data) {
      const missing = error && "statusCode" in error && ["404", "400"].includes(String(error.statusCode));
      return new Response(missing ? "Not found" : "Storage unavailable", { status: missing ? 404 : 503 });
    }
    return new Response(data, {
      headers: {
        "Content-Type": type,
        "Content-Length": String(data.size),
        "Cache-Control": "public, max-age=3600",
        "X-Content-Type-Options": "nosniff",
        ...(type.startsWith("image/") ? {} : { "Content-Disposition": `inline; filename="${name}"` }),
      },
    });
  } catch {
    return new Response("Storage unavailable", { status: 503 });
  }
}
