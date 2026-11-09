"use server";

import { parseVideoUrl, validThumbnailUrl } from "@/lib/video";
import { canonicalNewsCategory } from "@/lib/categories";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin, requireEditor, canManageContent } from "@/lib/auth";
import * as db from "@/lib/db";
import { removeUpload, saveUpload, validateUpload } from "@/lib/uploads";
import type { FormState } from "./auth";
import type { NewsStatus, Settings } from "@/lib/types";

const refresh = () => revalidatePath("/", "layout");
const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const errMsg = (e: unknown) => (e instanceof Error ? e.message : "Terjadi kesalahan.");

/* ---------- Berita ---------- */
export async function saveNewsAction(_: FormState, fd: FormData): Promise<FormState> {
  const session = await requireEditor();
  const id = str(fd, "id") || undefined;
  const title = str(fd, "title");
  const content = str(fd, "content");
  if (!title || !content) return { error: "Judul dan isi berita wajib diisi." };
  if (title.length > 300 || content.length > 100000 || str(fd, "excerpt").length > 500 || str(fd, "category").length > 60) return { error: "Judul, ringkasan, kategori, atau isi berita terlalu panjang." };

  const category=canonicalNewsCategory(str(fd,"category"));
  if(!category)return {error:"Pilih salah satu dari empat kategori berita yang tersedia."};
  let uploaded: string | undefined;
  try {
    const existing = id ? await db.getNewsById(id) : undefined;
    if (id && !existing) return { error: "Berita tidak ditemukan. Muat ulang halaman." };
    if(existing&&!canManageContent(session,existing.createdBy))return {error:"Anda hanya dapat mengubah berita milik sendiri."};
    let image = existing?.image;
    const up = await saveUpload(fd.get("image"), "image");
    if (up) {
      image = up.url;
      uploaded = up.url;
    } else if (fd.get("removeImage") === "on") {
      image = undefined;
    }
    const excerpt = str(fd, "excerpt") || content.replace(/\s+/g, " ").slice(0, 160);
    await db.saveNews({
      id,
      title,
      content,
      excerpt,
      category,
      status: (str(fd, "status") === "draft" ? "draft" : "published") as NewsStatus,
      author: existing?.author ?? session.displayName,
      createdBy: existing?.createdBy ?? session.id,
      image,
    });
    if (existing?.image && existing.image !== image) await removeUpload(existing.image).catch(() => {});
  } catch (e) {
    if (uploaded) await removeUpload(uploaded).catch(() => {});
    return { error: errMsg(e) };
  }
  refresh();
  redirect("/dashboard/berita");
}

export async function deleteNewsAction(fd: FormData) {
  const session=await requireEditor();
  const id = str(fd, "id");
  const item = await db.getNewsById(id);
  if(!item||!canManageContent(session,item.createdBy))redirect("/dashboard/berita?akses=ditolak");
  await db.deleteNews(id);
  await removeUpload(item?.image);
  refresh();
}

/* ---------- Galeri ---------- */
export async function addGalleryAction(_: FormState, fd: FormData): Promise<FormState> {
  const session=await requireEditor();
  const title = str(fd, "title");
  if (!title || title.length > 300) return { error: "Judul foto wajib diisi, maksimal 300 karakter." };
  const uploaded: string[] = [];
  try {
    const files = fd.getAll("image").filter((f): f is File => f instanceof File && Boolean(f.name));
    if (!files.length) return { error: "Pilih minimal satu foto." };
    if (files.length > 10 || files.reduce((total, f) => total + f.size, 0) > 3 * 1024 * 1024) return { error: "Maksimal 10 foto dengan total ukuran 3 MB per unggahan." };
    for (const file of files) await validateUpload(file, "image");
    for (const f of files) {
      const up = await saveUpload(f, "image");
      if (up) uploaded.push(up.url);
    }
    await db.addGalleryBatch(title, uploaded, session.id, session.displayName);
  } catch (e) {
    await Promise.all(uploaded.map(url => removeUpload(url).catch(() => {})));
    return { error: errMsg(e) };
  }
  refresh();
  return { ok: true };
}

export async function deleteGalleryAction(fd: FormData) {
  const session=await requireEditor();
  const id = str(fd, "id");
  const item = (await db.listGallery()).find((g) => g.id === id);
  if(!item||!canManageContent(session,item.createdBy))redirect("/dashboard/galeri?akses=ditolak");
  await db.deleteGallery(id);
  await removeUpload(item?.image);
  refresh();
}

