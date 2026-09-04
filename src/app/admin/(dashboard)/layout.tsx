import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { logoutAdmin } from "@/lib/actions/admin-auth";
import { getAdminSession } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const adminId = await getAdminSession();
  if (!adminId) redirect("/admin/login");

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-6xl gap-10 px-6 py-10">
      <aside className="w-56 shrink-0">
        <p className="mb-8 text-sm font-semibold tracking-tight">
          Körper<span className="text-accent">formen</span> Admin
        </p>

        <AdminNav />

        <form action={logoutAdmin} className="mt-8">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface hover:text-foreground"
          >
            <LogOut size={16} /> Abmelden
          </button>
        </form>
      </aside>

      <main className="flex-1">{children}</main>
    </div>
  );
}
