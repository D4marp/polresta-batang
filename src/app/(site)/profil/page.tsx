import type { Metadata } from "next";
import { Eye, Target } from "lucide-react";
import { PageHero } from "@/components/site/parts";
import { getSettings } from "@/lib/db";

export const metadata: Metadata = { title: "Profil" };

export default async function ProfilPage() {
  const s = await getSettings();
  return (
    <>
      <PageHero title="Profil" subtitle={`Mengenal lebih dekat ${s.name}.`} />
      <div className="container-x space-y-10 py-14">
        <div className="grid gap-6 md:grid-cols-2">
          <section className="card p-8">
            <span className="grid size-12 place-items-center rounded-xl bg-navy-800 text-gold-400">
              <Eye className="size-6" />
            </span>
            <h2 className="mt-4 text-xl font-extrabold text-navy-900">Visi</h2>
            <p className="mt-3 leading-relaxed text-slate-600">{s.visi}</p>
          </section>
          <section className="card p-8">
            <span className="grid size-12 place-items-center rounded-xl bg-navy-800 text-gold-400">
              <Target className="size-6" />
            </span>
            <h2 className="mt-4 text-xl font-extrabold text-navy-900">Misi</h2>
            <ol className="mt-3 space-y-3">
              {s.misi.map((m, i) => (
                <li key={i} className="flex gap-3 leading-relaxed text-slate-600">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-gold-400/20 text-xs font-bold text-gold-600">
                    {i + 1}
                  </span>
                  {m}
                </li>
              ))}
            </ol>
          </section>
        </div>

        <section className="card p-8">
          <h2 className="text-xl font-extrabold text-navy-900">Tentang Kami</h2>
          <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-600">{s.sejarah}</p>
        </section>
      </div>
    </>
  );
}
