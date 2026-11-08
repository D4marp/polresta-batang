import sharp from "sharp";

const TARGET_BYTES = 160 * 1024;

/** Fit photos without cropping; WebP strips EXIF/GPS metadata by default. */
export async function optimizeImage(input: Buffer): Promise<Buffer> {
  try {
    let result: Buffer | undefined;
    for (const [size, quality] of [[1600, 66], [1400, 58], [1200, 52], [1000, 48]]) {
      result = await sharp(input, { animated: true, limitInputPixels: 40_000_000 })
        .rotate()
        .resize({ width: size, height: size, fit: "inside", withoutEnlargement: true })
        .webp({ quality, alphaQuality: 70, effort: 5 })
        .toBuffer();
      if (result.length <= TARGET_BYTES) break;
    }
    return result!;
  } catch {
    throw new Error("Foto tidak dapat dibaca atau resolusinya terlalu besar. Pilih gambar lain.");
  }
}
