"use client";
import { useState } from "react";
import { Play, ArrowUpRight, X } from "lucide-react";
import { parseVideoUrl, validThumbnailUrl } from "@/lib/video";
import { Img } from "@/components/Img";
type Props={title:string;url:string;description?:string;thumbnail?:string};
export function VideoCard(props:Props){return <VideoContent key={props.url} {...props} />;}
function VideoContent({title,url,description,thumbnail}:Props){
 const [playing,setPlaying]=useState(false);
 const video=parseVideoUrl(url);
 if(!video)return null;
 const cover=(thumbnail && validThumbnailUrl(thumbnail)?thumbnail:undefined)||video.thumbnail;
 const embed=video.embed?new URL(video.embed):undefined;
 if(embed && ["YouTube","Vimeo","TikTok"].includes(video.provider))embed.searchParams.set("autoplay","1");
 return <article className="overflow-hidden border border-slate-200 bg-white">
 <div className={"relative bg-navy-950 text-white "+(playing&&video.portrait?"aspect-[4/5]":"aspect-video")}>
 {playing&&embed ? <iframe src={embed.toString()} title={title} className="absolute inset-0 h-full w-full border-0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /> : <>
 {cover&&<Img src={cover} alt={"Thumbnail video: "+title} className="absolute inset-0 h-full w-full object-cover" />}
 {video.embed ? <button type="button" onClick={()=>setPlaying(true)} aria-label={"Putar video di website: "+title} className="absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-t from-black/75 via-black/20 to-black/10 p-5 transition hover:bg-black/30"><span className="grid size-14 place-items-center rounded-full border border-white/60 bg-red-700 shadow-lg"><Play className="ml-0.5 size-6 fill-current" /></span><span className="text-xs font-semibold drop-shadow">Tonton di sini</span></button> : <a href={video.url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/45 p-5"><Play className="size-8" /><span className="text-xs font-semibold">Tonton di {video.provider}</span></a>}
 <span className="pointer-events-none absolute left-3 top-3 rounded bg-black/65 px-2 py-1 text-[10px] font-bold uppercase tracking-wider">{video.provider}</span>
 </>}
 </div>
 <div className="p-4"><p className="text-[10px] font-bold uppercase tracking-widest text-red-700">{video.provider}</p><h3 className="mt-2 text-base font-bold leading-snug text-navy-950">{title}</h3>
 {description&&<div className="mt-3 text-sm leading-6 text-slate-600"><p className={description.length>180?"line-clamp-3 whitespace-pre-line":"whitespace-pre-line"}>{description}</p>{description.length>180&&<details className="mt-1"><summary className="cursor-pointer text-xs font-semibold text-navy-700">Baca narasi lengkap</summary><p className="mt-2 whitespace-pre-line">{description}</p></details>}</div>}
 {playing&&<><button type="button" onClick={()=>setPlaying(false)} className="mt-3 flex items-center gap-1 text-xs font-semibold text-navy-700"><X className="size-3.5" /> Tutup pemutar</button><p className="mt-2 text-[11px] leading-5 text-slate-500">Jika pemutar dibatasi oleh pemilik video, gunakan tautan video asli.</p></>}
 <a href={video.url} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center gap-1 text-xs text-slate-500 hover:text-red-700">Buka video asli <ArrowUpRight className="size-3" /></a></div>
 </article>;
}
