import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { getPublicSettings, getPublicMenuItems } from "@/lib/public-data";
import { visibleMenuItems } from "@/lib/navigation";

// Public data is cached; authentication and dashboard data remain uncached.
export const revalidate = 300;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [s,menuItems] = await Promise.all([getPublicSettings(),getPublicMenuItems()]);
  return (
    <div className="news-site min-h-screen bg-white">
      <a href="#main-content" className="skip-link">Langsung ke konten</a>
      <Header menuItems={visibleMenuItems(menuItems)} name={s.name} hotline={s.hotline} date={new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date())} />
      <main id="main-content">{children}</main>
      <Footer s={s} />
    </div>
  );
}
