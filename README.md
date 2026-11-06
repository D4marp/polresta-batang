# Website Polresta Batang

Next.js App Router, React, Tailwind CSS, dan SQL Server. Halaman publik dan dashboard membaca database pada setiap request. Session admin memakai cookie HttpOnly, SameSite=Lax, bertanda tangan HMAC, berlaku 8 jam.

## Menjalankan lokal

1. npm ci
2. Atur .env.local: DATABASE_URL, AUTH_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD, SITE_URL, DATA_DIR.
3. npm run db:setup untuk membuat tabel. Pada database kosong, contoh berita dibuat sebagai draf.
4. npm run dev dan buka http://localhost:3000. Dashboard tersedia di /dashboard.

DATABASE_URL mendukung SQL login melalui TCP atau connection string ODBC untuk Windows Authentication lokal. Produksi sebaiknya memakai SQL login dengan enkripsi dan sertifikat valid. Jangan commit .env.local.

## Publikasi

Jalankan npm run lint, npm run build, dan npm run check:production. Pemeriksaan produksi tidak mencetak rahasia atau mengubah database. Setelah lulus, jalankan npm run start di server Node.js dengan akses SQL Server.

- AUTH_SECRET: acak, minimal 32 karakter. ADMIN_PASSWORD: unik, minimal 12 karakter.
- SITE_URL: domain resmi lengkap dengan https://. Dipakai metadata dan sitemap.
- DATA_DIR: path absolut ke folder persisten yang dapat ditulis aplikasi. Upload tersimpan dalam subfolder uploads.
- Gunakan HTTPS reverse proxy; cookie Secure admin di mode produksi memerlukan HTTPS.
- Sediakan backup database dan uploads. Penyimpanan ephemeral/serverless memerlukan migrasi upload ke object storage.
- Batasi percobaan login dan formulir di reverse proxy/WAF sebelum akses internet, terutama untuk beberapa instance.

Dashboard Ringkasan menunjukkan kelengkapan konten. Ganti berita contoh pada database lama dan lengkapi kontak resmi, foto serta identitas pimpinan, lokasi, media sosial, dan dokumentasi kegiatan. Persetujuan konten resmi tetap diperlukan.

Sumber foto lokal tercatat di public/images/SOURCES.md. Pastikan izin penggunaan ulang sebelum publikasi. Gambar berita kosong memakai kartu identitas visual agar tidak menyiratkan dokumentasi kegiatan yang berbeda.

Sitemap hanya menyertakan berita terbit. Dashboard dan login tidak diindeks. Aplikasi memakai satu akun admin dari environment; pengelolaan peran dan multiuser belum tersedia.
