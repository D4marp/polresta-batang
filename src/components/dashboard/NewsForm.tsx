"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveNewsAction } from "@/actions/content";
import { FormMessage, SubmitButton } from "@/components/ui";
import { FileField } from "./parts";
import { NEWS_CATEGORIES, type News } from "@/lib/types";

export function NewsForm({ news }: { news?: News }) {
  const [state, action] = useActionState(saveNewsAction, {});
  return (
    <form action={action} className="grid gap-6 lg:grid-cols-3">
      {news && <input type="hidden" name="id" value={news.id} />}
      <div className="card space-y-5 p-6 lg:col-span-2">
        <div>
          <label className="label" htmlFor="title">Judul *</label>
          <input id="title" name="title" required defaultValue={news?.title} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="excerpt">Ringkasan</label>
          <textarea
            id="excerpt"
            name="excerpt"
            rows={2}
            maxLength={300}
            defaultValue={news?.excerpt}
            placeholder="Kosongkan untuk otomatis dari isi berita"
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="content">Isi berita *</label>
          <textarea
            id="content"
            name="content"
            required
            rows={16}
            defaultValue={news?.content}
            className="input font-[inherit] leading-relaxed"
          />
          <p className="mt-1.5 text-xs text-slate-500">Pisahkan paragraf dengan satu baris kosong.</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="card space-y-5 p-6">
          <div>
            <label className="label" htmlFor="category">Kategori</label>
            <select id="category" name="category" defaultValue={news?.category ?? "Kegiatan"} className="input">
              {NEWS_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue={news?.status ?? "draft"} className="input">
              <option value="published">Terbit</option>
              <option value="draft">Draf</option>
            </select>
          </div>
          <FileField
            name="image"
            label="Foto utama"
            current={news?.image}
            removeName="removeImage"
            hint="JPG, PNG, WebP, atau GIF. Maks. 3 MB."
          />
        </div>
        <FormMessage state={state} />
        <div className="flex gap-3">
          <SubmitButton className="btn-primary flex-1">{news ? "Simpan Perubahan" : "Simpan Berita"}</SubmitButton>
          <Link href="/dashboard/berita" className="btn-ghost">Batal</Link>
        </div>
      </div>
    </form>
  );
}
