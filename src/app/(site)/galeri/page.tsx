import type { Metadata } from "next";
import Link from "next/link";
import { Img } from "@/components/Img";
import { PageHero } from "@/components/site/parts";
import { VideoCard } from "@/components/site/VideoCard";
import { getPublicGallery, getPublicVideos, getPublicMediaCount } from "@/lib/public-data";

export const metadata: Metadata = { title: "Galeri" };

export default async function GaleriPage({searchParams}:{searchParams:Promise<{foto?:string;video?:string}>}) {
  const selected=await searchParams;
  const [photoTotal,videoTotal]=await Promise.all([getPublicMediaCount("gallery"),getPublicMediaCount("videos")]);
  const photoPages=Math.max(1,Math.ceil(photoTotal/12)),videoPages=Math.max(1,Math.ceil(videoTotal/9));
  const photoPage=Math.min(photoPages,Math.max(1,Math.floor(Number(selected.foto))||1)),videoPage=Math.min(videoPages,Math.max(1,Math.floor(Number(selected.video))||1));
  const [items,videos]=await Promise.all([getPublicGallery(12,(photoPage-1)*12),getPublicVideos(9,(videoPage-1)*9)]);
  return (
    <>
      <PageHero title="Galeri" subtitle="Dokumentasi foto dan video kegiatan Polresta Batang." />
      <div className="container-x py-12">
        <nav aria-label="Jenis galeri" className="mb-8 flex gap-5 border-b border-slate-200 pb-4 text-sm font-bold text-navy-900"><a href="#foto">Galeri foto ({photoTotal})</a><a href="#video">Galeri video ({videoTotal})</a></nav>
        <h2 id="foto" className="mb-5 scroll-mt-8 text-xl font-bold text-navy-900">Galeri foto</h2>
        {items.length ? (
          <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
            {items.map((g) => (
              <figure key={g.id} className="group mb-4 break-inside-avoid overflow-hidden rounded-2xl bg-white shadow-sm">
                <Img src={g.image} alt={g.title} className="w-full transition duration-500 group-hover:scale-105" />
                <figcaption className="p-3 text-sm font-medium text-slate-700">{g.title}</figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <p className="card p-10 text-center text-slate-500">Belum ada foto di galeri.</p>
        )}
        <MediaPages kind="foto" current={photoPage} pages={photoPages} other={videoPage} />
        <section id="video" className="mt-12 scroll-mt-8 border-t border-slate-200 pt-8"><h2 className="mb-5 text-xl font-bold text-navy-900">Galeri video</h2>{videos.length ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{videos.map(v => <VideoCard key={v.id} title={v.title} url={v.url} description={v.description} thumbnail={v.thumbnail} detailHref={`/video/${v.id}`} />)}</div> : <p className="card p-10 text-center text-slate-500">Dokumentasi video akan tampil di sini setelah ditambahkan oleh redaksi.</p>}<MediaPages kind="video" current={videoPage} pages={videoPages} other={photoPage} /></section>
      </div>
    </>
  );
}
function MediaPages({kind,current,pages,other}:{kind:"foto"|"video";current:number;pages:number;other:number}){
 if(pages<=1)return null;
 const href=(page:number)=>`/galeri?${kind}=${page}&${kind==="foto"?"video":"foto"}=${other}#${kind}`;
 return <nav aria-label={`Halaman ${kind}`} className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-navy-900">{current>1&&<Link href={href(current-1)} className="border border-slate-200 px-4 py-2">Sebelumnya</Link>}<span>Halaman {current} dari {pages}</span>{current<pages&&<Link href={href(current+1)} className="border border-slate-200 px-4 py-2">Berikutnya</Link>}</nav>;
}
