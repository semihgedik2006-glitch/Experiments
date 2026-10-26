import type { Metadata } from "next";
import Link from "@/components/sprach-link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { fragen } from "@/lib/fragen";
import type { Sprache } from "@/lib/sprache";
import { seitenMetadaten } from "@/lib/i18n/metadaten";

export function fragenMetadaten(sprache: Sprache): Metadata {
  return seitenMetadaten(
    sprache,
    "/fragen",
    sprache === "en"
      ? {
          title: "Questions about EMS training",
          description:
            "Cost, safety, reviews, your back: the most common questions about EMS training at Körperformen in and around Cologne - answered briefly.",
        }
      : {
          title: "Fragen zum EMS-Training",
          description:
            "Kosten, Sicherheit, Erfahrungen, Rücken: die häufigsten Fragen zum EMS-Training bei Körperformen in Köln und Umgebung - kurz beantwortet.",
        },
  );
}

/** Die Übersicht der Fragen-Seiten (@/lib/fragen). */
export function FragenUebersicht({ sprache }: { sprache: Sprache }) {
  const en = sprache === "en";
  return (
    <>
      <PageHeader
        kicker={en ? "Answered briefly" : "Kurz beantwortet"}
        title={
          en ? (
            <>
              Questions about <span className="text-accent">EMS training</span>
            </>
          ) : (
            <>
              Fragen zum <span className="text-accent">EMS-Training</span>
            </>
          )
        }
        intro={
          en
            ? "The answers people search for most – each in two or three sentences at the top, with the details below."
            : "Die Antworten, nach denen am häufigsten gesucht wird – jeweils oben in zwei, drei Sätzen, darunter die Einzelheiten."
        }
      />
      <section className="border-t border-border py-16 sm:py-20">
        <Container className="max-w-3xl">
          <ul className="space-y-4">
            {fragen(sprache).map((f) => (
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
