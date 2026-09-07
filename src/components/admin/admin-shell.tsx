"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";

/**
 * Hülle des Adminbereichs.
 *
 * Vorher stand hier eine feste Seitenleiste von 224 Pixeln neben dem Inhalt,
 * ohne einen einzigen Umbruchpunkt. Auf einem Handy blieben für den Inhalt
 * rund 100 Pixel Breite - unbedienbar, ausgerechnet dort, wo man zwischen
 * zwei Trainings kurz eine Buchung bestätigen will.
 *
 * Ab Tablet-Breite steht die Seitenleiste wie bisher links, bleibt beim
 * Scrollen aber stehen. Darunter rückt sie in ein Menü, das über die Seite
 * fährt.
 */
export function AdminShell({
  children,
  logout,
}: {
  children: ReactNode;
  logout: () => void | Promise<void>;
}) {
  const pathname = usePathname();

  // Statt eines Ja/Nein-Schalters wird gespeichert, auf welcher Seite das
  // Menü geöffnet wurde. Beim Seitenwechsel stimmt der Wert nicht mehr
  // überein und das Menü ist von allein zu - ohne Effekt, der Zustand
  // nachträglich zurücksetzt.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname;

  // Solange das Menü über der Seite liegt, soll der Hintergrund nicht
  // mitscrollen.
  useEffect(() => {
    if (!open) return;
    const vorher = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = vorher;
    };
  }, [open]);

  return (
    <div className="admin min-h-screen bg-background">
      {/* Kopfzeile - nur unterhalb der Tablet-Breite */}
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setOpenedOn(pathname)}
          aria-label="Menü öffnen"
          aria-expanded={open}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border transition-colors hover:border-lime"
        >
          <Menu size={18} />
        </button>
        <p className="text-sm font-semibold tracking-tight">
          Körper<span className="text-accent">formen</span> Admin
        </p>
        <form action={logout} className="ml-auto">
          <button
            type="submit"
            aria-label="Abmelden"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-lime hover:text-foreground"
          >
            <LogOut size={16} />
          </button>
        </form>
      </header>

      {/* Menü als Überlagerung */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Menü schließen"
            onClick={() => setOpenedOn(null)}
            className="absolute inset-0 bg-black/50"
          />
          <div className="relative flex h-full w-72 max-w-[85vw] flex-col overflow-y-auto border-r border-border bg-background p-4">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm font-semibold tracking-tight">
                Körper<span className="text-accent">formen</span> Admin
              </p>
              <button
                type="button"
                onClick={() => setOpenedOn(null)}
                aria-label="Menü schließen"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border"
              >
                <X size={16} />
              </button>
            </div>
            {/* Eigene Kennung für die Markierung des aktiven Eintrags: Die
                Leiste links bleibt im Baum, und zwei Elemente mit derselben
                Kennung würden sich die Markierung gegenseitig wegziehen. */}
            <AdminNav idPrefix="drawer" />
          </div>
        </div>
      )}

      <div className="mx-auto flex w-full max-w-7xl gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="hidden w-52 shrink-0 lg:block">
          <div className="sticky top-6">
            <p className="mb-6 text-sm font-semibold tracking-tight">
              Körper<span className="text-accent">formen</span> Admin
            </p>

            <AdminNav />

            <form action={logout} className="mt-6 border-t border-border pt-4">
              <button
                type="submit"
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface hover:text-foreground"
              >
                <LogOut size={16} /> Abmelden
              </button>
            </form>
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
