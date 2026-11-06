"use client";

import { useActionState, useEffect, useRef } from "react";
import { addDocumentAction, addGalleryAction } from "@/actions/content";
import { FormMessage, SubmitButton } from "@/components/ui";
import { FileField } from "./parts";

export function GalleryUploadForm() {
  const [state, action] = useActionState(addGalleryAction, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className="card mb-8 space-y-4 p-6">
      <h2 className="font-bold text-navy-900">Unggah Foto</h2>
      <div>
        <label className="label" htmlFor="title">Judul / keterangan *</label>
        <input id="title" name="title" required maxLength={300} className="input" />
      </div>
      <FileField name="image" label="Foto (bisa pilih banyak)" required multiple hint="JPG, PNG, WebP, GIF. Maksimal 10 foto dengan total ukuran 10 MB per unggahan." />
      <FormMessage state={state} success="Foto berhasil diunggah." />
      <SubmitButton pendingText="Mengunggah...">Unggah</SubmitButton>
    </form>
  );
}

export function DocumentUploadForm() {
  const [state, action] = useActionState(addDocumentAction, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className="card mb-8 space-y-4 p-6">
      <h2 className="font-bold text-navy-900">Unggah Dokumen</h2>
      <div>
        <label className="label" htmlFor="title">Judul dokumen *</label>
        <input id="title" name="title" required maxLength={300} className="input" />
      </div>
      <FileField
        name="file"
        required
        label="File"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
        hint="PDF, Word, Excel, atau PowerPoint. Maks. 10 MB."
      />
      <FormMessage state={state} success="Dokumen berhasil diunggah." />
      <SubmitButton pendingText="Mengunggah...">Unggah</SubmitButton>
    </form>
  );
}
