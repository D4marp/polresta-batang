"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, House, Menu, Search, X } from "lucide-react";
import { menuTree, type MenuItem, type MenuNode } from "@/lib/navigation";

export function SiteNavigation({items}:{items:MenuItem[]}){
 const [open,setOpen]=useState(false);
 const wrapper=useRef<HTMLDivElement>(null);
 const close=()=>{setOpen(false);wrapper.current?.querySelectorAll("details[open]").forEach(el=>el.removeAttribute("open"));};
 useEffect(()=>{
  const closeDetails=()=>wrapper.current?.querySelectorAll("details[open]").forEach(el=>el.removeAttribute("open"));
  const outside=(event:PointerEvent)=>{if(!wrapper.current?.contains(event.target as Node)){closeDetails();setOpen(false)}};
  const escape=(event:KeyboardEvent)=>{if(event.key==="Escape"){const focused=document.activeElement;const detail=focused?.closest("details");if(detail){detail.removeAttribute("open");detail.querySelector("summary")?.focus();}else{closeDetails();setOpen(false)}}};
  document.addEventListener("pointerdown",outside);document.addEventListener("keydown",escape);
  return()=>{document.removeEventListener("pointerdown",outside);document.removeEventListener("keydown",escape)};
 },[]);
 const nodes=menuTree(items.filter(item=>item.enabled));
 const render=(list:MenuNode[],depth=0):React.ReactNode=><ul className={depth===0?"site-nav-roots":"site-nav-children"}>{list.map(item=><li key={item.id}>
  {item.children.length ? <details className={depth===0?"site-nav-dropdown":"site-nav-nested"}>
   <summary className="site-nav-link flex cursor-pointer list-none items-center justify-between gap-2 font-semibold"><span>{item.label}</span><ChevronDown className="size-3.5 shrink-0 transition" /></summary>
   <div className={depth===0?"site-nav-panel":"site-nav-nested-panel"}>{item.href!=="#"&&<Link href={item.href} onClick={close} className="site-nav-link block text-gold-300">Lihat {item.label.toLowerCase()}</Link>}{render(item.children,depth+1)}</div>
  </details> : <Link href={item.href} onClick={close} className="site-nav-link block font-semibold">{item.label}</Link>}
 </li>)}</ul>;
 return <div ref={wrapper} className="site-navigation sticky top-0 z-40 border-b border-navy-800 bg-navy-950 text-white">
  <div className="container-x flex flex-wrap items-center gap-x-3">
   <Link href="/" onClick={close} aria-label="Beranda" className="grid h-12 w-12 shrink-0 place-items-center bg-red-700 hover:bg-red-800"><House className="size-4" /></Link>
   <span className="flex-1 text-xs font-semibold lg:hidden">Berita & informasi Polresta Batang</span>
   <button type="button" onClick={()=>setOpen(!open)} aria-controls="website-navigation" aria-expanded={open} aria-label={open?"Tutup menu":"Buka menu"} className="ml-auto flex h-12 items-center gap-2 px-2 text-xs font-semibold lg:hidden">{open?<X className="size-5" />:<Menu className="size-5" />}Menu</button>
   <nav id="website-navigation" aria-label="Navigasi utama" className={(open?"block ":"hidden ")+"w-full pb-4 lg:block lg:w-auto lg:min-w-0 lg:flex-1 lg:pb-0"}>
    <form action="/berita" className="mb-3 flex items-center border-b border-white/20 lg:hidden"><input name="q" type="search" aria-label="Cari berita dalam menu" placeholder="Cari berita..." className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none" /><button aria-label="Cari" className="grid size-10 place-items-center"><Search className="size-4" /></button></form>
    {render(nodes)}
   </nav>
  </div>
 </div>;
}
