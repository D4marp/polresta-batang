import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, ServiceIcon } from "@/components/site/parts";
import { services } from "@/lib/services";

export const metadata: Metadata = { title: "Layanan Publik" };

export default function LayananPage() {
  return (
    <>
      <PageHero
        title="Layanan Publik"
        subtitle="Informasi persyaratan dan alur layanan kepolisian di Polresta Batang."
      />
      <div className="container-x grid gap-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((svc) => (
          <Link
            key={svc.slug}
            href={`/layanan/${svc.slug}`}
            className="card group p-6 transition hover:-translate-y-1 hover:shadow-lg"
          >
            <ServiceIcon
              name={svc.icon}
              className="grid size-12 place-items-center rounded-xl bg-navy-50 text-navy-700 transition group-hover:bg-navy-800 group-hover:text-gold-400"
            />
            <h2 className="mt-4 font-bold text-navy-900">{svc.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{svc.summary}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
