import "server-only";
import { randomUUID } from "node:crypto";
import { query, type Param } from "./postgres";
import type { DocumentItem, GalleryItem, Message, News, Settings } from "./types";
import { seedSettings } from "./seed";
import { slugify } from "./format";

export { DATA_DIR } from "./paths";

const iso = (d: unknown) => (d instanceof Date ? d.toISOString() : String(d));

/* ---------- Settings ---------- */
export async function getSettings(): Promise<Settings> {
  const [row] = await query<{ value: string }>(
    'SELECT value FROM settings WHERE "key" = @v0',
    ["main"],
  );
  const saved = row ? ((typeof row.value === "string" ? JSON.parse(row.value) : row.value) as Partial<Settings>) : {};
  return { ...seedSettings, ...saved };
}
export async function saveSettings(s: Settings) {
  await query(
    `INSERT INTO settings ("key", value) VALUES (@v0, @v1::jsonb) ON CONFLICT ("key") DO UPDATE SET value = EXCLUDED.value`,
    ["main", JSON.stringify(s)],
  );
}

/* ---------- News ---------- */
type NewsRow = Omit<News, "image" | "createdAt" | "updatedAt"> & {
  image: string | null;
  created_at: Date;
  updated_at: Date;
};
const toNews = (r: NewsRow): News => ({
  id: r.id,
  slug: r.slug,
  title: r.title,
  excerpt: r.excerpt,
  content: r.content,
  category: r.category,
  image: r.image ?? undefined,
  status: r.status,
  author: r.author,
  createdAt: iso(r.created_at),
  updatedAt: iso(r.updated_at),
});

export async function listNews(opts?: {
  includeDrafts?: boolean;
  category?: string;
  q?: string;
}): Promise<News[]> {
  const where: string[] = [];
  const params: Param[] = [];
  if (!opts?.includeDrafts) where.push("status = 'published'");
  if (opts?.category) {
    params.push(opts.category);
    where.push(`category = @v${params.length - 1}`);
  }
  if (opts?.q) {
    params.push(`%${opts.q.replace(/[%_[\]]/g, "")}%`);
    const i = params.length - 1;
    where.push(`(title ILIKE @v${i} OR excerpt ILIKE @v${i})`);
  }
  const rows = await query<NewsRow>(
    `SELECT * FROM news ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY created_at DESC`,
    params,
  );
  return rows.map(toNews);
}
export async function getNewsBySlug(slug: string) {
  const [r] = await query<NewsRow>(
    "SELECT * FROM news WHERE slug = @v0 AND status = 'published'",
    [slug],
  );
  return r ? toNews(r) : undefined;
}
export async function getNewsById(id: string) {
  const [r] = await query<NewsRow>("SELECT * FROM news WHERE id = @v0", [id]);
  return r ? toNews(r) : undefined;
}
export async function saveNews(
  input: Omit<News, "id" | "slug" | "createdAt" | "updatedAt"> & { id?: string },
) {
  const now = new Date();
  if (input.id && (await getNewsById(input.id))) {
    await query(
      `UPDATE news SET title=@v1, excerpt=@v2, content=@v3, category=@v4, image=@v5,
         status=@v6, updated_at=@v7 WHERE id=@v0`,
      [input.id, input.title, input.excerpt, input.content, input.category,
       input.image ?? null, input.status, now],
    );
    return;
  }
  const base = slugify(input.title) || "berita";
  let slug = base;
  while ((await query("SELECT 1 AS x FROM news WHERE slug = @v0", [slug])).length) {
    slug = `${base}-${randomUUID().slice(0, 4)}`;
  }
  await query(
    `INSERT INTO news (id, slug, title, excerpt, content, category, image, status, author, created_at, updated_at)
     VALUES (@v0,@v1,@v2,@v3,@v4,@v5,@v6,@v7,@v8,@v9,@v9)`,
    [randomUUID(), slug, input.title, input.excerpt, input.content, input.category,
     input.image ?? null, input.status, input.author, now],
  );
}
export async function deleteNews(id: string) {
  await query("DELETE FROM news WHERE id = @v0", [id]);
}

