import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Clock3 } from "lucide-react";
import { NewsCard, SectionTitle } from "@/components/site/parts";
import { NewsVisual } from "@/components/site/NewsVisual";
import { ShareArticle } from "@/components/site/ShareArticle";
import { getPublicNewsBySlug, getPublicNews } from "@/lib/public-data";
import { formatDate } from "@/lib/format";

type Props={params:Promise<{slug:string}>};
export async function generateMetadata({params}:Props):Promise<Metadata>{const n=await getPublicNewsBySlug((await params).slug);return n?{title:n.title,description:n.excerpt,openGraph:{title:n.title,description:n.excerpt,type:'article',publishedTime:n.createdAt,modifiedTime:n.updatedAt,authors:[n.author],images:n.image?[n.image]:[]}}:{title:'Berita tidak ditemukan'};}
export default async function NewsDetail({params}:Props){
 const n=await getPublicNewsBySlug((await params).slug);if(!n)notFound();
 const others=(await getPublicNews({limit:6})).filter(x=>x.id!==n.id);
 const related=(await getPublicNews({category:n.category,limit:4})).filter(x=>x.id!==n.id).slice(0,3);
 const reading=Math.max(1,Math.ceil(n.content.trim().split(/\s+/).length/200));
 return <div className="container-x py-7"><nav aria-label="Breadcrumb artikel" className="mb-7 flex flex-wrap items-center gap-2 text-[10px] font-medium text-slate-400"><Link href="/" className="hover:text-red-700">Beranda</Link><span>/</span><Link href="/berita" className="hover:text-red-700">Berita</Link><span>/</span><Link href={`/berita?kategori=${encodeURIComponent(n.category)}`} className="text-red-700">{n.category}</Link></nav>
 <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-12"><article className="min-w-0"><Link href={`/berita?kategori=${encodeURIComponent(n.category)}`} className="news-category">{n.category}</Link><h1 className="news-headline mt-3 max-w-4xl text-[clamp(1.9rem,4.3vw,3.4rem)] leading-[1.13] tracking-tight text-navy-950">{n.title}</h1><p className="mt-5 text-base leading-7 text-slate-500 sm:text-lg">{n.excerpt}</p>
 <div className="my-6 flex flex-wrap items-center justify-between gap-4 border-y border-slate-200 py-4"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-navy-50 text-xs font-extrabold text-navy-800">{n.author.split(' ').map(w=>w[0]).slice(0,2).join('')}</span><div><p className="text-xs font-bold text-navy-900">{n.author}</p><div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-slate-400"><time dateTime={n.createdAt}>{formatDate(n.createdAt,true)}</time><span>·</span><span className="flex items-center gap-1"><Clock3 className="size-3" />{reading} menit baca</span></div></div></div><ShareArticle title={n.title} /></div>
 <figure><NewsVisual news={n} priority className="aspect-[16/10] w-full" /><figcaption className="mt-2 border-b border-slate-100 pb-4 text-[10px] leading-5 text-slate-400">{n.image?n.title:'Foto ilustrasi kegiatan kepolisian Batang; bukan dokumentasi khusus peristiwa dalam artikel ini.'}</figcaption></figure><div className="news-article-body mx-auto mt-7 max-w-[680px] space-y-6">{n.content.split(/\n{2,}/).map((p,i)=><p key={i} className="whitespace-pre-line">{p}</p>)}</div><div className="mt-9 flex flex-wrap items-center justify-between gap-4 border-y border-slate-200 py-5"><Link href={`/berita?kategori=${encodeURIComponent(n.category)}`} className="bg-slate-100 px-3 py-2 text-[11px] font-bold text-slate-600"># {n.category}</Link><ShareArticle title={n.title} /></div></article>
 <aside className="lg:sticky lg:top-20"><SectionTitle title="Baca juga" /><div className="divide-y divide-slate-200">{others.slice(0,5).map((r,i)=><Link key={r.id} href={`/berita/${r.slug}`} className="group flex gap-4 py-4 first:pt-0"><span className="text-3xl font-light leading-none text-slate-300">{String(i+1).padStart(2,'0')}</span><div><span className="news-category">{r.category}</span><h2 className="mt-2 text-sm font-bold leading-6 text-navy-900 group-hover:text-red-700">{r.title}</h2><p className="mt-2 text-[10px] text-slate-400">{formatDate(r.createdAt)}</p></div></Link>)}</div><Link href="/berita" className="mt-5 flex items-center gap-2 text-xs font-bold text-navy-900">Semua berita <ArrowRight className="size-3.5" /></Link></aside></div>
 {related.length>0&&<section className="mt-12 border-t border-slate-200 pt-8"><SectionTitle title="Berita terkait" /><div className="grid gap-7 sm:grid-cols-3">{related.map(r=><NewsCard n={r} key={r.id} />)}</div></section>}</div>;
}
