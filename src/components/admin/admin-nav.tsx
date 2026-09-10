"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  Building2,
  CalendarCheck,
  CalendarClock,
  Newspaper,
  MessageSquare,
  HelpCircle,
  Mail,
  Send,
  Eye,
  DatabaseBackup,
  Users,
  UserCog,
  BarChart3,
  Ticket,
  MailCheck,
  Hourglass,
  type LucideIcon,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Bereiche, die nur die Leitung sieht. Eine Studioleitung verwaltet
      ihren Standort, nicht die Marke. */
  nurLeitung?: boolean;
};
type NavGroup = { title: string | null; items: NavItem[] };

const groups: NavGroup[] = [
  { title: null, items: [{ href: "/admin", label: "Übersicht", icon: LayoutDashboard }] },
  {
    title: "Termine",
    items: [
      { href: "/admin/bookings", label: "Buchungen", icon: CalendarCheck },
      { href: "/admin/verfuegbarkeit", label: "Verfügbarkeit", icon: CalendarClock },
      { href: "/admin/warteliste", label: "Warteliste", icon: Hourglass },
      { href: "/admin/auswertung", label: "Auswertung", icon: BarChart3 },
    ],
  },
  {
    title: "Inhalte",
    items: [
      { href: "/admin/blog", label: "Blog", icon: Newspaper, nurLeitung: true },
      { href: "/admin/kommentare", label: "Kommentare", icon: MessageSquare, nurLeitung: true },
      { href: "/admin/faq", label: "FAQ", icon: HelpCircle, nurLeitung: true },
    ],
  },
  {
    title: "Kontakt",
    items: [
      { href: "/admin/nachrichten", label: "Nachrichten", icon: Mail, nurLeitung: true },
      { href: "/admin/newsletter", label: "Newsletter", icon: Send, nurLeitung: true },
      { href: "/admin/aktionen", label: "Aktionscodes", icon: Ticket, nurLeitung: true },
      { href: "/admin/mails", label: "E-Mail-Versand", icon: MailCheck, nurLeitung: true },
    ],
  },
  {
    title: "Verwaltung",
    items: [
      { href: "/admin/studios", label: "Studios", icon: Building2 },
      { href: "/admin/sichtbarkeit", label: "Sichtbarkeit", icon: Eye, nurLeitung: true },
      { href: "/admin/sicherung", label: "Datensicherung", icon: DatabaseBackup, nurLeitung: true },
      { href: "/admin/team", label: "Zugänge", icon: Users, nurLeitung: true },
      // Ohne nurLeitung: Das eigene Passwort ändert jeder selbst.
      { href: "/admin/konto", label: "Mein Zugang", icon: UserCog },
    ],
  },
];

const navDelays = new Map(
  groups.flatMap((group) => group.items).map((item, index) => [item.href, index * 0.04]),
);

export function AdminNav({
  idPrefix = "sidebar",
  istLeitung = true,
}: { idPrefix?: string; istLeitung?: boolean } = {}) {
  const pathname = usePathname();

  // Ausgeblendet statt ausgegraut: Ein Menüpunkt, der nur zur Übersicht
  // zurückwirft, ist kein Angebot.
  const sichtbareGruppen = groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => istLeitung || !item.nurLeitung),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <nav aria-label="Verwaltung" className="flex flex-col gap-5">
      {sichtbareGruppen.map((group, groupIndex) => (
        <div key={group.title ?? `group-${groupIndex}`}>
          {group.title && (
            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
              {group.title}
            </p>
          )}
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const isActive = pathname === item.href;
              const delay = navDelays.get(item.href) ?? 0;

              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={item.href}
                    className={`relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                      isActive ? "text-foreground" : "text-muted hover:bg-surface hover:text-foreground"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId={`${idPrefix}-nav-active`}
                        className="absolute inset-0 rounded-lg bg-lime/15"
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      />
                    )}
                    <item.icon size={16} className={`relative shrink-0 ${isActive ? "text-accent" : ""}`} />
                    <span className="relative">{item.label}</span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
