import { requireAdmin } from "@/lib/auth";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewsForm } from "@/components/dashboard/NewsForm";
import { PageHeader } from "@/components/dashboard/parts";
import { getNewsById } from "@/lib/db";

export const metadata: Metadata = { title: "Edit Berita" };

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const news = await getNewsById((await params).id);
  if (!news) notFound();
  return (
    <>
      <PageHeader title="Edit Berita" />
      <NewsForm news={news} />
    </>
  );
}
