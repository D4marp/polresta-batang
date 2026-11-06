import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/site/ContactForm";
import { PageHero } from "@/components/site/parts";
import { getSettings } from "@/lib/db";

export const metadata: Metadata = { title: "Kontak & Pengaduan" };

export default async function PengaduanPage() {
  const s = await getSettings();
  const info = [
    { icon: MapPin, label: "Alamat", value: s.address },
    { icon: Phone, label: "Telepon", value: s.phone },
    { icon: Mail, label: "Email", value: s.email },
    { icon: Clock, label: "Pelayanan SPKT", value: "24 jam setiap hari" },
  ];
  const mapOk = s.mapsEmbed.startsWith("https://www.google.com/maps/embed");

  return (
    <>
      <PageHero
        title="Kontak & Pengaduan"
        subtitle="Sampaikan pertanyaan, saran, atau pengaduan Anda kepada kami."
      />
      <div className="container-x grid gap-8 py-12 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ContactForm />
        </div>
        <aside className="space-y-4 lg:col-span-2">
          {info.map(({ icon: Icon, label, value }) => (
            <div key={label} className="card flex gap-4 p-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-navy-800 text-gold-400">
                <Icon className="size-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                <p className="font-medium text-navy-900">{value}</p>
              </div>
            </div>
          ))}
          {mapOk && (
            <iframe
              src={s.mapsEmbed}
              title="Lokasi"
              loading="lazy"
              className="h-64 w-full rounded-2xl border-0 shadow-sm"
            />
          )}
        </aside>
      </div>
    </>
  );
}
