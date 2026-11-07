import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import { FileText, Images, Mail, Newspaper, Plus, ArrowUpRight, CheckCircle2, Circle } from "lucide-react";
import { PageHeader } from "@/components/dashboard/parts";
import { getSettings, listDocuments, listGallery, listMessages, listNews } from "@/lib/db";
import { formatDate } from "@/lib/format";

export default async function DashboardHome() {
  await requireAdmin();
  const [news, gallery, docs, messages, settings] = await Promise.all([
    listNews({ includeDrafts: true }),
    listGallery(),
    listDocuments(),
    listMessages(),
    getSettings(),
  ]);
  const stats = [
    { label: "Berita", value: news.length, sub: `${news.filter((n) => n.status === "draft").length} draf`, icon: Newspaper, href: "/dashboard/berita" },
    { label: "Foto Galeri", value: gallery.length, sub: "foto", icon: Images, href: "/dashboard/galeri" },
    { label: "Dokumen", value: docs.length, sub: "file", icon: FileText, href: "/dashboard/dokumen" },
    { label: "Pesan Masuk", value: messages.length, sub: `${messages.filter((m) => !m.read).length} belum dibaca`, icon: Mail, href: "/dashboard/pesan" },
  ];
  const checks = [
    { label: "Berita utama memiliki foto", done: Boolean(news.find(n=>n.status === "published")?.image), href: "/dashboard/berita" },
    { label: "Foto dan identitas pimpinan", done: Boolean(settings.leaderPhoto) && settings.leaderName !== "Kapolresta Batang", href: "/dashboard/pengaturan" },
    { label: "Kontak satuan sudah dilengkapi", done: Boolean(settings.phone && !settings.phone.includes("000000") && settings.email && settings.mapsEmbed), href: "/dashboard/pengaturan" },
    { label: "Berita resmi dengan foto", done: news.some(n => n.status === "published" && n.image && !n.content.includes("contoh konten awal")), href: "/dashboard/berita" },
    { label: "Konten contoh sudah diganti", done: !news.some(n => n.status === "published" && n.content.includes("contoh konten awal")), href: "/dashboard/berita" },
    { label: "Dokumentasi kegiatan tersedia", done: gallery.length > 0, href: "/dashboard/galeri" },
  ];
  const complete = checks.filter(c => c.done).length;

  return (
    <>
      <PageHeader
        title="Meja redaksi"
        desc={`Selamat datang di ruang redaksi ${settings.name}.`}
        action={
          <Link href="/dashboard/berita/baru" className="btn-primary">
            <Plus className="size-4" /> Tulis Berita
          </Link>
        }
      />
      <section className="card mb-7 flex flex-wrap items-center justify-between gap-4 border-l-4 border-l-red-700 p-5"><div><p className="text-[10px] font-bold uppercase tracking-widest text-red-700">Status publikasi</p><h2 className="mt-2 text-lg font-bold text-navy-900">{news.filter(n=>n.status==='published').length} berita terbit <span className="mx-2 font-normal text-slate-300">/</span> {news.filter(n=>n.status==='draft').length} draf</h2><p className="mt-1 text-xs text-slate-500">Berita terbaru yang terbit otomatis menjadi headline portal.</p></div><Link href="/dashboard/berita" className="btn-ghost text-xs">Kelola berita <ArrowUpRight className="size-4" /></Link></section>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, sub, icon: Icon, href }, index) => (
          <Link key={label} href={href} className="card group p-5 transition hover:-translate-y-0.5 hover:border-navy-200 hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <span className={`grid size-10 place-items-center rounded-xl ${["bg-blue-50 text-blue-700", "bg-violet-50 text-violet-700", "bg-emerald-50 text-emerald-700", "bg-amber-50 text-amber-700"][index]}`}>
                <Icon className="size-5" />
              </span>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-navy-900">{value}</p>
            <div className="mt-1 flex items-center justify-between"><p className="text-xs text-slate-500">{sub}</p><ArrowUpRight className="size-4 text-slate-300 transition group-hover:text-navy-700" /></div>
          </Link>
        ))}
      </div>

      <section className="mt-7"><h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">Akses cepat</h2><div className="grid gap-3 sm:grid-cols-3">{[{href:"/dashboard/berita/baru", label:"Tulis berita", desc:"Bagikan informasi terbaru", icon:Newspaper}, {href:"/dashboard/galeri", label:"Unggah foto", desc:"Lengkapi dokumentasi kegiatan", icon:Images}, {href:"/dashboard/dokumen", label:"Tambah dokumen", desc:"Sediakan berkas untuk publik", icon:FileText}].map(({href,label,desc,icon:Icon}) => <Link href={href} key={href} className="card group flex items-center gap-3 p-4 transition hover:border-navy-200"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-50 text-navy-700"><Icon className="size-[18px]" /></span><div className="flex-1"><p className="text-sm font-bold text-navy-900">{label}</p><p className="mt-1 text-[11px] text-slate-500">{desc}</p></div><ArrowUpRight className="size-4 shrink-0 text-slate-300 group-hover:text-navy-700" /></Link>)}</div></section>

      <section className="card mt-8 p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold text-navy-900">Kesiapan Konten Publikasi</h2><p className="mt-1 text-sm text-slate-500">Lengkapi informasi satuan sebelum website dipublikasikan.</p></div><span className="rounded-full bg-navy-50 px-3 py-1 text-xs font-bold text-navy-800">{complete} dari {checks.length} lengkap</span></div><div className="my-5 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label="Kelengkapan konten" aria-valuenow={complete} aria-valuemin={0} aria-valuemax={checks.length}><div className="h-full rounded-full bg-gold-500 transition-all" style={{ width: `${complete / checks.length * 100}%` }} /></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{checks.map(c => <Link key={c.label} href={c.href} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 text-sm transition hover:border-navy-200 hover:bg-navy-50">{c.done ? <CheckCircle2 className="size-5 shrink-0 text-emerald-600" /> : <Circle className="size-5 shrink-0 text-slate-400" />}<span className="flex-1">{c.label}</span><ArrowUpRight className="size-4 text-slate-400" /></Link>)}</div></section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="font-bold text-navy-900">Berita Terbaru</h2>
          <ul className="mt-4 divide-y divide-slate-100">
            {news.slice(0, 5).map((n) => (
              <li key={n.id} className="py-3">
                <Link href={`/dashboard/berita/${n.id}`} className="font-medium text-navy-800 hover:underline">
                  {n.title}
                </Link>
                <p className="text-xs text-slate-500">
                  {formatDate(n.createdAt)} · {n.status === "draft" ? "Draf" : "Terbit"}
                </p>
              </li>
            ))}
            {!news.length && <li className="py-3 text-sm text-slate-500">Belum ada berita.</li>}
          </ul>
        </section>
        <section className="card p-6">
          <h2 className="font-bold text-navy-900">Pesan Terbaru</h2>
          <ul className="mt-4 divide-y divide-slate-100">
            {messages.slice(0, 5).map((m) => (
              <li key={m.id} className="py-3">
                <p className="font-medium text-navy-800">
                  {!m.read && <span className="mr-2 inline-block size-2 rounded-full bg-gold-500" />}
                  {m.subject}
                </p>
                <p className="text-xs text-slate-500">{m.name} · {formatDate(m.createdAt)}</p>
              </li>
            ))}
            {!messages.length && <li className="py-3 text-sm text-slate-500">Belum ada pesan.</li>}
          </ul>
        </section>
      </div>
    </>
  );
}
