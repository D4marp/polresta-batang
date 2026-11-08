import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getDocumentById } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/parts";
import { MediaEditForm } from "@/components/dashboard/MediaEditForm";
export const metadata:Metadata={title:"Edit dokumen"};
export default async function EditMedia({params}:{params:Promise<{id:string}>}) {
 await requireAdmin();
 const {id}=await params;
 const item=await getDocumentById(id);
 if (!item) notFound();
 return <><PageHeader title="Edit dokumen" desc="Perbarui judul dan file dokumentasi yang sudah diterbitkan." /><MediaEditForm kind="dokumen" item={{id:item.id,title:item.title,source:item.file}} /></>;
}