/* ---------- Dokumen ---------- */
export async function addDocumentAction(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const title = str(fd, "title");
  if (!title || title.length > 300) return { error: "Judul dokumen wajib diisi, maksimal 300 karakter." };
  let uploaded: string | undefined;
  try {
    const up = await saveUpload(fd.get("file"), "document");
    if (!up) return { error: "Pilih file dokumen." };
    uploaded = up.url;
    await db.addDocument(title, up.url, up.size);
  } catch (e) {
    if (uploaded) await removeUpload(uploaded).catch(() => {});
    return { error: errMsg(e) };
  }
  refresh();
  return { ok: true };
}

export async function deleteDocumentAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const item = (await db.listDocuments()).find((d) => d.id === id);
  await db.deleteDocument(id);
  await removeUpload(item?.file);
  refresh();
}

/* ---------- Pesan ---------- */
export async function sendMessageAction(_: FormState, fd: FormData): Promise<FormState> {
  // honeypot anti-spam
  if (str(fd, "website")) return { ok: true };
  const name = str(fd, "name");
  const message = str(fd, "message");
  if (!name || !message) return { error: "Nama dan pesan wajib diisi." };
  if (message.length > 3000) return { error: "Pesan terlalu panjang (maks. 3000 karakter)." };
  const email = str(fd, "email");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Alamat email tidak valid." };
  try {
  await db.addMessage({
    name: name.slice(0, 120),
    email: str(fd, "email").slice(0, 160),
    phone: str(fd, "phone").slice(0, 40),
    subject: str(fd, "subject").slice(0, 160) || "Pengaduan / Pertanyaan",
    message,
  });
  } catch {
    return { error: "Pesan belum dapat dikirim. Silakan coba kembali beberapa saat lagi." };
  }
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export async function toggleMessageReadAction(fd: FormData) {
  await requireAdmin();
  await db.setMessageRead(str(fd, "id"), str(fd, "read") === "true");
  revalidatePath("/dashboard", "layout");
}

export async function deleteMessageAction(fd: FormData) {
  await requireAdmin();
  await db.deleteMessage(str(fd, "id"));
  revalidatePath("/dashboard", "layout");
}

/* ---------- Pengaturan ---------- */
export async function saveSettingsAction(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const images = [fd.get("heroImage"), fd.get("leaderPhoto")].filter((f): f is File => f instanceof File);
  if (images.reduce((total, file) => total + file.size, 0) > 3 * 1024 * 1024) return { error: "Total ukuran foto beranda dan pimpinan maksimal 3 MB per penyimpanan." };
  const current = await db.getSettings();
  const next: Settings = { ...current };
  const textKeys = [
    "name", "tagline", "address", "phone", "email", "hotline", "heroTitle", "heroSubtitle",
    "leaderName", "leaderTitle", "leaderMessage", "visi", "sejarah", "instagram", "facebook",
    "youtube", "mapsEmbed",
  ] as const;
  for (const k of textKeys) next[k] = str(fd, k);
  if (!next.name || !next.heroTitle || !next.hotline) return { error: "Nama satuan, judul beranda, dan nomor darurat wajib diisi." };
  for (const key of ["instagram", "facebook", "youtube", "mapsEmbed"] as const) {
    if (!next[key]) continue;
    try {
      const url = new URL(next[key]);
      if (url.protocol !== "https:") throw new Error();
      if (key === "mapsEmbed" && (url.hostname !== "www.google.com" || !url.pathname.startsWith("/maps/embed"))) throw new Error();
    } catch { return { error: `URL ${key} tidak valid. Gunakan alamat HTTPS${key === "mapsEmbed" ? " embed Google Maps" : ""}.` }; }
  }
  next.misi = str(fd, "misi").split("\n").map((l) => l.trim()).filter(Boolean);

  const uploadedSettings: string[] = [];
  try {
    for (const key of ["heroImage", "leaderPhoto"] as const) {
      const up = await saveUpload(fd.get(key), "image");
      if (up) {
        next[key] = up.url;
        uploadedSettings.push(up.url);
      } else if (fd.get(`remove_${key}`) === "on") {
        next[key] = undefined;
      }
    }
    await db.saveSettings(next);
    for (const key of ["heroImage", "leaderPhoto"] as const) {
      if (current[key] && current[key] !== next[key]) await removeUpload(current[key]).catch(() => {});
    }
  } catch (e) {
    await Promise.all(uploadedSettings.map(url => removeUpload(url).catch(() => {})));
    return { error: errMsg(e) };
  }
  refresh();
  return { ok: true };
}

export async function addVideoAction(_: FormState, fd: FormData): Promise<FormState> {
 const session=await requireEditor();
 const title = str(fd, "title");
 if (!title || title.length > 300) return {error:"Judul video wajib diisi, maksimal 300 karakter."};
 const video = parseVideoUrl(str(fd, "url"));
 if (!video) return {error:"Gunakan URL video HTTPS dari YouTube, Vimeo, Instagram, Facebook, atau TikTok yang valid."};

 const description=str(fd,"description");
 const thumbnail=str(fd,"thumbnail");
 if(description.length>5000)return {error:"Narasi maksimal 5000 karakter."};
 if(!validThumbnailUrl(thumbnail))return {error:"URL thumbnail harus berupa alamat gambar HTTPS yang valid."};
 try { await db.addVideo(title, video.url, description, thumbnail,session.id,session.displayName); }
 catch { return {error:"Video belum dapat disimpan. Silakan coba kembali."}; }
 refresh();
 return {ok:true};
}
export async function deleteVideoAction(fd: FormData) {
 const session=await requireEditor();
 const item=await db.getVideoById(str(fd,"id"));
 if(!item||!canManageContent(session,item.created_by))redirect("/dashboard/video?akses=ditolak");
 await db.deleteVideo(item.id);
 refresh();
}

/* ---------- Edit media ---------- */
async function editFile(kind: "image" | "document", fd: FormData): Promise<FormState> {
 const session=kind==="document"?await requireAdmin():await requireEditor();
 const id = str(fd,"id");
 const title = str(fd,"title");
 if (!title || title.length > 300) return {error:"Judul wajib diisi, maksimal 300 karakter."};
 let uploaded: string | undefined;
 let oldFile: string | undefined;
 try {
  const item = kind === "image" ? await db.getGalleryById(id) : await db.getDocumentById(id);
  if (!item) return {error:"Data tidak ditemukan. Kembali ke daftar dan muat ulang halaman."};
  if("image" in item&&!canManageContent(session,item.created_by))return {error:"Anda hanya dapat mengubah foto milik sendiri."};
  oldFile = "image" in item ? item.image : item.file;
  const file = fd.get(kind === "image" ? "image" : "file");
  if (file instanceof File && file.name) await validateUpload(file,kind);
  const replacement = await saveUpload(file,kind);
  uploaded = replacement?.url;
  const saved = kind === "image"
   ? await db.updateGallery(id,title,replacement?.url ?? oldFile)
   : await db.updateDocument(id,title,replacement?.url ?? oldFile,replacement?.size ?? Number("size" in item ? item.size : 0));
  if (!saved) throw new Error("Data sudah dihapus. Kembali ke daftar dan muat ulang halaman.");
 } catch (e) {
  if (uploaded) await removeUpload(uploaded).catch(()=>{});
  return {error:errMsg(e)};
 }
 if (uploaded && oldFile && oldFile !== uploaded) await removeUpload(oldFile).catch(()=>{console.error("File media lama belum dapat dibersihkan.")});
 refresh();
 redirect(kind === "image" ? "/dashboard/galeri" : "/dashboard/dokumen");
}
export async function editGalleryAction(_:FormState,fd:FormData):Promise<FormState> {
 return editFile("image",fd);
}
export async function editDocumentAction(_:FormState,fd:FormData):Promise<FormState> {
 return editFile("document",fd);
}
export async function editVideoAction(_:FormState,fd:FormData):Promise<FormState> {
 const session=await requireEditor();
 const item=await db.getVideoById(str(fd,"id"));
 if(!item)return {error:"Video tidak ditemukan. Kembali ke daftar dan muat ulang halaman."};
 if(!canManageContent(session,item.created_by))return {error:"Anda hanya dapat mengubah video milik sendiri."};
 const title=str(fd,"title");
 if (!title || title.length > 300) return {error:"Judul wajib diisi, maksimal 300 karakter."};
 const video=parseVideoUrl(str(fd,"url"));
 if (!video) return {error:"Gunakan URL video HTTPS dari YouTube, Vimeo, Instagram, Facebook, atau TikTok yang valid."};

 const description=str(fd,"description");
 const thumbnail=str(fd,"thumbnail");
 if(description.length>5000)return {error:"Narasi maksimal 5000 karakter."};
 if(!validThumbnailUrl(thumbnail))return {error:"URL thumbnail harus berupa alamat gambar HTTPS yang valid."};
 try {
  if (!await db.updateVideo(str(fd,"id"),title,video.url,description,thumbnail)) return {error:"Video tidak ditemukan. Kembali ke daftar dan muat ulang halaman."};
 } catch {return {error:"Perubahan video belum dapat disimpan. Silakan coba kembali."};}
 refresh();
 redirect("/dashboard/video");
}
