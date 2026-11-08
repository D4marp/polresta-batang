import Link from "next/link";
import { NewsVisual } from "./NewsVisual";
import { formatDate } from "@/lib/format";
import type { News } from "@/lib/types";

export function NewsHighlights({news}:{news:News[]}){
 const [lead,...rest]=news.slice(0,5);
 if(!lead)return <section className="my-6 border border-slate-200 p-12 text-center"><h2 className="news-headline text-3xl text-navy-900">Kabar Batang, dalam satu portal.</h2><p className="mt-3 text-sm text-slate-500">Berita terbaru dari seluruh kategori akan tampil di sini.</p></section>;
 const tile=(n:News,featured=false)=><Link href={`/berita/${n.slug}`} className={"group relative block h-full min-h-52 overflow-hidden bg-navy-950 "+(featured?"min-h-80 lg:min-h-[430px]":"")}>
  <NewsVisual news={n} priority={featured} fill className=" h-full w-full transition duration-500 group-hover:scale-105" />
  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/20 to-transparent" />
  <div className={"absolute inset-x-0 bottom-0 "+(featured?"p-5 sm:p-7":"p-4")}><span className="inline-block bg-red-700 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-white">{n.category}</span><h2 className={"mt-3 font-bold leading-snug text-white group-hover:text-gold-200 "+(featured?"text-2xl sm:text-3xl":"text-sm sm:text-base")}>{n.title}</h2><p className="mt-3 text-[10px] text-slate-200">{n.author} · {formatDate(n.createdAt)}</p></div>
 </Link>;
 return <section aria-label="Berita utama dari seluruh kategori" className={"grid gap-1 border-b border-slate-200 py-6 "+(rest.length?"lg:grid-cols-[1.1fr_1fr]":"")}>
  <article>{tile(lead,true)}</article>
  {rest.length>0&&<div className="grid grid-cols-1 gap-1 sm:grid-cols-2">{rest.map((n,index)=><article key={n.id} className={rest.length%2===1&&index===rest.length-1?"sm:col-span-2":""}>{tile(n)}</article>)}</div>}
 </section>;
}
