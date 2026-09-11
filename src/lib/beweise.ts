import { prisma } from "@/lib/prisma";
import { freiePlaetze } from "@/lib/kapazitaet";

/**
 * Zahlen, die stimmen.
 *
 * Die Seite hatte bis vor Kurzem eine hochzählende "90 %" auf der
 * Startseite - eine Zahl aus fremden Prospekten, für die nirgends eine
 * Quelle stand. Sie ist weg, und die Frage danach ist berechtigt: Ohne
 * Zahlen glaubt einem niemand etwas.
 *
 * Die Antwort steht in eurer eigenen Datenbank. Vierzehn Standorte,
 * dreihundert freie Termine in der nächsten Woche, der nächste davon
 * heute um 18:40 in Hürth - das sind Zahlen, die kein Wettbewerber
 * abschreiben kann, die niemand nachrechnen muss und die sich jeden Tag
 * selbst aktualisieren. Und sie beantworten genau die Frage, mit der
 * jemand auf der Seite ist: "Kann ich da hin, und wann?"
 *
 * Drei Regeln für alles hier:
 *
 * 1. NICHTS WIRD GESCHÄTZT. Jede Zahl kommt aus einer Abfrage. Was sich
 *    nicht abfragen lässt, steht hier nicht.
 * 2. NULL IST KEINE ZAHL. Ist ein Wert 0 oder unbekannt, kommt null
 *    zurück und der Baustein verschwindet - "0 freie Termine" auf der
 *    Startseite wäre schlimmer als gar keine Angabe.
 * 3. EIN AUSFALL KOSTET KEINE SEITE. Geht die Abfrage schief, gibt es
 *    leere Werte statt einer Fehlermeldung.
 */

export type Beweise = {
  /** Wie viele Standorte es gibt. */
  standorte: number;
  /** Wie viele Orte (Städte/Stadtteile) abgedeckt sind. */
  orte: number;
  /** Freie Plätze in den nächsten sieben Tagen, über alle Standorte. */
  freieTermine7Tage: number | null;
  /** Wie viele Standorte in den nächsten sieben Tagen etwas frei haben. */
  standorteMitTerminen: number | null;
  /** Früheste und späteste Uhrzeit im Angebot, z.B. "07:00" / "21:00". */
  frueheste: string | null;
  /** Späteste Endzeit. */
  spaeteste: string | null;
};

/*
 * WARUM HIER KEINE TRAININGSDAUER STEHT
 *
 * Der naheliegende Gedanke war, sie aus den Terminen zu rechnen: Ende
 * minus Anfang, fertig. Gemessen kam dabei "30 Minuten" heraus - während
 * auf der ganzen Website "20 Minuten" steht.
 *
 * Beides stimmt. Ein Termin im Kalender ist ein halbstündiges Fenster:
 * ankommen, Weste anlegen, zwanzig Minuten trainieren, kurz nachbesprechen.
 * Die Rechnung misst also die Länge des Fensters und nicht die des
 * Trainings - und hätte die Seite sich selbst widersprechen lassen.
 *
 * Wie lange eine Einheit dauert, ist eine Aussage des Studios über sein
 * Angebot. Die gehört in den Text, nicht in eine Abfrage.
 */

const LEER: Beweise = {
  standorte: 0,
  orte: 0,
  freieTermine7Tage: null,
  standorteMitTerminen: null,
  frueheste: null,
  spaeteste: null,
};

/** "17:00" zu 1020 Minuten - zum Vergleichen und Rechnen. */
function inMinuten(zeit: string): number | null {
  const treffer = /^(\d{1,2}):(\d{2})$/.exec(zeit.trim());
  if (!treffer) return null;
  const [stunden, minuten] = treffer.slice(1).map(Number);
  if (stunden > 23 || minuten > 59) return null;
  return stunden * 60 + minuten;
}

