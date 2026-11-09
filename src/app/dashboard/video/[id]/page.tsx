import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireEditor, canManageContent } from "@/lib/auth";
import { getVideoById } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/parts";
import { MediaEditForm } from "@/components/dashboard/MediaEditForm";
export const metadata:Metadata={title:"Edit video"};
export default async function EditMedia({params}:{params:Promise<{id:string}>}) {
 const session=await requireEditor();
 const {id}=await params;
 const item=await getVideoById(id);
 if (!item||!canManageContent(session,item.created_by)) notFound();
 return <><PageHeader title="Edit video" desc="Perbarui judul dan tautan video yang sudah diterbitkan." /><MediaEditForm kind="video" item={{id:item.id,title:item.title,source:item.url,description:item.description,thumbnail:item.thumbnail}} /></>;
}
