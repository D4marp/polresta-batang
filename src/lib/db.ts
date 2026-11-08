import { validParent, type MenuItem } from "./navigation";
import "server-only";
import { randomUUID } from "node:crypto";
import { query, transaction, type Param } from "./postgres";
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
    const aliases:Record<string,string[]>={"Kegiatan Polresta Batang":["Kegiatan Polresta Batang","Kegiatan"],"Kegiatan":["Kegiatan Polresta Batang","Kegiatan"],"Kriminal":["Kriminal","Reskrim"],"Reskrim":["Kriminal","Reskrim"],"Himbauan":["Himbauan","Imbauan"]};
    const categories=aliases[opts.category]??[opts.category];
    const markers=categories.map(category=>{params.push(category);return `@v${params.length-1}`});
    where.push(`category IN (${markers.join(",")})`);
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
 const rows = await query<{id: string; title: string; url: string; description:string; thumbnail:string; created_at: Date}>("SELECT * FROM videos ORDER BY created_at DESC");
 return rows.map(r => ({id:r.id, title:r.title, url:r.url, description:r.description, thumbnail:r.thumbnail, createdAt:iso(r.created_at)}));
}
export async function addVideo(title: string, url: string, description = "", thumbnail = "") {
 await query("INSERT INTO videos (id,title,url,description,thumbnail) VALUES (@v0,@v1,@v2,@v3,@v4)", [randomUUID(),title,url,description,thumbnail]);
}
export async function deleteVideo(id: string) {
 await query("DELETE FROM videos WHERE id=@v0", [id]);
}

/* ---------- Media editing ---------- */
export async function getGalleryById(id: string) {
 const [r] = await query<{id:string;title:string;image:string}>("SELECT id,title,image FROM gallery WHERE id=@v0",[id]);
 return r;
}
export async function updateGallery(id:string,title:string,image:string) {
 return (await query("UPDATE gallery SET title=@v1,image=@v2 WHERE id=@v0 RETURNING id",[id,title,image])).length > 0;
}
export async function getDocumentById(id:string) {
 const [r] = await query<{id:string;title:string;file:string;size:string|number}>("SELECT id,title,file,size FROM documents WHERE id=@v0",[id]);
 return r;
}
export async function updateDocument(id:string,title:string,file:string,size:number) {
 return (await query("UPDATE documents SET title=@v1,file=@v2,size=@v3 WHERE id=@v0 RETURNING id",[id,title,file,size])).length > 0;
}
export async function getVideoById(id:string) {
 const [r] = await query<{id:string;title:string;url:string;description:string;thumbnail:string;created_at:Date}>("SELECT id,title,url,description,thumbnail,created_at FROM videos WHERE id=@v0",[id]);
 return r;
}
export async function updateVideo(id:string,title:string,url:string,description = "",thumbnail = "") {
 return (await query("UPDATE videos SET title=@v1,url=@v2,description=@v3,thumbnail=@v4 WHERE id=@v0 RETURNING id",[id,title,url,description,thumbnail])).length > 0;
}

/* ---------- Website navigation ---------- */
type MenuRow={id:string;label:string;href:string;parent_id:string|null;position:number;enabled:boolean};
const toMenu=(r:MenuRow):MenuItem=>({id:r.id,label:r.label,href:r.href,parentId:r.parent_id,position:r.position,enabled:r.enabled});
export async function listMenuItems():Promise<MenuItem[]>{
 return (await query<MenuRow>("SELECT * FROM navigation ORDER BY position,label")).map(toMenu);
}
export async function saveMenuItem(input:MenuItem,isNew:boolean){
 return transaction(async execute=>{
  await execute("LOCK TABLE navigation IN SHARE ROW EXCLUSIVE MODE");
  const items=(await execute<MenuRow>("SELECT * FROM navigation")).map(toMenu);
  if(!isNew&&!items.some(item=>item.id===input.id))throw new Error("Menu tidak ditemukan. Muat ulang halaman.");
  if(!validParent(items,input.id,input.parentId))throw new Error("Menu induk tidak valid. Menu tidak boleh menjadi submenu dirinya atau turunannya.");
  await execute("INSERT INTO navigation(id,label,href,parent_id,position,enabled) VALUES(@v0,@v1,@v2,@v3,@v4,@v5) ON CONFLICT(id) DO UPDATE SET label=EXCLUDED.label,href=EXCLUDED.href,parent_id=EXCLUDED.parent_id,position=EXCLUDED.position,enabled=EXCLUDED.enabled",[input.id,input.label,input.href,input.parentId,input.position,input.enabled]);
 });
}
export async function deleteMenuItem(id:string){await query("DELETE FROM navigation WHERE id=@v0",[id]);}

export async function moveMenuItem(id:string,direction:number){
 return transaction(async execute=>{
  await execute("LOCK TABLE navigation IN SHARE ROW EXCLUSIVE MODE");
  const rows=(await execute<MenuRow>("SELECT * FROM navigation ORDER BY position,label")).map(toMenu);
  const item=rows.find(row=>row.id===id);if(!item)return;
  const siblings=rows.filter(row=>row.parentId===item.parentId);
  const index=siblings.findIndex(row=>row.id===id),target=index+direction;
  if(target<0||target>=siblings.length)return;
  [siblings[index],siblings[target]]=[siblings[target],siblings[index]];
  for(let i=0;i<siblings.length;i++)await execute("UPDATE navigation SET position=@v1 WHERE id=@v0",[siblings[i].id,Math.min(9999,(i+1)*10)]);
 });
}
