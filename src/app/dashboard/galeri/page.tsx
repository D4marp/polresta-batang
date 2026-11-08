import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import type { Metadata } from "next";
import { deleteGalleryAction } from "@/actions/content";
import { Img } from "@/components/Img";
import { DeleteButton, PageHeader } from "@/components/dashboard/parts";
import { GalleryUploadForm } from "@/components/dashboard/UploadForms";
import { listGallery } from "@/lib/db";

export const metadata: Metadata = { title: "Galeri" };

export default async function DashboardGallery() {
  await requireAdmin();
  const items = await listGallery();
  return (
    <>
      <PageHeader title="Galeri" desc="Unggah dan kelola foto kegiatan." />
      <GalleryUploadForm />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((g) => (
          <div key={g.id} className="card overflow-hidden">
            <Img src={g.image} alt={g.title} className="aspect-4/3 w-full object-cover" />
            <div className="flex items-center justify-between gap-2 p-3">
              <p className="truncate text-sm font-medium text-slate-700">{g.title}</p>
              <div className="flex shrink-0 items-center gap-2"><Link href={`/dashboard/galeri/${g.id}`} className="btn-ghost px-2 py-1.5 text-xs" aria-label={`Edit foto: ${g.title}`}>Edit</Link><DeleteButton action={deleteGalleryAction} id={g.id} label="" /></div>
            </div>
          </div>
        ))}
        {!items.length && <p className="text-slate-500">Belum ada foto.</p>}
      </div>
    </>
  );
}
