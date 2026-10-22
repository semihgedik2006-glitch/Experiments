import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { CtaBanner } from "@/components/cta-banner";
import { TarifVergleich } from "@/components/preise/tarif-vergleich";
import { BrotkrumenJsonLd, FrageJsonLd } from "@/components/structured-data";
import { FRAGEN, frageZu } from "@/lib/fragen";
import { prisma } from "@/lib/prisma";
import { getText } from "@/lib/site-texte";
import { isVisible } from "@/lib/site-toggles";
import { siteConfig } from "@/lib/site-config";

/**
 * Eine Frage, eine Seite - Inhalte und Begründung in @/lib/fragen.
 *
 * Aufbau für Suchmaschinen und KI-Assistenten: Die Frage ist die
 * Überschrift, die kurze Antwort steht direkt darunter (und im selben
 * Wortlaut in den strukturierten Daten), danach die Einzelheiten.
 */

export function generateStaticParams() {
  return FRAGEN.map((f) => ({ slug: f.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const frage = frageZu(slug);
  if (!frage) return {};
  return {
    title: frage.frage,
    description: frage.beschreibung,
    alternates: { canonical: `/fragen/${frage.slug}` },
    openGraph: {
      title: `${frage.frage} | ${siteConfig.name}`,
      description: frage.beschreibung,
      url: `${siteConfig.url}/fragen/${frage.slug}`,
    },
  };
}

export default async function FragenSeite({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const frage = frageZu(slug);
  if (!frage) notFound();

  // Die Tarife nur, wenn die Preisseite sichtbar ist - sonst stünden hier
  // Preise, die das Studio gerade bewusst nicht zeigt.
  const tarife =
    frage.mitTarifen && (await isVisible("preise"))
      ? await Promise.all([
          prisma.tarif.findMany({
            where: { aktiv: true },
            orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
            select: {
              id: true,
              name: true,
              untertitel: true,
              preis: true,
              preisZusatz: true,
              leistungen: true,
              empfohlen: true,
              hinweis: true,
            },
          }),
          getText("preis-hinweis"),
        ]).catch(() => null)
      : null;

  const andere = FRAGEN.filter((f) => f.slug !== frage.slug);

  return (
    <>
      <FrageJsonLd frage={frage} />
      <BrotkrumenJsonLd
        pfad={[
          { name: "Fragen", href: "/fragen" },
          { name: frage.kurz, href: `/fragen/${frage.slug}` },
        ]}
      />

      <PageHeader kicker="Kurz beantwortet" title={frage.frage}>
        {/* Die Antwort zuerst - wer nur das wissen wollte, ist hier fertig. */}
        <p className="mt-6 max-w-2xl rounded-2xl border-l-4 border-lime bg-surface px-5 py-4 text-lg leading-relaxed">
          {frage.antwort}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/probetermin">
            Kostenloses Probetraining
            <ArrowRight size={16} aria-hidden />
          </Button>
        </div>
      </PageHeader>

      <section className="border-t border-border py-16 sm:py-20">
        <Container className="max-w-3xl space-y-12">
          {frage.abschnitte.map((abschnitt) => (
            <Reveal key={abschnitt.titel}>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{abschnitt.titel}</h2>
              {abschnitt.text && <p className="mt-4 leading-relaxed text-foreground/80">{abschnitt.text}</p>}
              {abschnitt.liste && (
                <ul className="mt-5 space-y-3">
                  {abschnitt.liste.map((punkt) => (
                    <li key={punkt} className="flex items-start gap-3">
                      <Check size={18} className="mt-0.5 shrink-0 text-accent" aria-hidden />
                      <span className="leading-relaxed">{punkt}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Reveal>
          ))}

          <div className="flex flex-wrap gap-x-6 gap-y-3 border-t border-border pt-8">
            {frage.weiter.map((w) => {
              const extern = w.href.startsWith("http");
              return (
                <Link
                  key={w.href}
                  href={w.href}
                  {...(extern ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="tastflaeche inline-flex items-center gap-1 text-sm font-semibold text-accent underline-offset-4 hover:underline"
                >
                  {w.label}
                  {extern ? <ArrowUpRight size={14} aria-hidden /> : <ArrowRight size={14} aria-hidden />}
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      {tarife && <TarifVergleich tarife={tarife[0]} hinweis={tarife[1]} />}

      <section className="border-t border-border bg-surface py-14">
        <Container className="max-w-3xl">
          <h2 className="text-lg font-semibold">Weitere Fragen</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {andere.map((f) => (
              <li key={f.slug}>
                <Link
                  href={`/fragen/${f.slug}`}
                  className="card block h-full rounded-2xl border border-border p-4 text-sm font-medium transition-colors hover:border-lime"
                >
                  {f.frage}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <CtaBanner />
    </>
  );
}
