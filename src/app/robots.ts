import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.SITE_URL?.replace(/\/$/, "");
  return { rules: { userAgent: "*", allow: "/", disallow: ["/dashboard", "/login"] }, ...(base ? { sitemap: `${base}/sitemap.xml` } : {}) };
}
