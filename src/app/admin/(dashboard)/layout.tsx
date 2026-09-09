import { logoutAdmin } from "@/lib/actions/admin-auth";
import { verlangeAdmin } from "@/lib/admin-rechte";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await verlangeAdmin();

  return (
    <AdminShell
      logout={logoutAdmin}
      istLeitung={admin.istLeitung}
      wer={admin.name || admin.email}
      studioName={admin.studioName}
    >
      {children}
    </AdminShell>
  );
}
