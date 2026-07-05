import Link from "next/link";
import { LogOut } from "lucide-react";
import { logoutAdmin } from "@/lib/actions/admin-auth";

const links = [
  { href: "/admin", label: "Übersicht" },
  { href: "/admin/studios", label: "Studios" },
  { href: "/admin/bookings", label: "Buchungen" },
  { href: "/admin/verfuegbarkeit", label: "Verfügbarkeit" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/kommentare", label: "Kommentare" },
  { href: "/admin/faq", label: "FAQ" },
  { href: "/admin/nachrichten", label: "Nachrichten" },
  { href: "/admin/newsletter", label: "Newsletter" },
];

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-6xl gap-10 px-6 py-10">
      <aside className="w-56 shrink-0">
        <p className="mb-8 text-sm font-semibold tracking-tight">
          Körper<span className="text-lime">formen</span> Admin
        </p>
        <nav className="flex flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <form action={logoutAdmin} className="mt-8">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface hover:text-foreground"
          >
            <LogOut size={16} /> Abmelden
          </button>
        </form>
      </aside>

      <main className="flex-1">{children}</main>
    </div>
  );
}
