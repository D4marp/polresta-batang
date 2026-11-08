import "server-only";
import { randomUUID } from "node:crypto";
import { getStorageAdmin, STORAGE_BUCKET } from "./supabase/admin";
import { optimizeImage } from "./optimize-image";

const IMAGE_EXT = ["jpg", "jpeg", "png", "webp", "gif"];
const DOC_EXT = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"];
const MAX_BYTES = 3 * 1024 * 1024;

export const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

export type UploadKind = "image" | "document";

export async function validateUpload(file: File, kind: UploadKind) {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const allowed = kind === "image" ? IMAGE_EXT : DOC_EXT;
  if (!allowed.includes(ext)) throw new Error(`Format file tidak didukung. Gunakan: ${allowed.join(", ")}`);
  if (!file.size) throw new Error("File kosong tidak dapat diunggah.");
  if (file.size > MAX_BYTES) throw new Error("Ukuran file maksimal 3 MB.");
  const bytes = Buffer.from(await file.slice(0, 16).arrayBuffer());
  const valid = kind === "image"
    ? ext === "png" ? bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
      : ext === "gif" ? /^GIF8[79]a$/.test(bytes.subarray(0, 6).toString("ascii"))
      : ext === "webp" ? bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP"
      : bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
    : ext === "pdf" ? bytes.subarray(0, 5).toString() === "%PDF-"
      : ["docx", "xlsx", "pptx"].includes(ext) ? bytes.subarray(0, 4).equals(Buffer.from([80,75,3,4]))
      : bytes.subarray(0, 8).equals(Buffer.from([208,207,17,224,161,177,26,225]));
  if (!valid) throw new Error("Isi file tidak sesuai format. Pilih file asli yang valid, bukan file yang hanya diubah ekstensinya.");
}

/** Menyimpan file upload. Mengembalikan null bila tidak ada file; melempar Error bila tidak valid. */
export async function saveUpload(
  file: FormDataEntryValue | null,
  kind: UploadKind,
): Promise<{ url: string; size: number } | null> {
  if (!(file instanceof File) || file.size === 0) return null;
  let ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  await validateUpload(file, kind);
  const original = Buffer.from(await file.arrayBuffer());
  const buffer = kind === "image" ? await optimizeImage(original) : original;
  if (kind === "image") ext = "webp";

  const name = `${randomUUID()}.${ext}`;
  const { error } = await getStorageAdmin().storage.from(STORAGE_BUCKET).upload(name, buffer, {
    contentType: MIME[ext], cacheControl: "3600", upsert: false,
  });
  if (error) {
    console.error("Storage upload failed", { bucket: STORAGE_BUCKET, status: error.statusCode, message: error.message });
    throw new Error("File belum dapat diunggah ke Supabase Storage. Silakan coba kembali.");
  }
  return { url: `/uploads/${name}`, size: buffer.length };
}

export async function removeUpload(url?: string | null) {
  if (!url?.startsWith("/uploads/")) return;
  const name = url.slice("/uploads/".length);
  if (!/^[\w-]+\.[a-z0-9]+$/i.test(name)) return;
  const { error } = await getStorageAdmin().storage.from(STORAGE_BUCKET).remove([name]);
  if (error) throw new Error("File belum dapat dihapus dari Supabase Storage.");
}
