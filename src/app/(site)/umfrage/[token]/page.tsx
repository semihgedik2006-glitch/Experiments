import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { UmfrageFormular } from "@/components/mitglied/umfrage-formular";
import { prisma } from "@/lib/prisma";
import { NOTEN } from "@/lib/mitglieder";

export const metadata: Metadata = {
  title: "Wie zufrieden bist du?",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

/**
 * Die Zufriedenheitsumfrage - eine Frage, eine Note, ein freies Feld.
 *
 * Ein unbekannter Schlüssel zeigt einen freundlichen Satz statt eines
 * Fehlers: Wer hier landet, hat eine alte Mail geöffnet, und das ist kein
 * Grund für eine rote Meldung.
 */
export default async function UmfrageSeite({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ note?: string }>;
}) {
  const { token } = await params;
  const { note } = await searchParams;

  const mitglied = /^[a-f0-9]{64}$/.test(token)
    ? await prisma.mitglied.findUnique({
        where: { token },
        select: { vorname: true, umfrageNote: true },
      })
    : null;

  const vorauswahl = Number(note);
  const gewaehlt =
    Number.isInteger(vorauswahl) && vorauswahl >= 1 && vorauswahl <= 5
      ? vorauswahl
      : (mitglied?.umfrageNote ?? null);

  return (
    <>
      <PageHeader
        ohneMotiv
        kicker="Deine Meinung"
        title={
          mitglied ? (
            <>
              Hallo <span className="text-accent">{mitglied.vorname}</span>
            </>
          ) : (
            <>Diese Umfrage ist vorbei</>
          )
        }
        intro={
          mitglied
            ? "Prüf kurz deine Auswahl und schick sie ab. Wenn du magst, schreib noch einen Satz dazu."
            : "Der Link gilt nicht mehr. Sag uns gern direkt im Studio, wie es dir gefällt."
        }
      />
      {mitglied && (
        <Container className="max-w-3xl pb-24">
          {mitglied.umfrageNote !== null && (
            <p className="mb-6 text-sm text-muted">
              Du hast schon geantwortet. Wenn du jetzt absendest, ersetzt das deine letzte Antwort.
            </p>
          )}
          <UmfrageFormular token={token} vorauswahl={gewaehlt} noten={NOTEN} />
        </Container>
      )}
    </>
  );
}
