import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowUpRight, LockKeyhole } from "lucide-react";
import { LoginForm } from "@/components/dashboard/LoginForm";
import { DashboardBrand } from "@/components/dashboard/Brand";
import { Img } from "@/components/Img";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/db";

export const metadata: Metadata = { title: "Masuk Admin", robots: { index: false } };

export default async function LoginPage() {
  if (await getSession()) redirect("/dashboard");
  const settings = await getSettings();
  return <div className="grid min-h-dvh bg-white lg:grid-cols-2">
    <section className="dashboard-welcome relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex xl:p-16">
      <Link href="/" className="relative z-10 w-fit"><DashboardBrand name={settings.name} /></Link>
      <div aria-hidden className="pointer-events-none absolute -right-20 top-1/4 size-[440px] rounded-full border border-white/5 p-12"><div className="grid size-full place-items-center rounded-full border border-white/10 p-16"><Img src="/logo.png" alt="" className="size-full object-contain opacity-10" /></div></div>
      <div className="relative z-10 py-20"><p className="text-xs font-semibold uppercase tracking-[.24em] text-gold-300">Ruang redaksi</p><h2 className="mt-6 max-w-md text-4xl font-extrabold leading-tight tracking-tight xl:text-5xl">Kabar yang akurat.<br /><span className="text-gold-300">Informasi yang dekat.</span></h2><p className="mt-6 max-w-sm text-sm leading-7 text-navy-200">Terbitkan berita kepolisian, dokumentasikan agenda Kapolresta, dan hadirkan informasi yang bermanfaat bagi masyarakat.</p></div>
      <div className="relative flex items-center justify-between gap-3 border-t border-white/15 pt-6 text-xs text-navy-200"><span>Profesional · Transparan · Humanis</span><Link href="/" className="flex items-center gap-2 text-white">Website publik <ArrowUpRight className="size-4" /></Link></div>
    </section>
    <main className="flex min-h-dvh flex-col px-6 py-8 sm:px-12 lg:px-16">
      <Link href="/" className="flex w-fit items-center gap-2 text-xs font-semibold text-slate-500 hover:text-navy-800"><ArrowLeft className="size-4" /> Kembali ke website</Link>
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
        <div className="mb-8"><div className="mb-7 flex items-center gap-3"><span className="flex h-16 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-2.5"><Img src="/logo.png" alt="Lambang Polda Jawa Tengah" priority className="size-full object-contain" /></span><div><p className="text-sm font-extrabold text-navy-900">{settings.name}</p><p className="mt-1 text-[10px] uppercase tracking-widest text-slate-500">Polda Jawa Tengah</p></div></div><h1 className="text-3xl font-extrabold tracking-tight text-navy-900">Selamat datang kembali</h1><p className="mt-3 text-sm leading-relaxed text-slate-500">Masuk untuk menulis, menyunting, dan menerbitkan berita.</p></div>
        <LoginForm />
        <p className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-500"><LockKeyhole className="size-3.5" /> Akses khusus administrator website</p>
      </div>
      <p className="text-center text-[11px] text-slate-400">{settings.name} · Panel redaksi</p>
    </main>
  </div>;
}
