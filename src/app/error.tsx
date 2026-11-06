"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="grid min-h-[65vh] place-items-center px-5 py-16 text-center"><div className="max-w-md"><p className="text-xs font-bold uppercase tracking-widest text-gold-600">Layanan informasi</p><h1 className="mt-4 text-3xl font-extrabold text-navy-900">Halaman belum dapat dimuat</h1><p className="mt-4 leading-relaxed text-slate-600">Terjadi gangguan sementara saat mengambil informasi. Silakan coba kembali.</p><div className="mt-7 flex flex-wrap justify-center gap-3"><button onClick={reset} className="btn-primary"><RefreshCw className="size-4" /> Coba lagi</button><Link href="/" className="btn-ghost">Ke beranda</Link></div></div></div>;
}
