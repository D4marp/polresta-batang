import type { Metadata } from "next";
import { Img } from "@/components/Img";
import { PageHero } from "@/components/site/parts";
import { listGallery } from "@/lib/db";

export const metadata: Metadata = { title: "Galeri" };

export default async function GaleriPage() {
  const items = await listGallery();
  return (
    <>
      <PageHero title="Galeri" subtitle="Dokumentasi foto kegiatan Polresta Batang." />
      <div className="container-x py-12">
        {items.length ? (
          <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
            {items.map((g) => (
              <figure key={g.id} className="group mb-4 break-inside-avoid overflow-hidden rounded-2xl bg-white shadow-sm">
                <Img src={g.image} alt={g.title} className="w-full transition duration-500 group-hover:scale-105" />
                <figcaption className="p-3 text-sm font-medium text-slate-700">{g.title}</figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <p className="card p-10 text-center text-slate-500">Belum ada foto di galeri.</p>
        )}
      </div>
    </>
  );
}
