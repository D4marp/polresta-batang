# Penghematan dan batas pemakaian

Admin dapat melihat panel **Pemakaian Supabase** di halaman utama dashboard.
Panel menampilkan ukuran database, ukuran Storage, jumlah file, dan peringatan
ketika penggunaan mencapai 70% batas internal. Angka diperbarui setiap menit.

## Batas internal

- Storage: 800 MiB secara default. Upload memesan kapasitas terlebih dahulu
  menggunakan transaksi database agar unggahan bersamaan tidak melewati batas.
  Reservasi gagal/terputus kedaluwarsa otomatis setelah 10 menit.
- Database: 400 MiB secara default untuk penambahan berita, foto, dokumen,
  video, dan pesan. Penghapusan tetap tersedia.
- Override opsional pada konfigurasi server: `SUPABASE_STORAGE_BUDGET_MB`
  dan `SUPABASE_DATABASE_BUDGET_MB`. Sesuaikan hanya setelah memeriksa paket.
- Foto tetap dikompres menjadi WebP; total permintaan upload maksimal 3 MiB.
  Video memakai tautan platform, tanpa menyimpan berkas video.
- Formulir pengaduan dibatasi 5 pesan per jam per koneksi/IP. Identitas koneksi
  disimpan sebagai HMAC, bukan alamat IP mentah. Data pembatas yang kedaluwarsa
  dibersihkan saat formulir digunakan kembali.

## Cache dan koneksi

- Halaman dan data publik di-cache 5 menit. Menyimpan/menghapus konten dari
  dashboard langsung membatalkan cache terkait sehingga perubahan tetap muncul.
- Daftar berita mengambil ringkasan, bukan isi lengkap semua artikel. Arsip
  berita, foto, dan video menggunakan pagination pada query database.
- Unduhan gambar dari Storage memakai cache data server selama 7 hari dan
  cache browser/CDN selama 1 jam. Menghapus/mengganti berkas membatalkan cache
  data gambar; cache browser/CDN yang sudah ada dapat bertahan sesuai TTL.
- Koneksi Supabase pooler menggunakan transaction mode (6543), TLS terverifikasi,
  dan maksimum satu koneksi per proses aplikasi.
- Login, hak akses, password, serta data dashboard tetap diperiksa langsung;
  tidak memakai cache publik.

## Kuota paket dan trafik bulanan

Batas di atas merupakan pengaman aplikasi, bukan pembacaan kuota tagihan.
Egress bulanan, paket, dan pemakaian layanan lain tetap diperiksa pada **Usage**
di dashboard Supabase. Cache mengurangi transfer berulang, tetapi tidak
menjadikan trafik atau kapasitas tidak terbatas. Tidak ada perubahan paket
berbayar otomatis.
