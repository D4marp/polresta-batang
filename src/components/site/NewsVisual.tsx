import { Img } from "@/components/Img";
import type { News } from "@/lib/types";

export function NewsVisual({news,className="",priority=false,fill=false}:{news:News;className?:string;priority?:boolean;fill?:boolean}) {
 const fallback=news.category==='Binmas'?'/images/polisi-penolong-batang.jpg':'/images/apel-polisi-batang.jpg';
 return <div className={`${fill?'absolute inset-0':'relative'} overflow-hidden bg-slate-100 ${className}`}><Img src={news.image||fallback} alt={news.image?news.title:'Ilustrasi kegiatan personel kepolisian Batang'} priority={priority} className="size-full object-cover transition duration-500 group-hover:scale-[1.035]" />{!news.image&&<span className="absolute bottom-2 left-2 bg-black/65 px-2 py-1 text-[9px] font-medium uppercase tracking-wider text-white">Ilustrasi</span>}</div>;
}
