"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, House, Menu, Phone, Search, X } from "lucide-react";
import { Img } from "@/components/Img";
import { NEWS_CATEGORIES } from "@/lib/types";

const links = [{href:"/profil",label:"Profil & Kapolresta"},{href:"/galeri",label:"Galeri"},{href:"/layanan",label:"Layanan publik"},{href:"/unduhan",label:"Unduhan"},{href:"/pengaduan",label:"Kontak & pengaduan"}];
export function Header({name,hotline,date}:{name:string;hotline:string;date:string}) {
 const pathname=usePathname();const [open,setOpen]=useState(false);
 return <>
  <header className="news-masthead bg-white">
   <div className="border-b border-slate-200"><div className="container-x flex min-h-9 items-center justify-between gap-3 text-[10px] text-slate-500 sm:text-[11px]"><time>{date}</time><div className="flex items-center gap-4"><Link href="/profil" className="hidden hover:text-red-700 sm:block">Tentang redaksi</Link><span className="hidden text-slate-300 sm:inline">|</span><a href={`tel:${hotline}`} className="flex items-center gap-1.5 font-bold text-navy-900"><Phone className="size-3" /> Polisi {hotline}</a></div></div></div>
   <div className="container-x flex items-center justify-between gap-5 py-6 sm:py-8">
    <Link href="/" className="flex min-w-0 items-center gap-3 sm:gap-4"><Img src="/logo.png" alt="Lambang Polda Jawa Tengah" priority className="h-14 w-11 shrink-0 object-contain sm:h-20 sm:w-16" /><span className="min-w-0"><span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[.2em] text-red-700 sm:text-[10px] sm:tracking-[.3em]">Portal berita & informasi kepolisian</span><span className="block text-[clamp(1.3rem,4.2vw,3rem)] font-extrabold uppercase leading-none tracking-[-.055em] text-navy-950">{name}</span><span className="mt-2 block text-[10px] text-slate-500 sm:text-xs">Kabar kepolisian. Dekat dengan masyarakat.</span></span></Link>
    <div className="hidden shrink-0 lg:block"><p className="mb-2 text-right text-[10px] font-semibold uppercase tracking-widest text-slate-400">Temukan informasi</p><form action="/berita" className="flex w-64 items-center border-b border-slate-300"><input name="q" type="search" aria-label="Cari berita" placeholder="Cari berita atau topik…" className="min-w-0 flex-1 bg-transparent py-2.5 text-xs outline-none" /><button aria-label="Cari" className="grid size-9 place-items-center text-navy-800"><Search className="size-4" /></button></form></div>
   </div>
  </header>
  <div className="sticky top-0 z-40 border-b border-navy-800 bg-navy-950 text-white">
   <div className="container-x flex items-center gap-4"><nav aria-label="Rubrik berita" className="flex min-w-0 flex-1 items-center overflow-x-auto news-scrollbar"><Link href="/" aria-label="Beranda" aria-current={pathname==='/'?'page':undefined} className={`grid h-12 w-12 shrink-0 place-items-center ${pathname==='/'?'bg-red-700':'hover:bg-white/10'}`}><House className="size-4" /></Link><Link href="/berita" className="whitespace-nowrap px-4 py-4 text-[11px] font-bold uppercase tracking-wider hover:text-gold-300">Semua berita</Link>{NEWS_CATEGORIES.map(c=><Link key={c} href={`/berita?kategori=${encodeURIComponent(c)}`} className="whitespace-nowrap px-4 py-4 text-[11px] font-semibold transition hover:bg-white/5 hover:text-gold-300">{c}</Link>)}</nav><button onClick={()=>setOpen(!open)} aria-controls="news-menu" aria-expanded={open} aria-label={open?'Tutup menu':'Buka menu'} className="flex h-10 shrink-0 items-center gap-2 border-l border-white/15 pl-4 text-xs font-semibold">{open?<X className="size-5" />:<Menu className="size-5" />}<span className="hidden sm:inline">Menu</span></button></div>
   {open&&<div id="news-menu" className="border-t border-white/10 bg-navy-900"><div className="container-x py-5"><form action="/berita" className="mb-4 flex items-center border-b border-white/25 lg:hidden"><input name="q" type="search" aria-label="Cari berita dalam menu" placeholder="Cari berita…" className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-navy-200" /><button aria-label="Cari" className="grid size-10 place-items-center"><Search className="size-4" /></button></form><nav aria-label="Informasi dan layanan" className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">{links.map(l=><Link key={l.href} href={l.href} onClick={()=>setOpen(false)} className="flex items-center justify-between gap-2 px-3 py-3 text-xs text-navy-100 hover:bg-white/5 hover:text-white">{l.label}<ArrowUpRight className="size-3.5" /></Link>)}</nav></div></div>}
  </div>
 </>;
}
