import { GEGENANZEIGEN } from "@/lib/ablauf";
import { auszeichnung } from "@/lib/auszeichnung";

/**
 * Seiten, die je eine Frage beantworten: /fragen/kosten, /fragen/sicherheit, ...
 *
 * Wofür: Gesucht wird in ganzen Fragen ("Was kostet EMS-Training?"), bei
 * Google wie bei ChatGPT, Perplexity & Co. Eine Seite, die genau diese
 * Frage im ersten Absatz beantwortet, wird eher gefunden und eher
 * zitiert als eine, auf der die Antwort irgendwo im Fließtext steht.
 *
 * Deshalb steht oben immer die kurze Antwort, darunter die Einzelheiten.
 *
 * NUR WAS BELEGT IST: Die Inhalte kommen aus dem, was die Seite ohnehin
 * sagt - FAQ, Ablauf, Gegenanzeigen (@/lib/ablauf), Auszeichnung
 * (@/lib/auszeichnung). Keine Heilversprechen, keine Abnehm-Zahlen: KI-
 * Antworten zitieren wörtlich, und ein Versprechen auf einer Fragen-Seite
 * wird zum Versprechen in jeder Antwort, die sie zitiert.
 */

export type FragenAbschnitt = {
  titel: string;
  text?: string;
  liste?: string[];
};

export type Frage = {
  slug: string;
  /** Die Frage, wie sie gesucht wird - steht als Überschrift. */
  frage: string;
  /** Kurz für Menüs und Listen. */
  kurz: string;
  beschreibung: string;
  /** Die Antwort in zwei, drei Sätzen. Steht ganz oben. */
  antwort: string;
  abschnitte: FragenAbschnitt[];
  /** Wohin es von hier aus weitergeht. */
  weiter: { label: string; href: string }[];
  /** Zeigt die aktuellen Tarife aus dem Adminbereich, falls es welche gibt. */
  mitTarifen?: boolean;
};

