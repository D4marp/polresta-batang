"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ExternalLink,
  FileText,
  Images,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Newspaper,
  Settings,
  Shield,
  X,
} from "lucide-react";
import { logoutAction } from "@/actions/auth";

const items = [
  { href: "/dashboard", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/dashboard/berita", label: "Berita", icon: Newspaper },
  { href: "/dashboard/galeri", label: "Galeri", icon: Images },
  { href: "/dashboard/dokumen", label: "Dokumen", icon: FileText },
  { href: "/dashboard/pesan", label: "Pesan Masuk", icon: Mail },
  { href: "/dashboard/pengaturan", label: "Pengaturan Situs", icon: Settings },
];

export function Sidebar({ username, unread }: { username: string; unread: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (h: string) => (h === "/dashboard" ? pathname === h : pathname.startsWith(h));

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-5">
        <span className="grid size-10 place-items-center rounded-xl bg-gold-500 text-navy-950">
          <Shield className="size-5" />
        </span>
        <div className="leading-tight">
          <p className="font-extrabold text-white">Polresta Batang</p>
          <p className="text-xs text-navy-300">Dashboard Admin</p>
        </div>
      </div>
      <nav aria-label="Navigasi dashboard" className="flex-1 space-y-1 px-3 py-2">
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={active(href) ? "page" : undefined}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              active(href) ? "bg-white/10 text-white" : "text-navy-200 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon className="size-5" />
            <span className="flex-1">{label}</span>
            {label === "Pesan Masuk" && unread > 0 && (
              <span className="rounded-full bg-gold-500 px-2 py-0.5 text-xs font-bold text-navy-950">{unread}</span>
            )}
          </Link>
        ))}
      </nav>
      <div className="space-y-2 border-t border-white/10 p-4">
        <Link href="/" target="_blank" className="flex items-center gap-2 text-sm text-navy-200 hover:text-white">
          <ExternalLink className="size-4" /> Lihat website
        </Link>
        <form action={logoutAction}>
          <button className="flex w-full items-center gap-2 text-sm text-navy-200 hover:text-white">
            <LogOut className="size-4" /> Keluar ({username})
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <div className="sticky top-0 z-30 flex items-center justify-between bg-navy-950 px-4 py-3 text-white lg:hidden">
        <span className="font-extrabold">Dashboard Admin</span>
        <button onClick={() => setOpen(true)} aria-label="Buka menu"><Menu className="size-6" /></button>
      </div>
      <aside className="hidden w-64 shrink-0 bg-navy-950 lg:block">
        <div className="sticky top-0 h-screen">{content}</div>
      </aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-navy-950">
            <button className="absolute right-3 top-4 text-white" onClick={() => setOpen(false)} aria-label="Tutup">
              <X className="size-6" />
            </button>
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
