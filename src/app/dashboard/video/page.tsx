import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { listVideos } from "@/lib/db";
import { deleteVideoAction } from "@/actions/content";
import { DeleteButton, PageHeader } from "@/components/dashboard/parts";
import { VideoForm } from "@/components/dashboard/VideoForm";
import { VideoCard } from "@/components/site/VideoCard";
export const metadata:Metadata={title:"Galeri video"};
export default async function DashboardVideos(){
 await requireAdmin(); const videos=await listVideos();
 return <><PageHeader title="Galeri video" desc="Kelola dokumentasi video hanya dengan tautan URL." /><VideoForm /><div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{videos.map(v=><div key={v.id}><VideoCard title={v.title} url={v.url} /><div className="mt-2 flex items-center justify-end gap-2"><Link href={`/dashboard/video/${v.id}`} className="btn-ghost px-3 py-1.5" aria-label={`Edit video: ${v.title}`}>Edit</Link><DeleteButton action={deleteVideoAction} id={v.id} label="Hapus video" confirmText="Hapus tautan ini dari galeri? Video asli tetap ada di platform asal." /></div></div>)}</div>{!videos.length&&<p className="card p-8 text-center text-slate-500">Belum ada video. Tambahkan tautan video pertama di atas.</p>}</>;
}
