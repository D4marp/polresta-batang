"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { ArrowRight, Pause, Play } from "lucide-react";

type Headline = { id: string; title: string; slug: string };

export function NewsTicker({ items }: { items: Headline[] }) {
  const [paused, setPaused] = useState(false);
  const duration = Math.max(24, items.reduce((sum, item) => sum + item.title.length + 12, 0) / 9);

  return (
    <section aria-label="Judul berita terkini" className="news-ticker flex min-w-0 items-center gap-3 border-b border-slate-200 py-2.5 text-xs" data-paused={paused}>
      <span className="flex shrink-0 items-center gap-2 font-bold uppercase tracking-wider text-red-700">
        <span className="size-1.5 rounded-full bg-red-600" /> Terkini
      </span>
      <span className="h-4 w-px shrink-0 bg-slate-200" />
      {items.length ? <>
        <div id="headline-ticker" className="news-ticker-viewport min-w-0 flex-1 overflow-hidden py-2">
          <div className="news-ticker-track" style={{ "--ticker-duration": `${duration}s` } as CSSProperties}>
            {[false, true].map(copy => (
              <div key={String(copy)} className="news-ticker-group" aria-hidden={copy || undefined}>
                {items.map(item => (
                  <Link key={item.id} href={`/berita/${item.slug}`} tabIndex={copy ? -1 : undefined} prefetch={false}
                    className="inline-flex shrink-0 items-center gap-3 whitespace-nowrap text-slate-600 hover:text-red-700 focus-visible:text-red-700">
                    <span className="size-1 rounded-full bg-red-500" aria-hidden="true" />
                    {item.title}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
        <button type="button" onClick={() => setPaused(value => !value)} aria-controls="headline-ticker"
          aria-label={paused ? "Jalankan judul berita" : "Jeda judul berita"} title={paused ? "Jalankan" : "Jeda"}
          className="news-ticker-toggle grid size-9 shrink-0 place-items-center rounded border border-slate-200 text-slate-600 hover:bg-slate-100">
          {paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
        </button>
        <Link href="/berita" aria-label="Lihat semua berita" title="Semua berita" className="grid size-9 shrink-0 place-items-center text-slate-500 hover:text-red-700">
          <ArrowRight className="size-4" />
        </Link>
      </> : <p className="py-2 text-slate-500">Informasi terbaru akan ditampilkan di sini.</p>}
    </section>
  );
}
