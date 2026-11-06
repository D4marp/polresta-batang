"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { Img } from "@/components/Img";

const nav = [
  { href: "/", label: "Beranda" },
  { href: "/profil", label: "Profil" },
  { href: "/layanan", label: "Layanan" },
  { href: "/berita", label: "Berita" },
  { href: "/galeri", label: "Galeri" },
  { href: "/unduhan", label: "Unduhan" },
  { href: "/pengaduan", label: "Kontak & Pengaduan" },
];

export function Header({ name, hotline }: { name: string; hotline: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 shadow-sm">
      <div className="bg-navy-950 text-xs text-navy-100">
        <div className="container-x flex items-center justify-between py-1.5">
          <span>Website Resmi {name}</span>
          <a href={`tel:${hotline}`} className="flex items-center gap-1.5 font-medium text-gold-300">
            <Phone className="size-3.5" /> Darurat: {hotline}
          </a>
        </div>
      </div>
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="container-x flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Img src="/logo.png" alt="Lambang Polda Jawa Tengah" className="h-12 w-10 object-contain" priority />
            <span className="leading-tight">
              <span className="block text-base font-extrabold tracking-tight text-navy-900">
                {name.toUpperCase()}
              </span>
              <span className="block text-[11px] font-medium text-slate-500">
                Polda Jawa Tengah
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active(n.href) ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active(n.href)
                    ? "bg-navy-50 text-navy-800"
                    : "text-slate-600 hover:bg-slate-100 hover:text-navy-800"
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <button
            className="grid size-10 place-items-center rounded-lg text-navy-800 hover:bg-slate-100 lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-controls="mobile-navigation"
            aria-expanded={open}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>

        {open && (
          <nav id="mobile-navigation" className="border-t border-slate-100 bg-white lg:hidden" aria-label="Navigasi seluler">
            <div className="container-x flex flex-col py-2">
              {nav.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  aria-current={active(n.href) ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-3 py-3 text-sm font-medium ${
                    active(n.href) ? "bg-navy-50 text-navy-800" : "text-slate-700"
                  }`}
                >
                  {n.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