/* ---------- Gallery ---------- */
export async function listGallery(): Promise<GalleryItem[]> {
  const rows = await query<{ id: string; title: string; image: string; created_at: Date }>(
    "SELECT * FROM gallery ORDER BY created_at DESC",
  );
  return rows.map((r) => ({ id: r.id, title: r.title, image: r.image, createdAt: iso(r.created_at) }));
}
export async function addGallery(title: string, image: string) {
  await query("INSERT INTO gallery (id, title, image, created_at) VALUES (@v0,@v1,@v2,@v3)", [
    randomUUID(), title, image, new Date(),
  ]);
}
export async function addGalleryBatch(title: string, images: string[]) {
  const params: Param[] = [title, new Date()];
  const values = images.map(image => {
    const i = params.length;
    params.push(randomUUID(), image);
    return `(@v${i}, @v0, @v${i + 1}, @v1)`;
  });
  if (values.length) await query(`INSERT INTO gallery (id, title, image, created_at) VALUES ${values.join(",")}`, params);
}
export async function deleteGallery(id: string) {
  await query("DELETE FROM gallery WHERE id = @v0", [id]);
}

/* ---------- Documents ---------- */
export async function listDocuments(): Promise<DocumentItem[]> {
  const rows = await query<{ id: string; title: string; file: string; size: number; created_at: Date }>(
    "SELECT * FROM documents ORDER BY created_at DESC",
  );
  return rows.map((r) => ({
    id: r.id, title: r.title, file: r.file, size: Number(r.size), createdAt: iso(r.created_at),
  }));
}
export async function addDocument(title: string, file: string, size: number) {
  await query("INSERT INTO documents (id, title, file, size, created_at) VALUES (@v0,@v1,@v2,@v3,@v4)", [
    randomUUID(), title, file, size, new Date(),
  ]);
}
export async function deleteDocument(id: string) {
  await query("DELETE FROM documents WHERE id = @v0", [id]);
}

/* ---------- Messages ---------- */
export async function listMessages(): Promise<Message[]> {
  const rows = await query<Omit<Message, "createdAt"> & { created_at: Date }>(
    "SELECT * FROM messages ORDER BY created_at DESC",
  );
  return rows.map((r) => ({
    id: r.id, name: r.name, email: r.email, phone: r.phone, subject: r.subject,
    message: r.message, read: Boolean(r.read), createdAt: iso(r.created_at),
  }));
}
export async function addMessage(m: Omit<Message, "id" | "read" | "createdAt">) {
  await query(
    `INSERT INTO messages (id, name, email, phone, subject, message, "read", created_at)
     VALUES (@v0,@v1,@v2,@v3,@v4,@v5,false,@v6)`,
    [randomUUID(), m.name, m.email, m.phone, m.subject, m.message, new Date()],
  );
}
export async function setMessageRead(id: string, read: boolean) {
  await query('UPDATE messages SET "read" = @v1 WHERE id = @v0', [id, read]);
}
export async function deleteMessage(id: string) {
  await query("DELETE FROM messages WHERE id = @v0", [id]);
}

/* ---------- Video links ---------- */
export async function listVideos() {
 const rows = await query<{id: string; title: string; url: string; created_at: Date}>("SELECT * FROM videos ORDER BY created_at DESC");
 return rows.map(r => ({id:r.id, title:r.title, url:r.url, createdAt:iso(r.created_at)}));
}
export async function addVideo(title: string, url: string) {
 await query("INSERT INTO videos (id,title,url) VALUES (@v0,@v1,@v2)", [randomUUID(),title,url]);
}
export async function deleteVideo(id: string) {
 await query("DELETE FROM videos WHERE id=@v0", [id]);
}
