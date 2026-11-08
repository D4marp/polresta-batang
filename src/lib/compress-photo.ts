/** Compress on the device before crossing Vercel's request-body limit. */
export async function compressPhoto(file: File): Promise<File> {
  if (/\.(gif|webp)$/i.test(file.name)) return file; // Preserve animation; server optimises these.
  if (file.size > 20 * 1024 * 1024) throw new Error("Foto sumber maksimal 20 MB per file.");
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Browser belum mendukung kompresi foto.");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error("Foto gagal dikompres.")), "image/webp", 0.7));
    const ext = blob.type === "image/webp" ? "webp" : "png";
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + "." + ext, { type: blob.type });
  } finally {
    bitmap.close();
  }
}
