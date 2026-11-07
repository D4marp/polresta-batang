"use client";
import { useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";

export function ShareArticle({title}:{title:string}) {
 const [status,setStatus]=useState("");
 async function share(){
  try{
   if(navigator.share){await navigator.share({title,url:window.location.href});setStatus("");}
   else{await navigator.clipboard.writeText(window.location.href);setStatus("Tautan disalin");}
  }catch(error){if(error instanceof Error&&error.name==='AbortError')return;setStatus("Salin alamat artikel dari bilah alamat browser.");}
 }
 return <div className="flex flex-wrap items-center gap-3"><button onClick={share} className="flex items-center gap-2 border border-slate-200 px-3 py-2 text-[11px] font-semibold text-slate-600 hover:border-navy-900 hover:text-navy-900">{status==='Tautan disalin'?<Check className="size-3.5" />:<Share2 className="size-3.5" />} Bagikan</button><button onClick={async()=>{try{await navigator.clipboard.writeText(window.location.href);setStatus("Tautan disalin");}catch{setStatus("Salin alamat artikel dari bilah alamat browser.");}}} aria-label="Salin tautan artikel" className="grid size-8 place-items-center border border-slate-200 text-slate-500 hover:border-navy-900"><Link2 className="size-3.5" /></button><span role="status" className="text-[10px] text-slate-500">{status}</span></div>;
}
