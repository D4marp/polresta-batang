import Link from "next/link";
import { requireEditor } from "@/lib/auth";
import type { Metadata } from "next";
import { deleteGalleryAction } from "@/actions/content";
import { Img } from "@/components/Img";
import { DeleteButton, PageHeader } from "@/components/dashboard/parts";
import { GalleryUploadForm } from "@/components/dashboard/UploadForms";
import { listGallery } from "@/lib/db";

export const metadata: Metadata = { title: "Galeri" };

export default async function DashboardGallery() {
  const session=await requireEditor();
  const items = await listGallery({ownerId:session.role==="admin"?undefined:session.id});
  return (
    <>
      <PageHeader title="Galeri" desc="Unggah dan kelola foto kegiatan." />
      <GalleryUploadForm />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((g) => (
          <div key={g.id} className="card overflow-hidden">
            <Img src={g.image} alt={g.title} className="aspect-4/3 w-full object-cover" />
            <div className="flex items-center justify-between gap-2 p-3">
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-700">{g.title}</p><p className="mt-1 text-[10px] text-slate-500">Oleh {g.author}</p></div>
              <div className="flex shrink-0 items-center gap-2"><Link href={`/dashboard/galeri/${g.id}`} className="btn-ghost px-2 py-1.5 text-xs" aria-label={`Edit foto: ${g.title}`}>Edit</Link><DeleteButton action={deleteGalleryAction} id={g.id} label="" /></div>
            </div>
          </div>
        ))}
        {!items.length && <p className="text-slate-500">Belum ada foto.</p>}
      </div>
    </>
  );
}
