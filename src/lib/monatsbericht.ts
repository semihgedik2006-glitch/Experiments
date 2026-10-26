import { prisma } from "@/lib/prisma";
import { zielText } from "@/lib/ziel";

/**
 * Die Zahlen eines Kalendermonats für den Monatsbericht.
 *
 * Dieselben Fragen wie die Auswertung im Adminbereich - wie viele
 * Anfragen, aus welchem Studio, woher, über welchen Knopf, mit welchem
 * Ziel -, aber als Text, der von selbst kommt. Wer nicht jeden Monat in
 * den Adminbereich schaut, sieht die Entwicklung trotzdem.
 *
 * Nur Zahlen, keine Namen: Die Mail geht an ein Postfach, das mehrere
 * lesen.
 */

/** Erster Tag des Vormonats und des laufenden Monats in deutscher Zeit. */
export function vormonat(jetzt = new Date()) {
  const [jahr, monat] = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
  })
    .format(jetzt)
    .split("-")
    .map(Number);
  const von = new Date(Date.UTC(jahr, monat - 2, 1));
  const bis = new Date(Date.UTC(jahr, monat - 1, 1));
  const davor = new Date(Date.UTC(jahr, monat - 3, 1));
  const name = new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric", timeZone: "UTC" }).format(von);
  return { von, bis, davor, name };
}

type Zaehler = Map<string, number>;
function zaehlen(m: Zaehler, schluessel: string) {
  m.set(schluessel, (m.get(schluessel) ?? 0) + 1);
}
function liste(m: Zaehler, max = 8): string {
  const zeilen = [...m.entries()].sort((a, b) => b[1] - a[1]);
  if (zeilen.length === 0) return "  –";
  const breite = Math.max(...zeilen.slice(0, max).map(([k]) => k.length));
  return zeilen
    .slice(0, max)
    .map(([k, v]) => `  ${k.padEnd(breite)}  ${v}`)
    .join("\n");
}

/**
 * Schickt den Bericht, wenn im laufenden Monat noch keiner erfolgreich
 * rausging. Hängt am täglichen Lauf (api/cron/erinnerungen) statt an
 * einem eigenen Zeitplan: Je nach Vercel-Tarif ist deren Zahl begrenzt,
 * und so holt der nächste Tag nach, falls der 1. ausfällt.
 */
export async function monatsberichtFaellig(
  senden: (an: string, betreff: string, text: string) => Promise<boolean>,
  an: string | null,
  jetzt = new Date(),
): Promise<"verschickt" | "schon-da" | "keine-adresse" | "fehler"> {
  if (!an) return "keine-adresse";
  const { bis: monatsanfang } = vormonat(jetzt);
  const schon = await prisma.mailLog.findFirst({
    where: { art: "MONATSBERICHT", ok: true, createdAt: { gte: monatsanfang } },
    select: { id: true },
  });
  if (schon) return "schon-da";
  const { betreff, text } = await monatsberichtText(jetzt);
  return (await senden(an, betreff, text)) ? "verschickt" : "fehler";
}

export async function monatsberichtText(jetzt = new Date()): Promise<{ betreff: string; text: string; anzahl: number }> {
  const { von, bis, davor, name } = vormonat(jetzt);

  const [anfragen, vorher, studios] = await Promise.all([
    prisma.booking.findMany({
      where: { createdAt: { gte: von, lt: bis } },
      select: {
        status: true,
        studioId: true,
        ziel: true,
        herkunftKampagne: true,
        herkunftQuelle: true,
        herkunftEinstieg: true,
        promotion: { select: { code: true } },
      },
    }),
    prisma.booking.count({ where: { createdAt: { gte: davor, lt: von } } }),
    prisma.studioLocation.findMany({ select: { id: true, name: true } }),
  ]);

  const studioName = new Map(studios.map((s) => [s.id, s.name.replace(/^Körperformen\s+/, "")]));
  const proStudio: Zaehler = new Map();
  const proHerkunft: Zaehler = new Map();
  const proKnopf: Zaehler = new Map();
  const proZiel: Zaehler = new Map();
  let bestaetigt = 0;
  let offen = 0;
  let abgesagt = 0;

  for (const a of anfragen) {
    if (a.status === "CONFIRMED") bestaetigt++;
    else if (a.status === "PENDING") offen++;
    else if (a.status === "CANCELLED") abgesagt++;
    zaehlen(proStudio, a.studioId ? (studioName.get(a.studioId) ?? "unbekannt") : "ohne Standort");
    zaehlen(
      proHerkunft,
      a.promotion
        ? `Code ${a.promotion.code}`
        : a.herkunftKampagne
          ? `Kampagne ${a.herkunftKampagne}`
          : (a.herkunftQuelle ?? "nicht bekannt"),
    );
    // Nur mit Einwilligung erfasst (siehe @/lib/einstieg) - "ohne Angabe"
    // heißt also oft nur: keine Einwilligung.
    zaehlen(proKnopf, a.herkunftEinstieg?.split(" · ")[0] ?? "ohne Angabe");
    zaehlen(proZiel, a.ziel ? zielText(a.ziel) : "nicht angegeben");
  }

  const n = anfragen.length;
  const diff = n - vorher;
  const vergleich =
    vorher === 0 ? "" : ` (Vormonat: ${vorher}, ${diff >= 0 ? "+" : ""}${diff})`;
  const anteil = (x: number) => (n ? ` (${Math.round((x / n) * 100)} %)` : "");

  const text = `Monatsbericht ${name}

ANFRAGEN: ${n}${vergleich}
  bestätigt   ${bestaetigt}${anteil(bestaetigt)}
  noch offen  ${offen}${anteil(offen)}
  abgesagt    ${abgesagt}${anteil(abgesagt)}

JE STUDIO
${liste(proStudio, 20)}

WOHER (Code, Kampagne, sonst verweisende Seite)
${liste(proHerkunft)}

ÜBER WELCHEN KNOPF (nur mit Einwilligung erfasst)
${liste(proKnopf)}

ZIEL
${liste(proZiel)}

Alle Zahlen und Verläufe im Adminbereich unter „Auswertung“.`;

  return { betreff: `Monatsbericht ${name}: ${n} Anfragen`, text, anzahl: n };
}
