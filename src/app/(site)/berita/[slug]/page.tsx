import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, User } from "lucide-react";
import { Img } from "@/components/Img";
import { NewsCard } from "@/components/site/parts";
import { getNewsBySlug, listNews } from "@/lib/db";
import { formatDate } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const n = await getNewsBySlug((await params).slug);
  return n
    ? {
        title: n.title,
        description: n.excerpt,
        openGraph: { title: n.title, description: n.excerpt, images: n.image ? [n.image] : [] },
      }
    : { title: "Berita tidak ditemukan" };
}

export default async function NewsDetail({ params }: Props) {
  const n = await getNewsBySlug((await params).slug);
  if (!n) notFound();
  const related = (await listNews({ category: n.category })).filter((x) => x.id !== n.id).slice(0, 3);

  return (
    <div className="container-x max-w-4xl py-12">
      <Link href="/berita" className="text-sm font-semibold text-navy-700 hover:underline">
        ← Semua berita
      </Link>
      <article className="mt-5">
        <span className="rounded-full bg-navy-50 px-3 py-1 text-xs font-semibold text-navy-700">
          {n.category}
        </span>
        <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-navy-900 sm:text-4xl">
          {n.title}
        </h1>
        <div className="mt-4 flex flex-wrap gap-5 text-sm text-slate-500">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-4" /> {formatDate(n.createdAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <User className="size-4" /> {n.author}
          </span>
        </div>
        {n.image && (
          <Img
            src={n.image}
            alt={n.title}
            className="mt-8 aspect-video w-full rounded-3xl object-cover shadow-lg"
          />
        )}
        <div className="mt-8 space-y-5 text-lg leading-8 text-slate-700">
          {n.content.split(/\n{2,}/).map((p, i) => (
            <p key={i} className="whitespace-pre-line">
              {p}
            </p>
          ))}
        </div>
      </article>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-xl font-extrabold text-navy-900">Berita Terkait</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {related.map((r) => (
              <NewsCard key={r.id} n={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
