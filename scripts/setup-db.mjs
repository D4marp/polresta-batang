// Membuat tabel (idempoten) dan mengisi contoh berita bila tabel kosong.
// Jalankan: npm run db:setup
import sql from "mssql";
import sqlWin from "mssql/msnodesqlv8.js";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL belum diatur (.env.local).");
  process.exit(1);
}

const ddl = `
IF OBJECT_ID('dbo.news') IS NULL CREATE TABLE dbo.news (
  id NVARCHAR(36) NOT NULL PRIMARY KEY,
  slug NVARCHAR(200) NOT NULL UNIQUE,
  title NVARCHAR(300) NOT NULL,
  excerpt NVARCHAR(500) NOT NULL,
  content NVARCHAR(MAX) NOT NULL,
  category NVARCHAR(60) NOT NULL,
  image NVARCHAR(300) NULL,
  status NVARCHAR(20) NOT NULL,
  author NVARCHAR(120) NOT NULL,
  created_at DATETIME2 NOT NULL,
  updated_at DATETIME2 NOT NULL
);
IF OBJECT_ID('dbo.gallery') IS NULL CREATE TABLE dbo.gallery (
  id NVARCHAR(36) NOT NULL PRIMARY KEY,
  title NVARCHAR(300) NOT NULL,
  image NVARCHAR(300) NOT NULL,
  created_at DATETIME2 NOT NULL
);
IF OBJECT_ID('dbo.documents') IS NULL CREATE TABLE dbo.documents (
  id NVARCHAR(36) NOT NULL PRIMARY KEY,
  title NVARCHAR(300) NOT NULL,
  [file] NVARCHAR(300) NOT NULL,
  size BIGINT NOT NULL,
  created_at DATETIME2 NOT NULL
);
IF OBJECT_ID('dbo.messages') IS NULL CREATE TABLE dbo.messages (
  id NVARCHAR(36) NOT NULL PRIMARY KEY,
  name NVARCHAR(120) NOT NULL,
  email NVARCHAR(160) NOT NULL,
  phone NVARCHAR(40) NOT NULL,
  subject NVARCHAR(160) NOT NULL,
  message NVARCHAR(MAX) NOT NULL,
  [read] BIT NOT NULL DEFAULT 0,
  created_at DATETIME2 NOT NULL
);
IF OBJECT_ID('dbo.settings') IS NULL CREATE TABLE dbo.settings (
  [key] NVARCHAR(60) NOT NULL PRIMARY KEY,
  value NVARCHAR(MAX) NOT NULL
);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_news_created')
  CREATE INDEX IX_news_created ON dbo.news (status, created_at DESC);
`;

const seed = [
  ["polresta-batang-gelar-apel-pagi-kesiapan-operasi", "Polresta Batang Gelar Apel Pagi Kesiapan Operasi Kepolisian", "Seluruh personel melaksanakan apel pagi untuk memastikan kesiapan pengamanan dan pelayanan kepada masyarakat.", "Kegiatan", 1],
  ["sosialisasi-keselamatan-berlalu-lintas-pelajar", "Satlantas Gelar Sosialisasi Keselamatan Berlalu Lintas untuk Pelajar", "Kegiatan bertujuan menumbuhkan budaya tertib berlalu lintas sejak usia dini di lingkungan sekolah.", "Lalu Lintas", 3],
  ["bhabinkamtibmas-sambangi-warga-jaga-kamtibmas", "Bhabinkamtibmas Sambangi Warga, Ajak Jaga Kamtibmas Bersama", "Sambang dan dialogisasi dilakukan untuk menyerap aspirasi serta mempererat sinergi polisi dan masyarakat.", "Binmas", 5],
  ["layanan-skck-online-polresta-batang", "Pengumuman: Layanan SKCK dan SIM Dibuka Setiap Hari Kerja", "Masyarakat dapat memanfaatkan layanan pembuatan SKCK dan SIM di Polresta Batang pada hari dan jam kerja.", "Pengumuman", 7],
];
const body = (t) =>
  `${t}\n\nBerita ini adalah contoh konten awal. Silakan ubah atau hapus melalui dashboard admin, lalu unggah berita resmi Polresta Batang lengkap dengan foto kegiatan.`;

const pool = /^[ ]*driver=/i.test(url)
  ? await new sqlWin.ConnectionPool({ connectionString: url }).connect()
  : await new sql.ConnectionPool(url).connect();
try {
  await pool.request().batch(ddl);
  const { recordset } = await pool.request().query("SELECT COUNT(*) AS n FROM dbo.news");
  if (recordset[0].n === 0) {
    for (const [slug, title, excerpt, category, daysAgo] of seed) {
      const at = new Date(Date.now() - daysAgo * 86400000);
      await pool
        .request()
        .input("id", crypto.randomUUID())
        .input("slug", slug)
        .input("title", title)
        .input("excerpt", excerpt)
        .input("content", body(excerpt))
        .input("category", category)
        .input("at", at)
        .query(
          `INSERT INTO dbo.news (id,slug,title,excerpt,content,category,status,author,created_at,updated_at)
           VALUES (@id,@slug,@title,@excerpt,@content,@category,'draft','Humas Polresta Batang',@at,@at)`,
        );
    }
    console.log("Contoh berita ditambahkan.");
  }
  console.log("Database siap.");
} finally {
  await pool.close();
}
