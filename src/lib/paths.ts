import path from "node:path";

/** Folder untuk file upload (gambar & dokumen). Database ada di DATABASE_URL. */
export const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(process.cwd(), "data");
