import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  ...(process.env.SITE_URL ? { metadataBase: new URL(process.env.SITE_URL) } : {}),
  icons: { icon: "/logo.png", apple: "/logo.png" },
  title: {
    default: "Polresta Batang — Portal Berita Kepolisian",
    template: "%s | Polresta Batang",
  },
  description:
    "Portal berita Polresta Batang: kabar kepolisian, kegiatan Kapolresta, informasi kamtibmas, dan pelayanan masyarakat Kabupaten Batang.",
  openGraph: { siteName: "Polresta Batang", locale: "id_ID", type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" data-scroll-behavior="smooth" className={jakarta.variable}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
