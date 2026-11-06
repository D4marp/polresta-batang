import Link from "next/link";
import { Mail, MapPin, Phone, Shield } from "lucide-react";
import type { Settings } from "@/lib/types";

export function Footer({ s }: { s: Settings }) {
  const socials = [
    { label: "Instagram", href: s.instagram },
    { label: "Facebook", href: s.facebook },
    { label: "YouTube", href: s.youtube },
  ].filter((x) => x.href && !/^https?:\/\/(www\.)?(instagram|facebook|youtube)\.com\/?$/.test(x.href));

  return (
    <footer className="mt-24 bg-navy-950 text-navy-100">
      <div className="container-x grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-gold-500 text-navy-950">
              <Shield className="size-5" />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-white">
              {s.name.toUpperCase()}
            </span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-navy-200">{s.tagline}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {socials.map((x) => (
              <a
                key={x.label}
                href={x.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/10"
              >
                {x.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-gold-400">Tautan</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[
              ["/profil", "Profil"],
              ["/layanan", "Layanan Publik"],
              ["/berita", "Berita"],
              ["/galeri", "Galeri"],
              ["/unduhan", "Unduhan"],
              ["/pengaduan", "Kontak & Pengaduan"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="text-navy-200 transition hover:text-white">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-gold-400">Kontak</h3>
          <ul className="mt-4 space-y-3 text-sm text-navy-200">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold-400" /> {s.address}
            </li>
            <li className="flex gap-2.5">
              <Phone className="size-4 shrink-0 text-gold-400" /> {s.phone}
            </li>
            <li className="flex gap-2.5">
              <Mail className="size-4 shrink-0 text-gold-400" /> {s.email}
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-navy-300">
        © {new Date().getFullYear()} {s.name}. Hak cipta dilindungi.
        <Link href="/login" className="ml-3 opacity-60 hover:opacity-100">
          Admin
        </Link>
      </div>
    </footer>
  );
}
