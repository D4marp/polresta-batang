import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Info } from "lucide-react";
import { PageHero } from "@/components/site/parts";
import { getService, services } from "@/lib/services";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const svc = getService((await params).slug);
  return { title: svc ? `Layanan ${svc.title}` : "Layanan" };
}

export default async function ServiceDetail({ params }: Props) {
  const svc = getService((await params).slug);
  if (!svc) notFound();

  return (
    <>
      <PageHero title={svc.title} subtitle={svc.summary} />
      <div className="container-x grid gap-6 py-14 lg:grid-cols-2">
        <section className="card p-8">
          <h2 className="text-lg font-extrabold text-navy-900">Persyaratan</h2>
          <ul className="mt-4 space-y-3">
            {svc.requirements.map((r) => (
              <li key={r} className="flex gap-3 text-slate-600">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" /> {r}
              </li>
            ))}
          </ul>
        </section>
        <section className="card p-8">
          <h2 className="text-lg font-extrabold text-navy-900">Alur Pelayanan</h2>
          <ol className="mt-4 space-y-4">
            {svc.steps.map((st, i) => (
              <li key={st} className="flex gap-4 text-slate-600">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-navy-800 text-sm font-bold text-gold-400">
                  {i + 1}
                </span>
                <span className="pt-1">{st}</span>
              </li>
            ))}
          </ol>
        </section>
        {svc.note && (
          <p className="flex gap-3 rounded-2xl bg-gold-400/15 p-5 text-sm text-navy-900 lg:col-span-2">
            <Info className="size-5 shrink-0 text-gold-600" /> {svc.note}
          </p>
        )}
        <div className="lg:col-span-2">
          <Link href="/layanan" className="btn-ghost">
            ← Semua layanan
          </Link>
        </div>
      </div>
    </>
  );
}
