import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { getSettings } from "@/lib/db";

// Data dibaca dari Supabase PostgreSQL pada setiap request.
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  return (
    <>
      <a href="#main-content" className="skip-link">Langsung ke konten</a>
      <Header name={s.name} hotline={s.hotline} />
      <main id="main-content">{children}</main>
      <Footer s={s} />
    </>
  );
}
