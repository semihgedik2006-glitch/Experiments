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
  type LucideIcon,
} from "lucide-react";

type NavItem = { href: string; label: string; icon: LucideIcon };
type NavGroup = { title: string | null; items: NavItem[] };

const groups: NavGroup[] = [
  { title: null, items: [{ href: "/admin", label: "Übersicht", icon: LayoutDashboard }] },
  {
    title: "Termine",
    items: [
      { href: "/admin/bookings", label: "Buchungen", icon: CalendarCheck },
      { href: "/admin/verfuegbarkeit", label: "Verfügbarkeit", icon: CalendarClock },
    ],
  },
  {
    title: "Inhalte",
    items: [
      { href: "/admin/blog", label: "Blog", icon: Newspaper },
      { href: "/admin/kommentare", label: "Kommentare", icon: MessageSquare },
      { href: "/admin/faq", label: "FAQ", icon: HelpCircle },
    ],
  },
  {
    title: "Kontakt",
    items: [
      { href: "/admin/nachrichten", label: "Nachrichten", icon: Mail },
      { href: "/admin/newsletter", label: "Newsletter", icon: Send },
    ],
  },
  { title: "Verwaltung", items: [{ href: "/admin/studios", label: "Studios", icon: Building2 }] },
];

const navDelays = new Map(
  groups.flatMap((group) => group.items).map((item, index) => [item.href, index * 0.04]),
);

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Verwaltung" className="flex flex-col gap-5">
      {groups.map((group, groupIndex) => (
        <div key={group.title ?? `group-${groupIndex}`}>
          {group.title && (
            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted/70">
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
                        layoutId="admin-nav-active"
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
