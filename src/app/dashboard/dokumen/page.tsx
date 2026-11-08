import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { deleteDocumentAction } from "@/actions/content";
import { DeleteButton, PageHeader } from "@/components/dashboard/parts";
import { DocumentUploadForm } from "@/components/dashboard/UploadForms";
import { listDocuments } from "@/lib/db";
import { formatBytes, formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Dokumen" };

export default async function DashboardDocs() {
  await requireAdmin();
  const docs = await listDocuments();
  return (
    <>
      <PageHeader title="Dokumen" desc="Formulir dan dokumen yang dapat diunduh publik." />
      <DocumentUploadForm />
      <div className="card divide-y divide-slate-100">
        {docs.map((d) => (
          <div key={d.id} className="flex flex-wrap items-center gap-3 p-4">
            <FileText className="size-6 shrink-0 text-navy-600" />
            <div className="min-w-0 flex-1">
              <a href={d.file} target="_blank" className="block truncate font-semibold text-navy-900 hover:underline">
                {d.title}
              </a>
              <p className="text-xs text-slate-500">{formatBytes(d.size)} · {formatDate(d.createdAt)}</p>
            </div>
            <Link href={`/dashboard/dokumen/${d.id}`} className="btn-ghost px-3 py-1.5" aria-label={`Edit dokumen: ${d.title}`}>Edit</Link><DeleteButton action={deleteDocumentAction} id={d.id} />
          </div>
        ))}
        {!docs.length && <p className="p-10 text-center text-slate-500">Belum ada dokumen.</p>}
      </div>
    </>
  );
}
