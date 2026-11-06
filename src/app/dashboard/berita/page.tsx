import { requireAdmin } from "@/lib/auth";
import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Pencil, Plus } from "lucide-react";
import { deleteNewsAction } from "@/actions/content";
import { Img } from "@/components/Img";
import { DeleteButton, PageHeader } from "@/components/dashboard/parts";
import { listNews } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Berita" };

export default async function DashboardNews() {
  await requireAdmin();
  const news = await listNews({ includeDrafts: true });
  return (
    <>
      <PageHeader
        title="Berita"
        desc="Kelola berita dan pengumuman yang tampil di website."
        action={
          <Link href="/dashboard/berita/baru" className="btn-primary">
            <Plus className="size-4" /> Tulis Berita
          </Link>
        }
      />
      <div className="card divide-y divide-slate-100">
        {news.map((n) => (
          <div key={n.id} className="flex flex-wrap items-center gap-4 p-4">
            <Img src={n.image} alt="" className="size-16 shrink-0 rounded-xl object-cover" />
            <div className="min-w-0 flex-1 basis-60">
              <p className="truncate font-semibold text-navy-900">{n.title}</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {n.category} · {formatDate(n.createdAt)}
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                n.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
              }`}
            >
              {n.status === "published" ? "Terbit" : "Draf"}
            </span>
            <div className="flex items-center gap-2">
              {n.status === "published" && (
                <Link href={`/berita/${n.slug}`} target="_blank" className="btn-ghost px-3 py-1.5" aria-label="Lihat">
                  <ExternalLink className="size-4" />
                </Link>
              )}
              <Link href={`/dashboard/berita/${n.id}`} className="btn-ghost px-3 py-1.5">
                <Pencil className="size-4" /> Edit
              </Link>
              <DeleteButton action={deleteNewsAction} id={n.id} />
            </div>
          </div>
        ))}
        {!news.length && <p className="p-10 text-center text-slate-500">Belum ada berita.</p>}
      </div>
    </>
  );
}
