import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { listMenuItems } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/parts";
import { MenuEditor } from "@/components/dashboard/MenuEditor";
export const metadata:Metadata={title:"Menu website"};
export default async function DashboardMenu(){
 await requireAdmin();
 return <><PageHeader title="Menu website" desc="Kelola nama, tujuan, urutan, dan submenu navigasi seperti pengelolaan menu WordPress." /><MenuEditor items={await listMenuItems()} /></>;
}
