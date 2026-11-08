import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getGalleryById } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/parts";
import { MediaEditForm } from "@/components/dashboard/MediaEditForm";
export const metadata:Metadata={title:"Edit foto"};
export default async function EditMedia({params}:{params:Promise<{id:string}>}) {
 await requireAdmin();
 const {id}=await params;
 const item=await getGalleryById(id);
 if (!item) notFound();
 return <><PageHeader title="Edit foto" desc="Perbarui judul dan file dokumentasi yang sudah diterbitkan." /><MediaEditForm kind="galeri" item={{id:item.id,title:item.title,source:item.image}} /></>;
}
