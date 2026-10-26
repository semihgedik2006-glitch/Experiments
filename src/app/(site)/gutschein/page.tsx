import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarCheck, Gift, Store } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { GutscheinFormular, type GutscheinOption } from "@/components/gutschein/gutschein-formular";
import { prisma } from "@/lib/prisma";
import { isVisible } from "@/lib/site-toggles";
import { STARTPAKET_WERT, WERT_STUFEN } from "@/lib/gutschein";

export const metadata: Metadata = {
  alternates: { canonical: "/gutschein" },
  title: "Gutschein verschenken",
  description:
    "Verschenke EMS-Training bei Körperformen: Wertgutschein oder das Startpaket. Online anfragen, im Studio bezahlen und abholen.",
};

const ablauf = [
  {
    icon: Gift,
    titel: "Online anfragen",
    text: "Gutschein auswählen, Studio wählen, abschicken. Du bekommst sofort eine Bestätigung.",
  },
  {
    icon: Store,
    titel: "Im Studio bezahlen",
    text: "Das Studio meldet sich bei dir. Bezahlt und abgeholt wird vor Ort - online zahlst du nichts.",
  },
  {
    icon: CalendarCheck,
    titel: "Lange einlösbar",
    text: "Der Gutschein gilt bis zum Ende des dritten Jahres nach dem Kauf, für alles im Studio.",
  },
];

/**
 * Gutschein verschenken.
 *
 * Die Seite ist zu Beginn ausgeschaltet (Sichtbarkeit -> Gutscheine) und
 * antwortet dann mit 404. Eingeschaltet wird sie, wenn die Studios wissen,
 * wie sie mit einer Anfrage umgehen.
 *
 * Bewusst ohne Online-Zahlung: Für ein paar Gutscheine im Jahr lohnt
 * kein Zahlungsanbieter mit Vertrag, Gebühren und Widerrufsbelehrung.
 * Bezahlt wird dort, wo der Gutschein auch eingelöst wird.
 */
export default async function GutscheinSeite({
  searchParams,
}: {
  searchParams: Promise<{ studio?: string }>;
}) {
  if (!(await isVisible("gutscheine"))) return notFound();

  const { studio } = await searchParams;
  const studios = await prisma.studioLocation.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  const vorauswahl = studios.find((s) => s.slug === studio)?.id ?? null;

  const optionen: GutscheinOption[] = [
    ...WERT_STUFEN.map((betrag) => ({
      wert: `wert-${betrag}`,
      titel: `${betrag} € Wertgutschein`,
      zeile: "Für alles im Studio - Training, Outfit, Zusatzangebote.",
    })),
    {
      wert: "startpaket",
      titel: "Startpaket geschenkt",
      zeile: `Trainingsplanung, Chipkarte und Einrichtung im Wert von ${STARTPAKET_WERT.toFixed(2).replace(".", ",")} € - der leichteste Einstieg.`,
    },
  ];

  return (
    <>
      <PageHeader
        kicker="Gutschein"
        title={
          <>
            Verschenk <span className="text-accent">EMS-Training</span>
          </>
        }
        intro="Als Wertgutschein für alles im Studio oder als Startpaket für den Einstieg. Online anfragen, im Studio bezahlen und abholen."
      />

      <section className="border-b border-border py-14">
        <Container>
          <ol className="grid gap-6 sm:grid-cols-3">
            {ablauf.map((schritt, i) => (
              <li key={schritt.titel} className="rounded-2xl border border-border bg-surface p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-lime/12 text-accent">
                  <schritt.icon size={18} aria-hidden />
                </span>
                <h2 className="mt-4 font-semibold">
                  {i + 1}. {schritt.titel}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{schritt.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="max-w-3xl">
          <GutscheinFormular optionen={optionen} studios={studios} vorauswahlStudio={vorauswahl} />
        </Container>
      </section>
    </>
  );
}
