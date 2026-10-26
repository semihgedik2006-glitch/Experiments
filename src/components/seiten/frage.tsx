import type { Metadata } from "next";
import Link from "@/components/sprach-link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { CtaBanner } from "@/components/cta-banner";
import { TarifVergleich } from "@/components/preise/tarif-vergleich";
import { BrotkrumenJsonLd, FrageJsonLd } from "@/components/structured-data";
import { fragen, frageIn } from "@/lib/fragen";
import type { Sprache } from "@/lib/sprache";
import { lokal, lokalListe } from "@/lib/i18n/lokal";
import { seitenMetadaten } from "@/lib/i18n/metadaten";
import { prisma } from "@/lib/prisma";
import { getText } from "@/lib/site-texte";
import { isVisible } from "@/lib/site-toggles";

/**
 * Eine Frage, eine Seite - Inhalte und Begründung in @/lib/fragen.
 *
 * Aufbau für Suchmaschinen und KI-Assistenten: Die Frage ist die
 * Überschrift, die kurze Antwort steht direkt darunter (und im selben
 * Wortlaut in den strukturierten Daten), danach die Einzelheiten.
 */

/** `slug` ist die deutsche Kennung ("kosten"). */
export function frageMetadaten(sprache: Sprache, slug: string | undefined): Metadata {
  const frage = slug ? frageIn(sprache, slug) : undefined;
  if (!frage) return {};
  return seitenMetadaten(sprache, `/fragen/${frage.slug}`, {
    title: frage.frage,
    description: frage.beschreibung,
  });
}

export async function FrageSeite({ sprache, slug }: { sprache: Sprache; slug: string | undefined }) {
  const frage = slug ? frageIn(sprache, slug) : undefined;
  if (!frage) notFound();
  const en = sprache === "en";

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
              nameEn: true,
              untertitelEn: true,
              preisEn: true,
              preisZusatzEn: true,
              leistungenEn: true,
              hinweisEn: true,
            },
          }),
          getText("preis-hinweis", sprache),
        ]).catch(() => null)
      : null;

  const andere = fragen(sprache).filter((f) => f.slug !== frage.slug);

  return (
    <>
      <FrageJsonLd frage={frage} />
      <BrotkrumenJsonLd
        sprache={sprache}
        pfad={[
          { name: en ? "Questions" : "Fragen", href: "/fragen" },
          { name: frage.kurz, href: `/fragen/${frage.slug}` },
        ]}
      />

      <PageHeader kicker={en ? "Answered briefly" : "Kurz beantwortet"} title={frage.frage}>
        {/* Die Antwort zuerst - wer nur das wissen wollte, ist hier fertig. */}
        <p className="mt-6 max-w-2xl rounded-2xl border-l-4 border-lime bg-surface px-5 py-4 text-lg leading-relaxed">
          {frage.antwort}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/probetermin">
            {en ? "Free trial session" : "Kostenloses Probetraining"}
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

      {tarife && (
        <TarifVergleich
          sprache={sprache}
          hinweis={tarife[1]}
          tarife={tarife[0].map((t) => ({
            id: t.id,
            empfohlen: t.empfohlen,
            name: lokal(sprache, t.name, t.nameEn),
            untertitel: lokal(sprache, t.untertitel, t.untertitelEn),
            preis: lokal(sprache, t.preis, t.preisEn),
            preisZusatz: lokal(sprache, t.preisZusatz, t.preisZusatzEn),
            leistungen: lokalListe(sprache, t.leistungen, t.leistungenEn),
            hinweis: lokal(sprache, t.hinweis, t.hinweisEn),
          }))}
        />
      )}

      <section className="border-t border-border bg-surface py-14">
        <Container className="max-w-3xl">
          <h2 className="text-lg font-semibold">{en ? "More questions" : "Weitere Fragen"}</h2>
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

      <CtaBanner sprache={sprache} />
    </>
  );
}
