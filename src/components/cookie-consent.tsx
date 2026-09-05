"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  subscribeConsent,
  readConsent,
  serverConsent,
  writeConsent,
  type Consent,
} from "@/lib/consent";

const emptySubscribe = () => () => {};

export function CookieConsent({ children }: { children?: ReactNode }) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const consent = useSyncExternalStore(subscribeConsent, readConsent, serverConsent);

  function choose(value: Consent) {
    writeConsent(value);
  }

  return (
    <>
      {consent === "accepted" && children}

      <AnimatePresence>
        {mounted && consent === null && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-0 z-[100] border-t border-border bg-surface-raised/95 backdrop-blur-md"
          >
            <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted">
                Wir verwenden nur technisch notwendige Cookies. Mit deiner
                Zustimmung nutzen wir zusätzlich Google Analytics, um die
                Website zu verbessern. Mehr dazu in unserer{" "}
                <a href="/datenschutz" className="text-accent underline underline-offset-2">
                  Datenschutzerklärung
                </a>
                .
              </p>
              <div className="flex shrink-0 gap-3">
                <button
                  type="button"
                  onClick={() => choose("declined")}
                  className="rounded-full border border-border px-5 py-2 text-sm font-semibold transition-colors hover:border-lime hover:text-accent"
                >
                  Nur notwendige
                </button>
                <button
                  type="button"
                  onClick={() => choose("accepted")}
                  className="rounded-full bg-lime px-5 py-2 text-sm font-semibold text-on-lime transition-transform hover:scale-105"
                >
                  Akzeptieren
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
