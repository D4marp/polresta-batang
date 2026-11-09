import type { MetadataRoute } from "next";
import { getPublicSitemapEntries } from "@/lib/public-data";
import { services } from "@/lib/services";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL?.replace(/\/$/, "");
  if (!base) return [];
  const {news,videos}=await getPublicSitemapEntries();
  return [
    ...["", "/profil", "/layanan", "/berita", "/galeri", "/unduhan", "/pengaduan", ...services.map(s => `/layanan/${s.slug}`)].map(path => ({ url: `${base}${path}` })),
    ...videos.map(v => ({ url: `${base}/video/${v.id}` })),
    ...news.map(n => ({ url: `${base}/berita/${n.slug}`, lastModified: n.updatedAt })),
  ];
}
