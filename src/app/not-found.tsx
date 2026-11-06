import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <p className="text-6xl font-extrabold text-navy-800">404</p>
        <h1 className="mt-3 text-xl font-bold text-navy-900">Halaman tidak ditemukan</h1>
        <p className="mt-2 text-slate-500">Halaman yang Anda cari tidak tersedia atau sudah dipindahkan.</p>
        <Link href="/" className="btn-primary mt-6">Kembali ke Beranda</Link>
      </div>
    </div>
  );
}
