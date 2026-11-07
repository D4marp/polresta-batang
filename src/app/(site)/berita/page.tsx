import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { NewsCard, PageHero } from "@/components/site/parts";
import { listNews } from "@/lib/db";
import { NEWS_CATEGORIES } from "@/lib/types";

export const metadata: Metadata = { title: "Berita" };

type Props = { searchParams: Promise<{ q?: string; kategori?: string; page?: string }> };
const PER_PAGE = 9;

export default async function BeritaPage({ searchParams }: Props) {
  const { q, kategori, page } = await searchParams;
  const all = await listNews({ q, category: kategori });
  const pages = Math.max(1, Math.ceil(all.length / PER_PAGE));
  const current = Math.min(Math.max(Math.floor(Number(page)) || 1, 1), pages);
  const items = all.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const href = (o: { kategori?: string; page?: number }) => {
    const p = new URLSearchParams();
    const k = "kategori" in o ? o.kategori : kategori;
    if (q) p.set("q", q);
    if (k) p.set("kategori", k);
    if (o.page && o.page > 1) p.set("page", String(o.page));
    const qs = p.toString();
    return `/berita${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <PageHero title={kategori || "Arsip berita"} subtitle={q ? `Hasil pencarian untuk “${q}”.` : "Kabar kepolisian, agenda Kapolresta, dan informasi masyarakat Batang."} />
      <div className="container-x py-12">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {[undefined, ...NEWS_CATEGORIES].map((c) => (
              <Link
                key={c ?? "all"}
                href={href({ kategori: c })}
                aria-current={(kategori ?? undefined) === c ? "page" : undefined}
                className={`rounded-sm px-4 py-2 text-xs font-semibold transition ${
                  (kategori ?? undefined) === c
                    ? "bg-navy-800 text-white"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
                }`}
              >
                {c ?? "Semua"}
              </Link>
            ))}
          </div>
          <form action="/berita" className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              name="q"
              aria-label="Cari berita"
              type="search"
              defaultValue={q}
              placeholder="Cari berita..."
              className="input pl-9"
            />
            {kategori && <input type="hidden" name="kategori" value={kategori} />}
          </form>
        </div>

        <p className="mb-6 border-b border-slate-200 pb-4 text-[11px] text-slate-400">{all.length} berita ditemukan{q ? ` untuk “${q}”` : ""}</p>

        {items.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((n) => (
              <NewsCard key={n.id} n={n} />
            ))}
          </div>
        ) : (
          <p className="card p-10 text-center text-slate-500">Tidak ada berita ditemukan.</p>
        )}

        {pages > 1 && (
          <nav className="mt-10 flex justify-center gap-2" aria-label="Halaman">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={href({ page: p })}
                aria-current={p === current ? "page" : undefined}
                className={`grid size-10 place-items-center rounded-xl text-sm font-semibold ${
                  p === current
                    ? "bg-navy-800 text-white"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
                }`}
              >
                {p}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </>
  );
}
