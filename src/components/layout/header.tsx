"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Menu, X } from "lucide-react";
import { mainNav } from "@/lib/site-config";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchOverlay } from "@/components/search/search-overlay";
import { ScrollProgress } from "@/components/scroll-progress";
import { Logo } from "@/components/logo";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 12);
  });

  return (
    <header
      className={`sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md transition-shadow duration-300 ${
        scrolled ? "shadow-lg shadow-black/10 dark:shadow-black/40" : ""
      }`}
    >
      <ScrollProgress />
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6">
        <Link href="/" className="shrink-0 transition-transform hover:scale-105">
          <Logo className="h-8 w-auto" />
        </Link>

        <nav className="hidden items-center gap-5 lg:flex xl:gap-8">
          {mainNav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative text-sm transition-colors ${
                  active ? "text-accent" : "text-muted hover:text-foreground"
                }`}
              >
                {item.label}
                {active ? (
                  <motion.span
                    layoutId="nav-active-pill"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    className="absolute -bottom-1 left-0 h-px w-full bg-lime"
                  />
                ) : (
                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-lime transition-all duration-300 group-hover:w-full" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden shrink-0 items-center gap-3 lg:flex xl:gap-4">
          <SearchOverlay />
          <ThemeToggle />
          <Link
            href="/probetermin"
            className="whitespace-nowrap rounded-full bg-lime px-5 py-2 text-sm font-semibold text-on-lime transition-transform hover:scale-105 active:scale-95"
          >
            Probetermin buchen
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <SearchOverlay />
          <button
            type="button"
            className="flex items-center justify-center"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menü öffnen"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={open ? "close" : "open"}
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center"
              >
                {open ? <X size={22} /> : <Menu size={22} />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-border lg:hidden"
          >
            <nav className="flex flex-col gap-4 px-6 py-4">
              {mainNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="text-sm text-muted hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/probetermin"
                onClick={() => setOpen(false)}
                className="mt-2 w-fit rounded-full bg-lime px-5 py-2 text-sm font-semibold text-on-lime"
              >
                Probetermin buchen
              </Link>
              <div className="pt-2">
                <ThemeToggle />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
