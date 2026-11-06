import { promises as fs } from "node:fs";
import path from "node:path";
import { MIME, UPLOAD_DIR } from "@/lib/uploads";

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
    const buf = await fs.readFile(path.join(UPLOAD_DIR, name));
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": type,
        "Content-Length": String(buf.length),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        ...(type.startsWith("image/") ? {} : { "Content-Disposition": `inline; filename="${name}"` }),
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
