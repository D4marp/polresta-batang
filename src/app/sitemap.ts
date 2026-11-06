import type { MetadataRoute } from "next";
import { listNews } from "@/lib/db";
import { services } from "@/lib/services";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL?.replace(/\/$/, "");
  if (!base) return [];
  const news = await listNews();
  return [
    ...["", "/profil", "/layanan", "/berita", "/galeri", "/unduhan", "/pengaduan", ...services.map(s => `/layanan/${s.slug}`)].map(path => ({ url: `${base}${path}` })),
    ...news.map(n => ({ url: `${base}/berita/${n.slug}`, lastModified: n.updatedAt })),
  ];
}