export const FRAGEN: Frage[] = [
  {
    slug: "kosten",
    frage: "Was kostet EMS-Training in Köln?",
    kurz: "Kosten",
    beschreibung:
      "Was EMS-Training bei Körperformen in Köln und Umgebung kostet, wovon der Preis abhängt und warum das erste Probetraining kostenlos ist.",
    antwort:
      "Das erste Probetraining ist kostenlos und unverbindlich. Danach hängt der Beitrag davon ab, wie oft du trainierst, welches Ziel du hast und welche Laufzeit du wählst – die Konditionen besprechen wir persönlich und transparent, ohne versteckte Kosten.",
    abschnitte: [
      {
        titel: "Wovon der Preis abhängt",
        liste: [
          "Wie oft du trainierst – ein- oder zweimal pro Woche ist der größte Hebel.",
          "Dein Ziel – Abnehmen, Rücken oder Muskelaufbau brauchen unterschiedlich lange Begleitung.",
          "Die Laufzeit – längere Bindung senkt den Beitrag pro Einheit, kürzere lässt mehr Spielraum.",
          "Zusatzleistungen wie Ernährungsberatung – möglich, aber kein Muss.",
        ],
      },
      {
        titel: "Was immer dabei ist",
        liste: [
          "Ein persönlicher Trainer bei jeder Einheit",
          "EMS-Weste und Funktionsunterwäsche – du brauchst nur zwei Handtücher",
          "Ein Trainingsplan, der zu deinem Ziel passt",
        ],
      },
    ],
    weiter: [
      { label: "Alle Preise und Tarife", href: "/preise" },
      { label: "So läuft das Probetraining ab", href: "/erster-besuch" },
    ],
    mitTarifen: true,
  },
  {
    slug: "sicherheit",
    frage: "Ist EMS-Training sicher?",
    kurz: "Sicherheit",
    beschreibung:
      "Wie EMS-Training bei Körperformen abgesichert ist, wann wir grundsätzlich nicht trainieren und was beim ersten Termin geklärt wird.",
    antwort:
      "Bei Körperformen trainierst du ausschließlich unter persönlicher Anleitung und mit geprüften Geräten. Beim ersten Termin gehen wir gemeinsam durch, was bei dir zu beachten ist. In einigen Fällen verzichten wir grundsätzlich auf EMS-Training – im Zweifel klärst du das vorher mit deinem Arzt.",
    abschnitte: [
      {
        titel: "Wie das Training abgesichert ist",
        liste: [
          "Ein Trainer ist bei jeder Einheit persönlich dabei.",
          "Jede Muskelgruppe wird einzeln angesteuert und dosiert – du bestimmst mit, was sich gut anfühlt.",
          "Beim ersten Besuch klären wir Ziele und Gesundheitszustand, bevor trainiert wird.",
          "Es kommen keine schweren Gewichte zum Einsatz.",
        ],
      },
      {
        titel: "Wann wir grundsätzlich nicht trainieren",
        liste: GEGENANZEIGEN,
      },
      {
        titel: "Wichtig",
        text: "Wir sind kein medizinischer Betrieb und ersetzen keine ärztliche Beratung. Angaben zu deiner Gesundheit fragen wir bewusst nicht online ab – darüber sprechen wir vor Ort.",
      },
    ],
    weiter: [
      { label: "EMS-Training erklärt", href: "/ems-training" },
      { label: "Der erste Besuch, Minute für Minute", href: "/erster-besuch" },
    ],
  },
  {
    slug: "erfahrungen",
    frage: "Welche Erfahrungen gibt es mit Körperformen?",
    kurz: "Erfahrungen",
    beschreibung: `Körperformen belegt Platz 1 bei „${auszeichnung.titel}“ (${auszeichnung.herausgeberKurz}). Was die Kundenbefragung zeigt und wie du dir selbst ein Bild machst.`,
    antwort: `In der Kundenbefragung „${auszeichnung.titel}“ der ${auszeichnung.herausgeberKurz} (Deutsche Gesellschaft für Verbraucherstudien) belegte die Marke Körperformen Platz 1 der Gesamtwertung – und erhielt in allen Teilkategorien die beste Bewertung. Am besten machst du dir selbst ein Bild: Das erste Probetraining ist kostenlos.`,
    abschnitte: [
      {
        titel: "Die Befragung",
        liste: [
          `Herausgeber: ${auszeichnung.herausgeber}`,
          `Zeitraum: ${auszeichnung.zeitraum}, veröffentlicht am ${auszeichnung.veroeffentlicht}`,
          `${auszeichnung.bewertungen} Bewertungen zu ${auszeichnung.anbieter} EMS-Studio-Ketten`,
          `Bewertet: ${auszeichnung.kategorien.map((k) => k.name).join(", ")}`,
        ],
      },
      {
        titel: "Was ausgezeichnet ist",
        text: "Ausgezeichnet ist die Marke Körperformen mit ihren Studios in ganz Deutschland. Wir sind der größte Körperformen-Partner in Köln und Umgebung.",
      },
    ],
    weiter: [
      { label: "Zur Studie der DtGV", href: auszeichnung.quelle },
      { label: "Studios in Köln und Umgebung", href: "/studio" },
    ],
  },
  {
    slug: "ruecken",
    frage: "Ist EMS-Training gut für den Rücken?",
    kurz: "Rücken",
    beschreibung:
      "Was EMS-Training für Rücken und Rumpf bedeutet, wo die Grenzen sind und wann du vorher mit deinem Arzt sprechen solltest.",
    antwort:
      "EMS-Training kräftigt die Muskulatur – auch an Rücken und Rumpf – und kommt dabei ohne schwere Gewichte aus. Bei bestehenden Beschwerden klärst du bitte vorher mit deinem Arzt, ob es für dich in Frage kommt. Wir sind kein medizinischer Betrieb und versprechen keine Heilung.",
    abschnitte: [
      {
        titel: "Was im Training passiert",
        liste: [
          "Die Weste steuert acht Zonen einzeln an – darunter oberer und unterer Rücken.",
          "Dein Trainer legt den Schwerpunkt auf Rücken und Rumpf, wenn das dein Ziel ist.",
          "Einfache Übungen ohne Gewichte – es lastet kein zusätzliches Gewicht auf Gelenken und Wirbelsäule.",
          "Eine Einheit pro Woche, 20 Minuten.",
        ],
      },
      {
        titel: "Wo die Grenzen sind",
        text: "EMS-Training ist Training, keine Therapie. Bei akuten Beschwerden, nach Operationen oder bei Erkrankungen der Wirbelsäule sprich vorher mit deinem Arzt – und sag uns beim ersten Termin, was vorliegt.",
      },
    ],
    weiter: [
      { label: "EMS-Training für einen starken Rücken", href: "/ziel/ruecken" },
      { label: "Ist EMS-Training sicher?", href: "/fragen/sicherheit" },
    ],
  },
];

export function frageZu(slug: string): Frage | undefined {
  return FRAGEN.find((f) => f.slug === slug);
}
