"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { ArrowUpRight, FileText, Images, LayoutDashboard, LogOut, Mail, Menu, Newspaper, Settings, X } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { DashboardBrand } from "./Brand";

const items = [
  { href: "/dashboard", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/dashboard/berita", label: "Berita", icon: Newspaper },
  { href: "/dashboard/galeri", label: "Galeri foto", icon: Images },
  { href: "/dashboard/dokumen", label: "Dokumen", icon: FileText },
  { href: "/dashboard/pesan", label: "Pesan masuk", icon: Mail },
  { href: "/dashboard/pengaturan", label: "Pengaturan situs", icon: Settings },
];

export function Sidebar({ username, unread, name }: { username: string; unread: number; name: string }) {
  const pathname = usePathname();
  const drawer = useRef<HTMLDialogElement>(null);
  const active = (href: string) => href === "/dashboard" ? pathname === href : pathname.startsWith(href);
  const content = (mobile = false) => <div className="flex h-full flex-col">
    <div className="border-b border-white/10 px-6 pb-7 pt-7"><Link href="/dashboard" onClick={() => drawer.current?.close()} className="block pr-5"><DashboardBrand name={name} /></Link><span className="mt-5 inline-flex items-center gap-2 rounded-full border border-gold-400/20 bg-gold-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-gold-300"><span className="size-1.5 rounded-full bg-gold-400" /> Panel administrasi</span></div>
    <nav aria-label={mobile ? "Navigasi dashboard seluler" : "Navigasi dashboard"} className="min-h-0 flex-1 overflow-y-auto px-4 py-6"><p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-navy-300">Ruang kerja</p><div className="space-y-1.5">{items.map(({href, label, icon: Icon}, index) => <div key={href}>{index === 5 && <div className="mx-3 my-5 border-t border-white/10" />}<Link href={href} aria-current={active(href) ? "page" : undefined} onClick={() => drawer.current?.close()} className={`dashboard-nav-item flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${active(href) ? "text-white" : "text-navy-200 hover:bg-white/5 hover:text-white"}`}><Icon className="size-[18px] shrink-0" /><span className="flex-1">{label}</span>{href === "/dashboard/pesan" && unread > 0 && <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-bold">{unread > 99 ? "99+" : unread}</span>}</Link></div>)}</div></nav>
    <div className="px-4 pb-4"><Link href="/" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 text-white transition hover:bg-white/10"><div><p className="text-xs font-bold">Website publik</p><p className="mt-1 text-[11px] text-navy-200">Lihat tampilan untuk masyarakat</p></div><ArrowUpRight className="size-4 text-gold-300 transition group-hover:-translate-y-0.5" /></Link></div>
    <div className="flex items-center gap-3 border-t border-white/10 px-6 py-5"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-bold text-gold-300">{username.slice(0,2).toUpperCase()}</span><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-white">{username}</p><p className="mt-0.5 text-[10px] text-navy-300">Administrator</p></div><form action={logoutAction}><button aria-label="Keluar dari dashboard" title="Keluar" className="grid size-9 place-items-center rounded-lg text-navy-200 transition hover:bg-white/10 hover:text-white"><LogOut className="size-4" /></button></form></div>
  </div>;
  return <>
    <div className="flex items-center justify-between bg-navy-950 px-4 py-3 lg:hidden"><Link href="/dashboard"><DashboardBrand name={name} compact /></Link><button onClick={() => drawer.current?.showModal()} aria-label="Buka navigasi dashboard" aria-haspopup="dialog" className="grid size-11 place-items-center rounded-xl border border-white/15 text-white"><Menu className="size-5" /></button></div>
    <aside className="hidden w-[272px] shrink-0 bg-navy-950 lg:block"><div className="sticky top-0 h-dvh">{content()}</div></aside>
    <dialog ref={drawer} aria-label="Menu dashboard" className="dashboard-drawer fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-80 max-w-[90vw] border-0 bg-navy-950 p-0 text-white shadow-2xl" onClick={event => { if (event.target === event.currentTarget) { const r = event.currentTarget.getBoundingClientRect(); if (event.clientX > r.right || event.clientY > r.bottom) drawer.current?.close(); } }}><button autoFocus onClick={() => drawer.current?.close()} aria-label="Tutup navigasi" className="absolute right-3 top-3 grid size-9 place-items-center rounded-lg text-navy-200 hover:bg-white/10"><X className="size-5" /></button>{content(true)}</dialog>
  </>;
}
