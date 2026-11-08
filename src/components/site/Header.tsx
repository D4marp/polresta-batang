"use client";

import Link from "next/link";


import { Phone, Search } from "lucide-react";
import { Img } from "@/components/Img";
import type { MenuItem } from "@/lib/navigation";
import { SiteNavigation } from "./SiteNavigation";

export function Header({name,hotline,date,menuItems}:{name:string;hotline:string;date:string;menuItems:MenuItem[]}) {

 return <>
  <header className="news-masthead bg-white">
   <div className="border-b border-slate-200"><div className="container-x flex min-h-9 items-center justify-between gap-3 text-[10px] text-slate-500 sm:text-[11px]"><time>{date}</time><div className="flex items-center gap-4"><Link href="/profil" className="hidden hover:text-red-700 sm:block">Tentang redaksi</Link><span className="hidden text-slate-300 sm:inline">|</span><a href={`tel:${hotline}`} className="flex items-center gap-1.5 font-bold text-navy-900"><Phone className="size-3" /> Polisi {hotline}</a></div></div></div>
   <div className="container-x flex items-center justify-between gap-5 py-6 sm:py-8">
    <Link href="/" className="flex min-w-0 items-center gap-3 sm:gap-4"><Img src="/logo.png" alt="Lambang Polda Jawa Tengah" priority className="h-14 w-11 shrink-0 object-contain sm:h-20 sm:w-16" /><span className="min-w-0"><span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[.2em] text-red-700 sm:text-[10px] sm:tracking-[.3em]">Portal berita & informasi kepolisian</span><span className="block text-[clamp(1.3rem,4.2vw,3rem)] font-extrabold uppercase leading-none tracking-[-.055em] text-navy-950">{name}</span><span className="mt-2 block text-[10px] text-slate-500 sm:text-xs">Kabar kepolisian. Dekat dengan masyarakat.</span></span></Link>
    <div className="hidden shrink-0 lg:block"><p className="mb-2 text-right text-[10px] font-semibold uppercase tracking-widest text-slate-400">Temukan informasi</p><form action="/berita" className="flex w-64 items-center border-b border-slate-300"><input name="q" type="search" aria-label="Cari berita" placeholder="Cari berita atau topik…" className="min-w-0 flex-1 bg-transparent py-2.5 text-xs outline-none" /><button aria-label="Cari" className="grid size-9 place-items-center text-navy-800"><Search className="size-4" /></button></form></div>
   </div>
  </header>
  <SiteNavigation items={menuItems} />
 </>;
}
