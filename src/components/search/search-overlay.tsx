"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Search, X } from "lucide-react";

type SearchResult = { type: string; title: string; description: string; href: string };

export function SearchOverlay() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    if (query.trim().length < 2) return;
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(data.results ?? []);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  function close() {
    setOpen(false);
    setQuery("");
    setResults([]);
  }

  function goTo(href: string) {
    close();
    router.push(href);
  }

  return (
    <>
      <motion.button
        type="button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(true)}
        aria-label="Suche öffnen"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-lime hover:text-lime"
      >
        <Search size={16} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            className="fixed inset-0 z-[200] flex items-start justify-center bg-black/60 px-4 pt-24 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: -30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-surface-raised shadow-2xl"
            >
              <div className="flex items-center gap-3 border-b border-border px-5 py-4">
                <Search size={18} className="shrink-0 text-muted" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Seiten, Blog oder FAQ durchsuchen..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
                />
                <button
                  type="button"
                  onClick={close}
                  aria-label="Suche schließen"
                  className="shrink-0 text-muted hover:text-foreground"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto p-2">
                {query.trim().length < 2 && (
                  <p className="px-3 py-4 text-sm text-muted">Mindestens 2 Zeichen eingeben.</p>
                )}
                {loading && query.trim().length >= 2 && (
                  <p className="px-3 py-4 text-sm text-muted">Suche...</p>
                )}
                {!loading && query.trim().length >= 2 && results.length === 0 && (
                  <p className="px-3 py-4 text-sm text-muted">Keine Ergebnisse für &bdquo;{query}&ldquo;.</p>
                )}
                {!loading &&
                  query.trim().length >= 2 &&
                  results.map((result, index) => (
                    <button
                      key={`${result.href}-${index}`}
                      type="button"
                      onClick={() => goTo(result.href)}
                      className="flex w-full flex-col items-start gap-0.5 rounded-xl px-3 py-3 text-left transition-colors hover:bg-surface"
                    >
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-lime">
                        {result.type}
                      </span>
                      <span className="text-sm font-medium">{result.title}</span>
                      <span className="line-clamp-1 text-xs text-muted">{result.description}</span>
                    </button>
                  ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
