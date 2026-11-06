import { requireAdmin } from "@/lib/auth";
import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/parts";
import { SettingsForm } from "@/components/dashboard/SettingsForm";
import { getSettings } from "@/lib/db";

export const metadata: Metadata = { title: "Pengaturan Situs" };

export default async function SettingsPage() {
  await requireAdmin();
  const s = await getSettings();
  return (
    <>
      <PageHeader title="Pengaturan Situs" desc="Ubah identitas, beranda, pimpinan, dan profil." />
      <div className="max-w-4xl">
        <SettingsForm s={s} />
      </div>
    </>
  );
}
