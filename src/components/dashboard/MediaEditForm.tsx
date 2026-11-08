"use client";
import Link from "next/link";
import { useActionState } from "react";
import { editGalleryAction, editDocumentAction, editVideoAction } from "@/actions/content";
import { FormMessage, SubmitButton } from "@/components/ui";
import { FileField } from "./parts";
import { VideoDetailsFields } from "./VideoDetailsFields";
type Props = {kind:"galeri"|"dokumen"|"video";item:{id:string;title:string;source:string;description?:string;thumbnail?:string}};
export function MediaEditForm({kind,item}:Props) {
 const [state,action]=useActionState(kind === "galeri" ? editGalleryAction : kind === "dokumen" ? editDocumentAction : editVideoAction,{});
 return <form action={action} className="card max-w-3xl space-y-5 p-5 sm:p-7">
  <input type="hidden" name="id" value={item.id} />
  <div><label htmlFor="edit-title" className="label">Judul / keterangan *</label><input id="edit-title" name="title" defaultValue={item.title} required maxLength={300} className="input" /></div>
  {kind === "video" ? <VideoDetailsFields url={item.source} description={item.description} thumbnail={item.thumbnail} /> : <>
   {kind === "dokumen" && <a href={item.source} target="_blank" rel="noopener noreferrer" className="inline-block text-sm font-semibold text-navy-700 underline">Buka dokumen saat ini ?</a>}
   <FileField name={kind === "galeri" ? "image" : "file"} label={kind === "galeri" ? "Ganti foto (opsional)" : "Ganti dokumen (opsional)"} current={kind === "galeri" ? item.source : undefined} accept={kind === "galeri" ? ".jpg,.jpeg,.png,.webp,.gif" : ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"} hint="Maksimal 3 MB. Kosongkan jika hanya mengubah judul. File lama diganti setelah perubahan berhasil disimpan." />
  </>}
  <FormMessage state={state} />
  <div className="flex flex-wrap items-center gap-3"><SubmitButton pendingText="Menyimpan...">Simpan perubahan</SubmitButton><Link href={"/dashboard/"+kind} className="btn-ghost">Batal</Link></div>
 </form>;
}
