import { access } from "node:fs/promises";
import sql from "mssql";
import sqlWin from "mssql/msnodesqlv8.js";

const issues = [];
for (const key of ["DATABASE_URL", "AUTH_SECRET", "ADMIN_USERNAME", "ADMIN_PASSWORD", "SITE_URL", "DATA_DIR"]) {
  if (!process.env[key]) issues.push(`${key} belum diatur`);
}
if ((process.env.AUTH_SECRET?.length ?? 0) < 32) issues.push("AUTH_SECRET minimal 32 karakter untuk produksi");
if ((process.env.ADMIN_PASSWORD?.length ?? 0) < 12) issues.push("ADMIN_PASSWORD minimal 12 karakter untuk produksi");
try { if (new URL(process.env.SITE_URL).protocol !== "https:") throw new Error(); }
catch { issues.push("SITE_URL harus berupa domain HTTPS produksi"); }
if (process.env.DATA_DIR) {
  try { await access(process.env.DATA_DIR, 2); }
  catch { issues.push("DATA_DIR belum tersedia atau tidak dapat ditulis"); }
}
let pool;
try {
  const url = process.env.DATABASE_URL;
  if (url) {
    pool = /^\s*driver=/i.test(url) ? await new sqlWin.ConnectionPool({ connectionString: url }).connect() : await new sql.ConnectionPool(url).connect();
    const { recordset } = await pool.request().query("SELECT value FROM settings WHERE [key]='main'");
    const s = recordset[0] ? JSON.parse(recordset[0].value) : {};
    if (!s.phone || s.phone.includes("000000") || !s.email || !s.address) issues.push("Kontak resmi satuan belum lengkap");
    if (!s.heroImage || !s.leaderPhoto || !s.leaderName || s.leaderName === "Kapolresta Batang") issues.push("Foto beranda dan identitas pimpinan belum lengkap");
    const { recordset: sample } = await pool.request().query("SELECT COUNT(*) AS n FROM news WHERE status='published' AND content LIKE N'%contoh konten awal%'");
    if (sample[0].n > 0) issues.push(`${sample[0].n} berita contoh masih terbit`);
  }
} catch { issues.push("Koneksi database atau tabel belum siap"); }
finally { await pool?.close(); }
if (issues.length) {
  console.error("Belum siap publikasi:\n" + issues.map(i => `- ${i}`).join("\n"));
  process.exitCode = 1;
} else console.log("Konfigurasi dan konten produksi lulus. Lanjutkan uji HTTPS, backup, dan persetujuan konten di hosting.");
