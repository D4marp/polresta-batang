import { requireAdmin } from "@/lib/auth";
import type { Metadata } from "next";
import { NewsForm } from "@/components/dashboard/NewsForm";
import { PageHeader } from "@/components/dashboard/parts";

export const metadata: Metadata = { title: "Berita Baru" };

export default async function NewNewsPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="Tulis Berita" />
      <NewsForm />
    </>
  );
}
