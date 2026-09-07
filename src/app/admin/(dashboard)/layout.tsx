import { redirect } from "next/navigation";
import { logoutAdmin } from "@/lib/actions/admin-auth";
import { getAdminSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const adminId = await getAdminSession();
  if (!adminId) redirect("/admin/login");

  return <AdminShell logout={logoutAdmin}>{children}</AdminShell>;
}