export async function beweiseHolen(): Promise<Beweise> {
  try {
    const heute = new Date();
    heute.setHours(0, 0, 0, 0);
    const inEinerWoche = new Date(heute);
    inEinerWoche.setDate(inEinerWoche.getDate() + 7);

    const [studios, slots] = await Promise.all([
      prisma.studioLocation.findMany({ select: { city: true } }),
      prisma.availabilitySlot.findMany({
        where: { date: { gte: heute, lt: inEinerWoche } },
        select: {
          studioId: true,
          startTime: true,
          endTime: true,
          capacity: true,
          bookings: {
            where: { status: { not: "CANCELLED" } },
            select: { zuZweit: true },
          },
        },
      }),
    ]);

    let frei = 0;
    const mitTerminen = new Set<string>();
    let frueheste: number | null = null;
    let spaeteste: number | null = null;

    for (const slot of slots) {
      const offen = freiePlaetze(slot.capacity, slot.bookings);
      if (offen > 0) {
        frei += offen;
        mitTerminen.add(slot.studioId);
      }

      const start = inMinuten(slot.startTime);
      const ende = inMinuten(slot.endTime);
      if (start !== null && (frueheste === null || start < frueheste)) frueheste = start;
      if (ende !== null && (spaeteste === null || ende > spaeteste)) spaeteste = ende;
    }

    const alsZeit = (m: number | null) =>
      m === null
        ? null
        : `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

    return {
      standorte: studios.length,
      orte: new Set(studios.map((s) => s.city.trim()).filter(Boolean)).size,
      freieTermine7Tage: frei > 0 ? frei : null,
      standorteMitTerminen: mitTerminen.size > 0 ? mitTerminen.size : null,
      frueheste: alsZeit(frueheste),
      spaeteste: alsZeit(spaeteste),
    };
  } catch (error) {
    console.error("Zahlen konnten nicht ermittelt werden:", error);
    return LEER;
  }
}

/**
 * Die Zahlen für das Band auf der Startseite.
 *
 * Gibt nur zurück, was tatsächlich vorliegt. Bleiben weniger als drei
 * übrig, entscheidet der Aufrufer, ob sich der Abschnitt noch lohnt -
 * zwei Zahlen sind eine Aussage, eine einzelne ist eine Behauptung.
 */
export type Kennzahl = { wert: string; einheit?: string; label: string };

export function kennzahlen(b: Beweise): Kennzahl[] {
  const liste: Kennzahl[] = [];

  // Die einzige Zahl hier, die nicht aus einer Abfrage kommt - sie ist
  // auch keine Messung, sondern das Angebot selbst: einmal pro Woche.
  liste.push({
    wert: "1",
    einheit: "x",
    label: "pro Woche, 20 Minuten, immer persönlich betreut",
  });

  if (b.standorte > 0) {
    liste.push({
      wert: String(b.standorte),
      label:
        b.orte > 1
          ? `Studios in ${b.orte} Orten rund um Köln`
          : "Studios rund um Köln",
    });
  }

  if (b.freieTermine7Tage) {
    liste.push({
      wert: String(b.freieTermine7Tage),
      label: "freie Termine in den nächsten sieben Tagen",
    });
  }

  return liste;
}

/**
 * Freie Plätze je Standort in den nächsten sieben Tagen.
 *
 * Für die Standortliste: Neben einer Adresse steht damit nicht nur, wo
 * das Studio ist, sondern ob dort diese Woche überhaupt etwas frei ist.
 * Das ist die Frage, die jemand auf dieser Seite tatsächlich hat - und
 * die Antwort steht sonst erst zwei Klicks weiter.
 *
 * Standorte ohne freien Platz stehen nicht in der Karte: Der Aufrufer
 * bekommt dann undefined und lässt die Zeile weg, statt "0 freie
 * Termine" hinzuschreiben. Wer das liest, klickt nicht weiter - dabei
 * kann ein Anruf trotzdem eine Zeit ergeben.
 */
export async function freieTermineJeStudio(): Promise<Map<string, number>> {
  const ergebnis = new Map<string, number>();

  try {
    const heute = new Date();
    heute.setHours(0, 0, 0, 0);
    const inEinerWoche = new Date(heute);
    inEinerWoche.setDate(inEinerWoche.getDate() + 7);

    const slots = await prisma.availabilitySlot.findMany({
      where: { date: { gte: heute, lt: inEinerWoche } },
      select: {
        studioId: true,
        capacity: true,
        bookings: {
          where: { status: { not: "CANCELLED" } },
          select: { zuZweit: true },
        },
      },
    });

    for (const slot of slots) {
      const offen = freiePlaetze(slot.capacity, slot.bookings);
      if (offen > 0) {
        ergebnis.set(slot.studioId, (ergebnis.get(slot.studioId) ?? 0) + offen);
      }
    }
  } catch (error) {
    console.error("Freie Termine je Standort nicht ermittelbar:", error);
  }

  return ergebnis;
}
