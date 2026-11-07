"use client";

import { useActionState, useState } from "react";
import { saveSettingsAction } from "@/actions/content";
import { FormMessage, SubmitButton } from "@/components/ui";
import { FileField } from "./parts";
import type { Settings } from "@/lib/types";

function Field({
  name,
  label,
  value,
  rows,
  hint,
}: {
  name: string;
  label: string;
  value: string;
  rows?: number;
  hint?: string;
}) {
  return (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      {rows ? (
        <textarea id={name} name={name} rows={rows} defaultValue={value} className="input" />
      ) : (
        <input id={name} name={name} defaultValue={value} className="input" />
      )}
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function SettingsForm({ s }: { s: Settings }) {
  const [state, action] = useActionState(saveSettingsAction, {});
  const [uploadError, setUploadError] = useState<string>();
  return (
    <form action={action} onSubmit={(event) => {
      const data = new FormData(event.currentTarget);
      const total = [data.get("heroImage"), data.get("leaderPhoto")].reduce<number>((sum, file) => sum + (file instanceof File ? file.size : 0), 0);
      if (total > 3 * 1024 * 1024) {
        event.preventDefault();
        setUploadError("Total ukuran foto beranda dan pimpinan maksimal 3 MB per penyimpanan.");
      } else setUploadError(undefined);
    }} className="space-y-6">
      <section className="card space-y-5 p-6">
        <h2 className="font-bold text-navy-900">Identitas & Kontak</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field name="name" label="Nama satuan" value={s.name} />
          <Field name="tagline" label="Tagline" value={s.tagline} />
          <Field name="address" label="Alamat" value={s.address} />
          <Field name="phone" label="Telepon" value={s.phone} />
          <Field name="email" label="Email" value={s.email} />
          <Field name="hotline" label="Nomor darurat" value={s.hotline} />
          <Field name="instagram" label="URL Instagram" value={s.instagram} />
          <Field name="facebook" label="URL Facebook" value={s.facebook} />
          <Field name="youtube" label="URL YouTube" value={s.youtube} />
        </div>
        <Field
          name="mapsEmbed"
          label="URL embed Google Maps"
          value={s.mapsEmbed}
          hint='Google Maps → Bagikan → Sematkan peta → salin isi src="..." (diawali https://www.google.com/maps/embed).'
        />
      </section>

      <section className="card space-y-5 p-6">
        <h2 className="font-bold text-navy-900">Halaman Beranda</h2>
        <Field name="heroTitle" label="Judul utama" value={s.heroTitle} />
        <Field name="heroSubtitle" label="Sub-judul" value={s.heroSubtitle} rows={3} />
        <FileField name="heroImage" label="Gambar latar hero" current={s.heroImage} removeName="remove_heroImage" />
      </section>

      <section className="card space-y-5 p-6">
        <h2 className="font-bold text-navy-900">Pimpinan</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field name="leaderName" label="Nama / jabatan singkat" value={s.leaderName} />
          <Field name="leaderTitle" label="Jabatan lengkap" value={s.leaderTitle} />
        </div>
        <Field name="leaderMessage" label="Kata sambutan" value={s.leaderMessage} rows={5} />
        <FileField name="leaderPhoto" label="Foto pimpinan" current={s.leaderPhoto} removeName="remove_leaderPhoto" />
      </section>

      <section className="card space-y-5 p-6">
        <h2 className="font-bold text-navy-900">Profil</h2>
        <Field name="visi" label="Visi" value={s.visi} rows={3} />
        <Field name="misi" label="Misi" value={s.misi.join("\n")} rows={6} hint="Satu misi per baris." />
        <Field name="sejarah" label="Tentang kami / sejarah" value={s.sejarah} rows={6} />
      </section>

      <FormMessage state={uploadError ? { error: uploadError } : state} success="Pengaturan berhasil disimpan." />
      <SubmitButton>Simpan Pengaturan</SubmitButton>
    </form>
  );
}
