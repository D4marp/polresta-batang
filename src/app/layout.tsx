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
    default: "Polresta Batang — Website Resmi",
    template: "%s | Polresta Batang",
  },
  description:
    "Website resmi Polresta Batang: berita, layanan publik, dan informasi kepolisian di Kabupaten Batang.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" data-scroll-behavior="smooth" className={jakarta.variable}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
