import type { Metadata } from "next";
import { Eye, Target } from "lucide-react";
import { PageHero } from "@/components/site/parts";
import { getPublicSettings } from "@/lib/public-data";
import { Img } from "@/components/Img";
import Link from "next/link";

export const metadata: Metadata = { title: "Profil" };

export default async function ProfilPage() {
  const s = await getPublicSettings();
  return (
    <>
      <PageHero title="Profil" subtitle={`Mengenal lebih dekat ${s.name}.`} />
      <div className="container-x space-y-10 py-14">
        <section className="grid items-start gap-7 border-b border-slate-200 pb-10 sm:grid-cols-[180px_minmax(0,1fr)]">
          <Img src={s.leaderPhoto || "/logo.png"} alt={s.leaderPhoto ? s.leaderName : "Lambang Polda Jawa Tengah"} className={s.leaderPhoto ? "aspect-[3/4] w-full max-w-44 object-cover object-top" : "h-40 w-32 object-contain"} />
          <div><p className="news-category">Profil pimpinan</p><h2 className="news-headline mt-2 text-3xl text-navy-900">{s.leaderName}</h2><p className="mt-2 text-xs font-semibold text-slate-500">{s.leaderTitle}</p><p className="mt-5 max-w-3xl whitespace-pre-line text-sm leading-7 text-slate-600">{s.leaderMessage}</p><Link href="/berita?kategori=Kapolresta" className="mt-5 inline-block text-xs font-bold text-red-700">Berita & agenda Kapolresta →</Link></div>
        </section>
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
