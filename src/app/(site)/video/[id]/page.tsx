import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getVideoById, listVideos } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { parseVideoUrl } from "@/lib/video";
import { VideoCard } from "@/components/site/VideoCard";
import { ShareArticle } from "@/components/site/ShareArticle";
import { SectionTitle } from "@/components/site/parts";

type Props = {params:Promise<{id:string}>};
export async function generateMetadata({params}:Props):Promise<Metadata> {
  const item=await getVideoById((await params).id);
  if(!item)return {title:"Video tidak ditemukan"};
  const description=item.description.slice(0,160)||`Tonton ${item.title} dalam galeri video Polresta Batang.`;
  const image=item.thumbnail||parseVideoUrl(item.url)?.thumbnail;
  return {title:item.title,description,alternates:{canonical:`/video/${item.id}`},openGraph:{title:item.title,description,images:image?[image]:[]}};
}

export default async function VideoDetail({params}:Props) {
  const item=await getVideoById((await params).id);
  if(!item)notFound();
  const related=(await listVideos()).filter(v=>v.id!==item.id).slice(0,3);
  const date=new Date(item.created_at).toISOString();
  return <div className="container-x py-7 sm:py-10">
    <nav aria-label="Breadcrumb video" className="mb-7 flex flex-wrap items-center gap-2 text-xs text-slate-500"><Link href="/" className="hover:text-red-700">Beranda</Link><span>/</span><Link href="/galeri#video" className="hover:text-red-700">Galeri video</Link><span>/</span><span className="text-red-700">Detail video</span></nav>
    <article className="mx-auto max-w-5xl">
      <p className="news-category">Dokumentasi video</p>
      <h1 className="news-headline mt-3 text-[clamp(1.8rem,4vw,3.2rem)] leading-tight text-navy-950">{item.title}</h1>
      <div className="my-6 flex flex-wrap items-center justify-between gap-4 border-y border-slate-200 py-4"><div><p className="text-xs font-bold text-navy-900">{item.uploaded_by_name}</p><time dateTime={date} className="mt-1 block text-xs text-slate-500">{formatDate(date,true)}</time></div><ShareArticle title={item.title} /></div>
      <div className="mx-auto max-w-4xl"><VideoCard title={item.title} url={item.url} thumbnail={item.thumbnail} playerOnly /></div>
      <div className="mx-auto mt-8 max-w-3xl"><h2 className="text-lg font-bold text-navy-900">Tentang video</h2>{item.description ? <div className="mt-4 space-y-5 text-base leading-8 text-slate-700">{item.description.split(/\n\s*\n/).map((paragraph,index)=><p key={index} className="whitespace-pre-line">{paragraph}</p>)}</div> : <p className="mt-4 text-sm leading-7 text-slate-500">Dokumentasi kegiatan Polresta Batang. Narasi tambahan belum tersedia.</p>}
        <p className="mt-6 text-xs leading-6 text-slate-400">Tonton langsung melalui pemutar di atas. Ketersediaan pemutaran mengikuti izin pemilik video.</p>
        <Link href="/galeri#video" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-navy-900 hover:text-red-700"><ArrowLeft className="size-4" /> Kembali ke galeri video</Link>
      </div>
    </article>
    {related.length>0&&<section className="mt-12 border-t border-slate-200 pt-8"><SectionTitle title="Video lainnya" href="/galeri#video" /><div className="grid gap-5 md:grid-cols-3">{related.map(v=><VideoCard key={v.id} title={v.title} url={v.url} description={v.description} thumbnail={v.thumbnail} detailHref={`/video/${v.id}`} />)}</div></section>}
  </div>;
}
