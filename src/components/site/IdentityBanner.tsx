"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ArrowUpRight, Expand, X } from "lucide-react";

const panels = [
  { src: "/images/image1.png", alt: "Bagian kiri banner: foto dan identitas Kapolresta Batang pada materi resmi" },
  { src: "/images/image2.png", alt: "Bagian tengah banner: lambang kepolisian dan identitas Polresta Batang" },
  { src: "/images/image3.png", alt: "Bagian kanan banner: imbauan pengaduan dan layanan Polisi 110" },
];

export function IdentityBanner() {
  const viewer = useRef<HTMLDialogElement>(null);
  return (
    <section aria-label="Identitas utama Polresta Batang" className="pt-5 sm:pt-6">
      <button
        type="button"
        onClick={() => viewer.current?.showModal()}
        aria-label="Perbesar banner utuh Polresta Batang: pimpinan, identitas satuan, dan layanan 110"
        aria-haspopup="dialog"
        className="group block w-full bg-[#001144] text-left"
      >
        <div className="grid grid-cols-3 gap-0">
          {panels.map(panel => (
            <Image key={panel.src} src={panel.src} alt={panel.alt} width={1080} height={1440}
              sizes="(max-width: 1280px) 33vw, 420px" preload
              className="block h-auto w-full" />
          ))}
        </div>
        <span className="flex items-center justify-between gap-3 border-t border-white/10 px-3 py-2.5 text-[10px] text-blue-100 sm:px-4 sm:text-xs">
          <span className="font-semibold">Polresta Batang <span className="hidden font-normal text-blue-200 sm:inline">· Melindungi, mengayomi, melayani</span></span>
          <span className="flex items-center gap-1.5 transition group-hover:text-white"><Expand className="size-3.5" /> Perbesar</span>
        </span>
      </button>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 py-3 text-[10px] sm:text-[11px]">
        <a href="https://www.instagram.com/polrestabatang/" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-navy-900">Materi resmi: @polrestabatang</a>
        <div className="flex items-center gap-5"><Link href="/profil" className="flex items-center gap-1 font-semibold text-navy-900">Profil pimpinan <ArrowUpRight className="size-3" /></Link><a href="tel:110" className="font-bold text-red-700">Darurat: 110</a></div>
      </div>
      <dialog ref={viewer} aria-label="Banner resmi Polresta Batang diperbesar"
        className="identity-banner-dialog fixed inset-0 m-auto w-[96vw] max-w-[1440px] max-h-[94dvh] border border-white/15 bg-navy-950 p-0 text-white shadow-2xl"
        onClick={event => { if (event.target === event.currentTarget) { const bounds = event.currentTarget.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) viewer.current?.close(); } }}>
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-navy-950 px-4 py-3"><div><h2 className="text-sm font-bold">Polresta Batang</h2><p className="mt-1 text-[10px] text-navy-200">Geser ke samping pada layar kecil untuk melihat setiap bagian.</p></div><button autoFocus type="button" onClick={() => viewer.current?.close()} aria-label="Tutup banner diperbesar" className="grid size-10 shrink-0 place-items-center border border-white/20 hover:bg-white/10"><X className="size-5" /></button></div>
        <div className="max-h-[80dvh] overflow-auto" tabIndex={0} aria-label="Tiga bagian banner menyambung; dapat digeser">
          <div className="grid min-w-[900px] grid-cols-3 gap-0">
            {panels.map(panel => <Image key={panel.src} src={panel.src} alt={panel.alt} width={1080} height={1440} sizes="480px" className="block h-auto w-full" />)}
          </div>
        </div>
      </dialog>
    </section>
  );
}
