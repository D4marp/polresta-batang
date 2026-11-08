"use client";
import { useState } from "react";
import { Play, ArrowUpRight } from "lucide-react";
import { parseVideoUrl } from "@/lib/video";
export function VideoCard({title,url}:{title:string;url:string}) {
 const [playing,setPlaying]=useState(false);
 const video=parseVideoUrl(url);
 if (!video) return null;
 return <article className="overflow-hidden border border-slate-200 bg-white">
  <div className="aspect-video bg-navy-950 text-white">
   {playing && video.embed ? <iframe src={video.embed} title={title} className="h-full w-full border-0" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /> : video.embed ? <button onClick={()=>setPlaying(true)} aria-label={"Putar video: "+title} className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-navy-800 to-navy-950 p-6 hover:from-navy-700"><span className="grid size-14 place-items-center rounded-full border border-white/30 bg-white/10"><Play className="size-6" /></span><span className="text-xs font-semibold">Putar di {video.provider}</span></button> : <a href={video.url} target="_blank" rel="noopener noreferrer" className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-navy-800 to-navy-950 p-6 hover:from-navy-700"><Play className="size-8" /><span className="text-xs font-semibold">Tonton di {video.provider} ?</span></a>}
  </div>
  <div className="p-4"><p className="text-[10px] font-bold uppercase tracking-widest text-red-700">{video.provider}</p><h3 className="mt-2 text-base font-bold leading-snug text-navy-950">{title}</h3><a href={video.url} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center gap-1 text-xs text-slate-500 hover:text-red-700">Buka video asli <ArrowUpRight className="size-3" /></a></div>
 </article>;
}
