import type { Metadata } from "next";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { requireAdmin } from "@/lib/auth";
import { listMessages } from "@/lib/db";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s | Dashboard" },
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  const unread = (await listMessages()).filter((m) => !m.read).length;
  return (
    <div className="dashboard-shell flex min-h-screen flex-col lg:flex-row">
      <Sidebar username={session.username} unread={unread} />
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10">{children}</main>
    </div>
  );
}
