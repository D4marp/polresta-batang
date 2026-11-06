import type { Metadata } from "next";
import { Download, FileText } from "lucide-react";
import { PageHero } from "@/components/site/parts";
import { listDocuments } from "@/lib/db";
import { formatBytes, formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Unduhan" };

export default async function UnduhanPage() {
  const docs = await listDocuments();
  return (
    <>
      <PageHero title="Unduhan" subtitle="Formulir, peraturan, dan dokumen informasi publik." />
      <div className="container-x max-w-4xl py-12">
        {docs.length ? (
          <ul className="space-y-3">
            {docs.map((d) => (
              <li key={d.id} className="card flex items-center gap-4 p-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-navy-50 text-navy-700">
                  <FileText className="size-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-navy-900">{d.title}</p>
                  <p className="text-xs text-slate-500">
                    {formatBytes(d.size)} · {formatDate(d.createdAt)}
                  </p>
                </div>
                <a href={d.file} download className="btn-primary shrink-0">
                  <Download className="size-4" /> Unduh
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="card p-10 text-center text-slate-500">Belum ada dokumen.</p>
        )}
      </div>
    </>
  );
}
