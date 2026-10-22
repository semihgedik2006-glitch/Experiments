import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { FRAGEN } from "@/lib/fragen";

export const metadata: Metadata = {
  title: "Fragen zum EMS-Training",
  description:
    "Kosten, Sicherheit, Erfahrungen, Rücken: die häufigsten Fragen zum EMS-Training bei Körperformen in Köln und Umgebung - kurz beantwortet.",
  alternates: { canonical: "/fragen" },
};

/** Die Übersicht der Fragen-Seiten (@/lib/fragen). */
export default function FragenUebersicht() {
  return (
    <>
      <PageHeader
        kicker="Kurz beantwortet"
        title={
          <>
            Fragen zum <span className="text-accent">EMS-Training</span>
          </>
        }
        intro="Die Antworten, nach denen am häufigsten gesucht wird – jeweils oben in zwei, drei Sätzen, darunter die Einzelheiten."
      />
      <section className="border-t border-border py-16 sm:py-20">
        <Container className="max-w-3xl">
          <ul className="space-y-4">
            {FRAGEN.map((f) => (
              <li key={f.slug}>
                <Link
                  href={`/fragen/${f.slug}`}
                  className="card group flex items-start justify-between gap-4 rounded-2xl border border-border p-5 transition-colors hover:border-lime"
                >
                  <span>
                    <span className="block text-lg font-semibold">{f.frage}</span>
                    <span className="mt-1 block text-sm text-muted line-clamp-2">{f.antwort}</span>
                  </span>
                  <ArrowRight size={18} className="mt-1 shrink-0 text-accent transition-transform group-hover:translate-x-1" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
