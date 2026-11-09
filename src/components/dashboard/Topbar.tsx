"use client";

import Link from "next/link";
import { roleLabel,type UserRole } from "@/lib/account-types";
import { usePathname } from "next/navigation";
import { Bell, ChevronRight, ExternalLink, LayoutDashboard } from "lucide-react";

const sections: Record<string, string> = { pengguna:"Akun redaksi", akun:"Akun saya", menu: "Menu website", berita: "Berita", galeri: "Galeri", video: "Galeri video", dokumen: "Dokumen", pesan: "Pesan masuk", pengaturan: "Pengaturan situs" };

export function DashboardTopbar({ username, unread, role }: { username: string; unread: number; role:UserRole }) {
  const segments = usePathname().split("/").filter(Boolean);
  const section = sections[segments[1]];
  return <header className="dashboard-topbar sticky top-0 z-20 flex min-h-20 items-center justify-between gap-3 border-b border-slate-200/70 bg-white/95 px-4 backdrop-blur-xl sm:px-6 lg:px-9">
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-xs sm:text-sm"><Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-navy-800"><LayoutDashboard className="size-4 shrink-0" /><span className="hidden sm:inline">Dashboard</span></Link><ChevronRight className="size-3 text-slate-300" /><span className="truncate font-semibold text-navy-900">{section || "Ringkasan"}</span>{segments[2] && <><ChevronRight className="hidden size-3 text-slate-300 sm:block" /><span className="hidden text-slate-500 sm:inline">{segments[2] === "baru" ? "Tulis berita" : "Edit berita"}</span></>}</nav>
    <div className="flex shrink-0 items-center gap-3 sm:gap-5"><Link href="/" target="_blank" rel="noopener noreferrer" className="hidden items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-navy-800 md:flex">Lihat website <ExternalLink className="size-3.5" /></Link>{role==="admin"&&<Link href="/dashboard/pesan" aria-label={unread ? `${unread} pesan belum dibaca` : "Pesan masuk"} className="relative grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-navy-300 hover:bg-navy-50"><Bell className="size-4" />{unread > 0 && <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-gold-400 px-1 text-center text-[10px] font-bold text-navy-950">{unread > 99 ? "99+" : unread}</span>}</Link>}<div className="flex items-center gap-2.5 border-l border-slate-200 pl-3 sm:pl-5"><span className="grid size-10 place-items-center rounded-full bg-navy-100 text-sm font-extrabold text-navy-800">{username.slice(0, 2).toUpperCase()}</span><div className="hidden max-w-36 sm:block"><p className="truncate text-xs font-bold text-navy-900">{username}</p><p className="mt-0.5 text-[11px] text-slate-500">{roleLabel(role)}</p></div></div></div>
  </header>;
}
