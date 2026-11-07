# Website Polresta Batang

Next.js App Router, React, Tailwind CSS, dan **Supabase PostgreSQL**. Halaman publik dan dashboard memakai koneksi database dari server. Akun administrator masih memakai session cookie aplikasi yang sudah ada, bukan akun Supabase Auth.

## Menjalankan lokal

1. Jalankan `npm ci`.
2. Isi `.env.local` mengikuti `.env.example`. DATABASE_URL harus berupa connection string PostgreSQL Supabase, bukan publishable key.
3. Jalankan `npm run db:setup` untuk membuat lima tabel dan mengaktifkan RLS.
4. Isi SUPABASE_SECRET_KEY server dan SUPABASE_STORAGE_BUCKET, lalu jalankan `npm run storage:setup`. Bucket website-media bersifat privat, maksimal 10 MB, dengan daftar format yang diperbolehkan.
5. Jalankan `npm run dev`, lalu buka http://localhost:3000 dan /dashboard.

DATABASE_URL menggunakan Session pooler dari dialog Connect Supabase agar dapat diakses melalui IPv4. Koneksi memverifikasi sertifikat dan hostname dengan CA resmi pada certificates/supabase-ca.crt. Jangan menonaktifkan verifikasi TLS. Sertifikat CA bersifat publik, bukan kredensial.

## Arsitektur akses

- Browser hanya mendapat NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.
- DATABASE_URL, AUTH_SECRET, dan kredensial administrator hanya tersedia di server.
- Semua tabel konten memiliki RLS dan tidak memberi akses langsung ke role anon/authenticated. Server aplikasi melakukan query berparameter; Server Actions admin tetap memeriksa sesi aplikasi.
- Helpers src/lib/supabase/client.ts dan server.ts disiapkan untuk SDK/SSR. Keduanya memakai publishable key dan tetap tunduk pada RLS. Tidak ada Supabase Auth session yang perlu di-refresh selama aplikasi memakai login administrator yang sekarang.
- Berkas unggahan disimpan di bucket privat Supabase Storage. Server menyimpan/menghapus file memakai SUPABASE_SECRET_KEY (atau SUPABASE_SERVICE_ROLE_KEY legacy), yang tidak pernah dikirim ke browser. Endpoint /uploads/[name] mempertahankan URL lama dan menyajikan file ke pengunjung, sesuai perilaku website sebelumnya. Jangan unggah dokumen rahasia ke dashboard dokumen publik.
- Logo dan gambar statis bawaan tetap termasuk aset aplikasi pada folder public. Tidak ada unggahan runtime baru yang ditulis ke disk lokal.

## Data lama

Migrasi SQL Server sudah dilakukan tanpa mengubah sumber. LEGACY_DATABASE_URL disimpan hanya di .env.local sebagai referensi koneksi lama. Skrip scripts/migrate-sqlserver.mjs tersedia untuk migrasi ulang yang idempoten: baris dengan ID/key yang sudah ada tidak ditimpa. Untuk menjalankannya lagi di mesin Windows lama, driver mssql dan msnodesqlv8 perlu dipasang terpisah (keduanya bukan dependency aplikasi produksi). Skrip scripts/setup-db.mjs lama sekarang meneruskan ke setup Supabase.

## Verifikasi

```sh
npm run lint
npm run build
npm run check:supabase
npm run check:storage
npm run check:production
node --env-file=.env.local scripts/smoke.mjs
node --env-file=.env.local scripts/test-dashboard-uploads.mjs
```

Tes unggahan dijalankan dengan development server di localhost:3000, membuat data berjudul UUID khusus, lalu membersihkan file dan data uji. Jangan menjalankan tes mutasi pada deployment produksi.

## Publikasi

Gunakan HTTPS, domain SITE_URL yang sebenarnya, AUTH_SECRET acak minimal 32 karakter, password admin unik minimal 12 karakter, serta backup database dan objek Storage. Deployment tidak lagi membutuhkan volume lokal untuk unggahan baru. Cookie admin menggunakan Secure di mode produksi. Batasi percobaan login dan formulir melalui reverse proxy/WAF sebelum akses internet.

Lengkapi kontak resmi, foto pimpinan, lokasi, dan konten resmi melalui dashboard. Berita contoh dari database lama tetap dipertahankan untuk ditinjau; jangan dipublikasikan sebagai berita resmi. Sumber gambar ada di public/images/SOURCES.md.

Dokumentasi: [Koneksi PostgreSQL Supabase](https://supabase.com/docs/guides/database/connecting-to-postgres), [SSR Supabase](https://supabase.com/docs/guides/auth/server-side/creating-a-client).

## Migrasi unggahan lokal

`npm run storage:migrate` menyalin hanya file lokal yang masih direferensikan oleh berita, galeri, dokumen, atau pengaturan. Nama file dan URL /uploads/ dipertahankan. Skrip memverifikasi SHA-256 hasil unduhan, menolak penimpaan file berbeda, dan tidak menghapus file sumber. DATA_DIR hanya diperlukan jika folder unggahan lama berada di lokasi khusus.

Bucket dapat dibuat ulang pada proyek baru melalui storage:setup. Tidak ada policy Storage yang memberi akses tulis/hapus kepada anon atau authenticated; Server Actions memeriksa login admin sebelum memakai client server. Pemeriksaan check:storage menguji izin tersebut dan membersihkan semua objek ujinya.

## Vercel

Atur environment production dan preview: DATABASE_URL (atau POSTGRES_URL), AUTH_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY, SUPABASE_STORAGE_BUCKET, dan SITE_URL. Seluruh koneksi harus menunjuk proyek Supabase yang sama. Environment lokal tidak otomatis ikut saat git push. Setelah mengubah environment, lakukan deployment ulang; untuk perubahan NEXT_PUBLIC_ gunakan build baru tanpa cache.

Unggahan dashboard dibatasi total 3 MB per pengiriman agar sesuai batas request Vercel (bucket Storage masih membatasi maksimum 10 MB sebagai lapisan tambahan). Region fungsi diatur hnd1, dekat database Tokyo.

Uji produksi: TEST_BASE_URL=https://DOMAIN node --env-file=.env.local scripts/check-deployment.mjs. Skrip memeriksa login, cookie Secure/HttpOnly, akses dashboard, foto Storage, sitemap, dan logout tanpa mencetak kredensial. smoke.mjs serta test-dashboard-uploads.mjs juga menerima TEST_BASE_URL.

Jika integrasi Vercel memasang proyek Supabase berbeda, atur SUPABASE_STORAGE_URL dan SUPABASE_STORAGE_SECRET_KEY ke proyek yang menyimpan bucket website-media. Kedua nama server ini didahulukan agar tidak berbenturan dengan environment integrasi.
