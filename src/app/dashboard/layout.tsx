import type { Metadata } from "next";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardTopbar } from "@/components/dashboard/Topbar";
import { requireAdmin } from "@/lib/auth";
import { getSettings, listMessages } from "@/lib/db";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s | Dashboard" },
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  const [messages, settings] = await Promise.all([listMessages(), getSettings()]);
  const unread = messages.filter((m) => !m.read).length;
  return (
    <div className="dashboard-shell flex min-h-screen flex-col lg:flex-row">
      <a href="#dashboard-content" className="skip-link">Langsung ke konten dashboard</a>
      <Sidebar name={settings.name} username={session.username} unread={unread} />
      <div className="min-w-0 flex-1">
        <DashboardTopbar username={session.username} unread={unread} />
        <main id="dashboard-content" className="min-w-0 px-4 py-7 sm:px-6 sm:py-8 lg:px-9">{children}</main>
        <footer className="flex flex-wrap justify-between gap-2 border-t border-slate-200/70 px-4 py-5 text-[11px] text-slate-500 sm:px-6 lg:px-9"><span>{settings.name} · Polda Jawa Tengah</span><span>Panel administrasi website</span></footer>
      </div>
    </div>
  );
}
