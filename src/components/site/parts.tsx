import Link from "next/link";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { Img } from "@/components/Img";
import { formatDate } from "@/lib/format";
import type { News } from "@/lib/types";

export function PageHero({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <section className="relative overflow-hidden bg-navy-900 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(60%_80%_at_80%_0%,rgba(212,167,44,0.25),transparent_60%)]" />
      <div className="container-x relative py-14 sm:py-16">
        <h1 className="animate-fade-up text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-navy-200">{subtitle}</p>}
      </div>
    </section>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  href,
  linkLabel = "Lihat semua",
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-600">{eyebrow}</p>
        )}
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-navy-900 sm:text-3xl">{title}</h2>
      </div>
      {href && (
        <Link
          href={href}
          className="flex shrink-0 items-center gap-1 text-xs font-semibold text-navy-700 hover:text-navy-500 sm:text-sm"
        >
          {linkLabel} <ArrowUpRight className="size-4" />
        </Link>
      )}
    </div>
  );
}

export function NewsCard({ n, featured = false, compact = false }: { n: News; featured?: boolean; compact?: boolean }) {
  return (
    <Link
      href={`/berita/${n.slug}`}
      className={`card group flex h-full flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-lg ${compact ? "sm:flex-row" : ""}`}
    >
      <div className={`shrink-0 overflow-hidden ${compact ? "aspect-16/10 sm:aspect-auto sm:w-2/5" : featured ? "aspect-16/9" : "aspect-16/10"}`}>
        <Img
          src={n.image}
          alt={n.title}
          className="size-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-3 text-xs">
          <span className="rounded-full bg-navy-50 px-2.5 py-1 font-semibold text-navy-700">
            {n.category}
          </span>
          <span className="flex items-center gap-1 text-slate-500">
            <CalendarDays className="size-3.5" /> {formatDate(n.createdAt)}
          </span>
        </div>
        <h3
          className={`mt-3 font-bold leading-snug text-navy-900 group-hover:text-navy-600 ${
            featured ? "text-xl" : "text-base"
          }`}
        >
          {n.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">{n.excerpt}</p>
      </div>
    </Link>
  );
}

export function ServiceIcon({ name, className }: { name: string; className?: string }) {
  return <span className={className}>{iconFor(name)}</span>;
}

import {
  AlertTriangle,
  BadgeCheck,
  Car,
  FileText,
  Pill,
  Scale,
  ShieldCheck,
  Users,
} from "lucide-react";

function iconFor(name: string) {
  const c = "size-6";
  switch (name) {
    case "car":
      return <Car className={c} />;
    case "shield":
      return <ShieldCheck className={c} />;
    case "file":
      return <FileText className={c} />;
    case "alert":
      return <AlertTriangle className={c} />;
    case "users":
      return <Users className={c} />;
    case "badge":
      return <BadgeCheck className={c} />;
    case "pill":
      return <Pill className={c} />;
    default:
      return <Scale className={c} />;
  }
}
