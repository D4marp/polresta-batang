import Link from "next/link";
import { ArrowRight, CalendarDays, AlertTriangle, BadgeCheck, Car, FileText, Pill, Scale, ShieldCheck, Users } from "lucide-react";
import { NewsVisual } from "@/components/site/NewsVisual";
import { formatDate } from "@/lib/format";
import type { News } from "@/lib/types";

export function PageHero({title,subtitle}:{title:string;subtitle?:string}) {
 return <section className="container-x pt-8"><div className="border-b-2 border-navy-950 pb-6"><p className="mb-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400"><Link href="/" className="hover:text-red-700">Beranda</Link><span>/</span><span>{title}</span></p><h1 className="news-headline text-3xl leading-tight text-navy-950 sm:text-4xl">{title}</h1>{subtitle&&<p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">{subtitle}</p>}</div></section>;
}
export function SectionTitle({eyebrow,title,href,linkLabel="Lihat semua"}:{eyebrow?:string;title:string;href?:string;linkLabel?:string}) {
 return <div className="mb-5 flex items-end justify-between gap-4 border-b-2 border-navy-950 pb-3"><div>{eyebrow&&<p className="mb-1.5 text-[9px] font-bold uppercase tracking-[.18em] text-red-700">{eyebrow}</p>}<h2 className="news-headline text-2xl text-navy-950 sm:text-[28px]">{title}</h2></div>{href&&<Link href={href} className="mb-1 flex shrink-0 items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-red-700">{linkLabel}<ArrowRight className="size-3" /></Link>}</div>;
}
export function NewsCard({n,featured=false,compact=false}:{n:News;featured?:boolean;compact?:boolean}) {
 return <article className={compact?"py-6 first:pt-0":"h-full"}><Link href={`/berita/${n.slug}`} className={`group flex h-full gap-4 sm:gap-5 ${compact?'flex-row':'flex-col'}`}><NewsVisual news={n} className={compact?'aspect-[4/3] h-fit w-28 shrink-0 sm:w-52':'aspect-[16/10] w-full shrink-0'} /><div className="flex min-w-0 flex-1 flex-col"><span className="news-category">{n.category}</span><h3 className={`news-headline mt-2 leading-[1.25] text-navy-950 transition group-hover:text-red-800 ${featured?'text-2xl sm:text-3xl':compact?'text-base sm:text-[23px]':'text-xl'}`}>{n.title}</h3><p className={`mt-2 line-clamp-2 text-xs leading-6 text-slate-500 ${compact?'hidden sm:block':''}`}>{n.excerpt}</p><div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-slate-400"><CalendarDays className="size-3" /><time dateTime={n.createdAt}>{formatDate(n.createdAt)}</time><span className="hidden text-slate-300 sm:inline">/</span><span className="hidden sm:inline">{n.author}</span></div></div></Link></article>;
}
export function ServiceIcon({name,className}:{name:string;className?:string}) {
 const icons:Record<string,typeof Car>={car:Car,shield:ShieldCheck,file:FileText,alert:AlertTriangle,users:Users,badge:BadgeCheck,pill:Pill};const Icon=icons[name]||Scale;
 return <span className={className}><Icon className="size-6" /></span>;
}
