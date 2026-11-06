import Link from "next/link";
import { ArrowRight, Phone, ShieldCheck, Clock3, ArrowUpRight, MessageSquare } from "lucide-react";
import { Img } from "@/components/Img";
import { NewsCard, SectionTitle, ServiceIcon } from "@/components/site/parts";
import { getSettings, listGallery, listNews } from "@/lib/db";
import { services } from "@/lib/services";

export default async function HomePage() {
  const [s, news, gallery] = await Promise.all([
    getSettings(),
    listNews(),
    listGallery(),
  ]);
  const [first, ...rest] = news;

  return (
    <>
      {/* HERO */}
      <section className="home-hero relative isolate overflow-hidden bg-navy-950 text-white">
        {(
          <Img
            src={s.heroImage || "/images/pelayanan-batang.jpg"}
            alt=""
            priority
            className="absolute inset-0 -z-20 size-full object-cover object-center opacity-55"
          />
        )}
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-navy-950 via-navy-950/85 to-navy-950/20" />
        <div className="container-x grid items-center gap-10 py-20 lg:grid-cols-5 lg:py-28">
          <div className="animate-fade-up lg:col-span-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-3 py-1 text-xs font-semibold text-gold-300">
              <ShieldCheck className="size-4" /> Polri PRESISI
            </span>
            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.24em] text-gold-300">Dekat dengan masyarakat</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl xl:text-6xl">
              {s.heroTitle}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-navy-200">{s.heroSubtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/layanan" className="btn-gold">
                Layanan Publik <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/pengaduan"
                className="btn border border-white/25 text-white hover:bg-white/10"
              >
                Buat Pengaduan
              </Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs text-slate-300"><span className="flex items-center gap-2"><Clock3 className="size-4 text-gold-400" /> SPKT siap melayani 24 jam</span><span className="flex items-center gap-2"><ShieldCheck className="size-4 text-gold-400" /> Profesional, transparan, humanis</span></div>
          </div>

          <div className="animate-fade-up lg:col-span-2">
            <a
              href={`tel:${s.hotline}`}
              className="relative block rounded-3xl border border-white/20 bg-navy-950/55 p-7 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-navy-900/80 lg:ml-8"
            >
              <span className="grid size-12 place-items-center rounded-2xl bg-gold-500 text-navy-950">
                <Phone className="size-6" />
              </span>
              <p className="mt-5 text-sm font-medium text-navy-200">Layanan Darurat Polisi</p>
              <p className="mt-2 text-7xl font-extrabold tracking-tight text-white">{s.hotline}</p>
              <p className="mt-2 text-sm text-navy-200">Bebas pulsa, aktif 24 jam.</p>
              <div className="mt-6 flex items-center justify-between border-t border-white/15 pt-5 text-sm font-semibold text-gold-300">Hubungi sekarang <ArrowUpRight className="size-5" /></div>
            </a>
          </div>
        </div>
      </section>

      {/* LAYANAN */}
      <section className="container-x -mt-10 relative z-10">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {services.slice(0, 4).map((svc) => (
            <Link
              key={svc.slug}
              href={`/layanan/${svc.slug}`}
              className="card group p-5 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <ServiceIcon
                name={svc.icon}
                className="grid size-12 place-items-center rounded-xl bg-navy-50 text-navy-700 transition group-hover:bg-navy-800 group-hover:text-gold-400"
              />
              <div className="mt-4 flex items-center justify-between gap-2"><h3 className="font-bold text-navy-900">{svc.title}</h3><ArrowUpRight className="size-4 shrink-0 text-slate-400 group-hover:text-navy-700" /></div>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                {svc.summary}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* BERITA */}
      <section className="container-x mt-20">
        <SectionTitle eyebrow="Informasi Terkini" title="Berita Terbaru" href="/berita" />
        {first ? (
          <div className="grid items-start gap-6 lg:grid-cols-2">
            <div>
              <NewsCard n={first} featured />
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">{rest.slice(0, 2).map((n) => <NewsCard key={n.id} n={n} compact />)}</div>
          </div>
        ) : (
          <p className="text-slate-500">Belum ada berita.</p>
        )}
        {rest.length > 2 && (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.slice(2, 5).map((n) => (
              <NewsCard key={n.id} n={n} />
            ))}
          </div>
        )}
      </section>

      {/* SAMBUTAN */}
      <section className="mt-20 bg-white py-16">
        <div className="container-x grid items-center gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="relative mx-auto aspect-4/5 max-w-sm overflow-hidden rounded-3xl bg-navy-100 shadow-xl">
              <Img src={s.leaderPhoto || "/images/pelayanan-batang.jpg"} alt={s.leaderPhoto ? s.leaderName : "Dokumentasi pelayanan kepolisian Batang"} className="size-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-navy-950/90 to-transparent p-5 text-white">
                <p className="font-bold">{s.leaderName}</p>
                <p className="text-xs text-navy-200">{s.leaderTitle}</p>
              </div>
            </div>
          </div>
          <div className="md:col-span-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-600">Sambutan</p>
            <h2 className="mt-1 text-2xl font-extrabold text-navy-900 sm:text-3xl">
              Pesan dari {s.leaderName}
            </h2>
            <p className="mt-5 whitespace-pre-line text-lg leading-relaxed text-slate-600">
              {s.leaderMessage}
            </p>
            <Link href="/profil" className="btn-primary mt-7">
              Selengkapnya <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* GALERI */}
      {gallery.length > 0 && (
        <section className="container-x mt-20">
          <SectionTitle eyebrow="Dokumentasi" title="Galeri Kegiatan" href="/galeri" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {gallery.slice(0, 8).map((g) => (
              <div key={g.id} className="aspect-square overflow-hidden rounded-2xl">
                <Img
                  src={g.image}
                  alt={g.title}
                  className="size-full object-cover transition duration-500 hover:scale-110"
                />
              </div>
            ))}
          </div>
        </section>
      )}
      <section className="container-x mt-20"><div className="relative overflow-hidden rounded-3xl bg-navy-900 p-8 text-white sm:p-12"><div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center"><div><span className="text-xs font-bold uppercase tracking-widest text-gold-300">Suara Anda berarti</span><h2 className="mt-3 text-2xl font-extrabold sm:text-3xl">Bersama menjaga Batang tetap aman.</h2><p className="mt-3 max-w-xl text-sm leading-relaxed text-navy-200">Sampaikan pertanyaan, masukan, dan pengaduan melalui kanal yang tersedia.</p></div><Link href="/pengaduan" className="btn-gold shrink-0"><MessageSquare className="size-4" /> Sampaikan Pengaduan</Link></div></div></section>
    </>
  );
}
