import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Camera, Clock3, FileText, Phone } from "lucide-react";
import { Img } from "@/components/Img";
import { NewsCard, SectionTitle } from "@/components/site/parts";
import { NewsHighlights } from "@/components/site/NewsHighlights";
import { CategorySections } from "@/components/site/CategorySections";
import { VideoCard } from "@/components/site/VideoCard";
import { NewsTicker } from "@/components/site/NewsTicker";
import { IdentityBanner } from "@/components/site/IdentityBanner";
import { getSettings, listGallery, listNews, listVideos } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { NEWS_CATEGORIES } from "@/lib/types";

export const metadata: Metadata = { title: "Berita Kepolisian Batang", description: "Kabar terbaru Polresta Batang: kegiatan Kapolresta, kamtibmas, lalu lintas, dan informasi untuk masyarakat." };
export default async function HomePage() {
 const [s,news,gallery,videos]=await Promise.all([getSettings(),listNews(),listGallery(),listVideos()]);

 const leaderNews=news.filter(n=>n.category==='Kapolresta'||/kapolres/i.test(n.title)).slice(0,3);
 const announcements=news.filter(n=>n.category==='Pengumuman').slice(0,3);
 const photos=gallery.length?gallery.slice(0,4):[{id:'archive-patrol',image:'/images/apel-polisi-batang.jpg',title:'Arsip foto: patroli gabungan personel pengamanan di Batang.'},{id:'archive-training',image:'/images/polisi-penolong-batang.jpg',title:'Arsip foto: pelatihan pemadaman api oleh personel kepolisian Batang.'}];
 return <div className="container-x pb-8">
  <h1 className="sr-only">Berita Kepolisian Batang</h1>
  <IdentityBanner />
  <NewsTicker items={news.slice(0,8).map(({id,title,slug})=>({id,title,slug}))} />
  <NewsHighlights news={news} />
  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-slate-200 py-4"><span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Jelajahi rubrik</span>{NEWS_CATEGORIES.map(c=><Link key={c} href={`/berita?kategori=${encodeURIComponent(c)}`} className="text-[11px] font-semibold text-slate-600 transition hover:text-red-700"># {c}</Link>)}</div>
  <div className="grid items-start gap-10 pt-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12">
   <section><SectionTitle eyebrow="Dari ruang redaksi" title="Berita terkini" href="/berita" /><div className="divide-y divide-slate-200">{news.slice(0,8).map(n=><NewsCard key={n.id} n={n} compact />)}{!news.length&&<p className="py-8 text-sm text-slate-500">Belum ada berita terbit.</p>}</div><Link href="/berita" className="mt-7 flex items-center justify-center gap-2 border border-slate-300 px-5 py-3.5 text-xs font-bold text-navy-900 transition hover:border-navy-900 hover:bg-navy-950 hover:text-white">Arsip berita <ArrowRight className="size-3.5" /></Link></section>
   <aside className="space-y-8">
    <section className="border border-slate-200"><div className="border-b border-slate-200 px-5 py-4"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-red-700">Dari ruang pimpinan</p><h2 className="news-headline mt-1 text-2xl text-navy-950">Kabar Kapolresta</h2></div><Link href="/profil" className="block"><Image src="/images/kotak.jpeg" alt="Sambutan Kapolresta Batang: Polisi Bersama Masyarakat, Hadir untuk Melindungi, Mengayomi, dan Melayani" width={1024} height={1536} sizes="(max-width: 1023px) 90vw, 300px" className="h-auto w-full" /></Link><div className="px-5 py-4">{leaderNews.length?<ul className="divide-y divide-slate-100">{leaderNews.map(n=><li key={n.id} className="py-3"><Link href={`/berita/${n.slug}`} className="text-xs font-semibold leading-5 text-navy-900 hover:text-red-700">{n.title}</Link></li>)}</ul>:<p className="text-xs leading-6 text-slate-500">Mengenal pimpinan, visi, dan agenda pelayanan kepolisian untuk masyarakat Batang.</p>}<Link href="/profil" className="mt-4 flex items-center gap-2 text-xs font-bold text-navy-900 hover:text-red-700">Profil & informasi satuan <ArrowUpRight className="size-3.5" /></Link></div></section>
    <section><h2 className="border-b-2 border-navy-950 pb-3 text-sm font-extrabold uppercase tracking-wider text-navy-900">Papan informasi</h2>{announcements.length?announcements.map(n=><Link key={n.id} href={`/berita/${n.slug}`} className="group flex gap-3 border-b border-slate-200 py-4"><FileText className="mt-0.5 size-4 shrink-0 text-red-700" /><div><p className="text-xs font-bold leading-5 text-navy-900 group-hover:text-red-700">{n.title}</p><p className="mt-1 text-[10px] text-slate-400">{formatDate(n.createdAt)}</p></div></Link>):<p className="py-4 text-xs text-slate-500">Belum ada pengumuman.</p>}</section>
    <section className="bg-navy-950 p-5 text-white"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-gold-300">Informasi masyarakat</p><a href={`tel:${s.hotline}`} className="mt-3 flex items-center justify-between gap-4"><div><p className="text-xs text-navy-100">Layanan darurat polisi</p><p className="mt-1 text-4xl font-extrabold tracking-tight">{s.hotline}</p></div><Phone className="size-7 text-gold-300" /></a><p className="mt-3 flex items-center gap-1.5 text-[10px] text-navy-200"><Clock3 className="size-3" /> Aktif 24 jam · Bebas pulsa</p><div className="mt-5 grid grid-cols-2 gap-2 border-t border-white/15 pt-4"><Link href="/layanan" className="text-[11px] font-semibold text-white hover:text-gold-300">Layanan publik ↗</Link><Link href="/pengaduan" className="text-[11px] font-semibold text-white hover:text-gold-300">Pengaduan ↗</Link></div></section>
   </aside>
  </div>
  <CategorySections news={news} />
  <section className="mt-12 border-t border-slate-200 pt-9"><SectionTitle eyebrow="Cerita dalam gambar" title={gallery.length?'Lensa kegiatan':'Arsip foto kepolisian'} href={gallery.length?'/galeri':undefined} /><div className={`grid gap-5 sm:grid-cols-2 ${gallery.length?'lg:grid-cols-4':''}`}>{photos.map(g=><figure key={g.id} className="group"><div className="relative overflow-hidden"><Img src={g.image} alt={g.title} className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-[1.035]" /><span className="absolute bottom-3 left-3 grid size-8 place-items-center bg-white text-navy-900"><Camera className="size-4" /></span></div><figcaption className="mt-3 text-xs font-semibold leading-5 text-navy-900">{g.title}</figcaption></figure>)}</div></section>
  <section className="mt-12 border-t border-slate-200 pt-9"><SectionTitle eyebrow="Dokumentasi bergerak" title="Galeri video" href="/galeri#video" />{videos.length ? <div className="grid gap-5 md:grid-cols-3">{videos.slice(0,3).map(v=><VideoCard key={v.id} title={v.title} url={v.url} description={v.description} thumbnail={v.thumbnail} detailHref={`/video/${v.id}`} />)}</div> : <p className="py-5 text-sm text-slate-500">Video kegiatan akan tersedia setelah ditambahkan oleh redaksi.</p>}</section>
 </div>;
}
