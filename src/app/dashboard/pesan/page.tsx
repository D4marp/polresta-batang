import { requireAdmin } from "@/lib/auth";
import type { Metadata } from "next";
import { toggleMessageReadAction } from "@/actions/content";
import { deleteMessageAction } from "@/actions/content";
import { DeleteButton, PageHeader } from "@/components/dashboard/parts";
import { listMessages } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Pesan Masuk" };

export default async function DashboardMessages() {
  await requireAdmin();
  const messages = await listMessages();
  return (
    <>
      <PageHeader title="Pesan Masuk" desc="Pesan dan pengaduan dari formulir kontak." />
      <div className="space-y-4">
        {messages.map((m) => (
          <article key={m.id} className={`card p-5 ${m.read ? "" : "ring-2 ring-gold-400/60"}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-bold text-navy-900">{m.subject}</h2>
                <p className="text-sm text-slate-500">
                  {m.name}
                  {m.email && <> · <a className="underline" href={`mailto:${m.email}`}>{m.email}</a></>}
                  {m.phone && <> · {m.phone}</>} · {formatDate(m.createdAt, true)}
                </p>
              </div>
              <div className="flex gap-2">
                <form action={toggleMessageReadAction}>
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="read" value={String(!m.read)} />
                  <button className="btn-ghost px-3 py-1.5">
                    {m.read ? "Tandai belum dibaca" : "Tandai dibaca"}
                  </button>
                </form>
                <DeleteButton action={deleteMessageAction} id={m.id} />
              </div>
            </div>
            <p className="mt-3 whitespace-pre-line text-slate-700">{m.message}</p>
          </article>
        ))}
        {!messages.length && <p className="card p-10 text-center text-slate-500">Belum ada pesan.</p>}
      </div>
    </>
  );
}
