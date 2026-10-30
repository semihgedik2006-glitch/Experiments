import { GEGENANZEIGEN, GEGENANZEIGEN_EN } from "@/lib/ablauf";
import { auszeichnung, auszeichnungEn } from "@/lib/auszeichnung";
import type { Sprache } from "@/lib/sprache";

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

/** Woran ein Text erkennen lässt, dass er eine dieser Fragen berührt. */
const STICHWORTE: Record<string, RegExp> = {
  kosten: /kost|preis|tarif|mitgliedschaft/i,
  sicherheit: /sicher|gefähr|herzschrittmacher|schwanger/i,
  ruecken: /rücken|wirbelsäule|rumpf/i,
  erfahrungen: /erfahrung|bewertung|auszeichnung/i,
};

/** Die Fragen-Seiten, die zu einem Text passen (für Verweise darunter). */
export function fragenZu(text: string, max = 2): Frage[] {
  return FRAGEN.filter((f) => STICHWORTE[f.slug]?.test(text)).slice(0, max);
}

/* ------------------------------------------------------------ Englisch */

/**
 * Dieselben Fragen auf Englisch. Die Kennung (slug) bleibt die deutsche -
 * die englische Adresse (/en/questions/cost) entsteht über @/lib/i18n/pfade.
 * Inhaltlich dieselben Aussagen, nichts dazu.
 */
export const FRAGEN_EN: Frage[] = [
  {
    slug: "kosten",
    frage: "How much does EMS training cost in Cologne?",
    kurz: "Cost",
    beschreibung:
      "What EMS training at Körperformen in and around Cologne costs, what the price depends on and why the first trial session is free.",
    antwort:
      "The first trial session is free and without obligation. After that, the price depends on how often you train, what your goal is and which term you choose – we discuss the terms personally and transparently, with no hidden costs.",
    abschnitte: [
      {
        titel: "What the price depends on",
        liste: [
          "How often you train – once or twice a week is the biggest factor.",
          "Your goal – losing weight, your back or building muscle need different lengths of support.",
          "The term – a longer commitment lowers the price per session, a shorter one leaves more flexibility.",
          "Extras such as nutrition advice – possible, but not a must.",
        ],
      },
      {
        titel: "What is always included",
        liste: [
          "A personal trainer in every session",
          "EMS vest and functional underwear – all you need is two towels",
          "A training plan that suits your goal",
        ],
      },
    ],
    weiter: [
      { label: "All prices and plans", href: "/preise" },
      { label: "How the trial session works", href: "/erster-besuch" },
    ],
    mitTarifen: true,
  },
  {
    slug: "sicherheit",
    frage: "Is EMS training safe?",
    kurz: "Safety",
    beschreibung:
      "How EMS training at Körperformen is safeguarded, when we do not train at all and what is clarified at your first appointment.",
    antwort:
      "At Körperformen you only ever train under personal guidance and with tested equipment. At your first appointment we go through together what needs to be considered in your case. In some cases we do not offer EMS training at all – if in doubt, check with your doctor beforehand.",
    abschnitte: [
      {
        titel: "How the training is safeguarded",
        liste: [
          "A trainer is with you in person in every session.",
          "Each muscle group is controlled and dosed individually – you have a say in what feels good.",
          "On your first visit we discuss your goals and your health before you train.",
          "No heavy weights are used.",
        ],
      },
      {
        titel: "When we do not train at all",
        liste: GEGENANZEIGEN_EN,
      },
      {
        titel: "Important",
        text: "We are not a medical practice and do not replace medical advice. We deliberately do not ask for health information online – we talk about it at the studio.",
      },
    ],
    weiter: [
      { label: "EMS training explained", href: "/ems-training" },
      { label: "Your first visit, minute by minute", href: "/erster-besuch" },
    ],
  },
  {
    slug: "erfahrungen",
    frage: "What do people say about Körperformen?",
    kurz: "Reviews",
    beschreibung: `Körperformen took first place in the “${auszeichnungEn.titelOriginal}” survey (${auszeichnungEn.herausgeberKurz}). What the customer survey shows and how to see for yourself.`,
    antwort: `In the customer survey “${auszeichnungEn.titelOriginal}” (${auszeichnungEn.titel}) by the ${auszeichnungEn.herausgeberKurz} (German Society for Consumer Studies), the Körperformen brand took first place overall – and received the best rating in every sub-category. The best way to judge is to see for yourself: the first trial session is free.`,
    abschnitte: [
      {
        titel: "The survey",
        liste: [
          `Publisher: ${auszeichnungEn.herausgeber}`,
          `Period: ${auszeichnungEn.zeitraum}, published ${auszeichnungEn.veroeffentlicht}`,
          `${auszeichnungEn.bewertungen} ratings of ${auszeichnungEn.anbieter} EMS studio chains`,
          `Rated: ${auszeichnungEn.kategorien.map((k) => k.name).join(", ")}`,
        ],
      },
      {
        titel: "What the award covers",
        text: "The award goes to the Körperformen brand with its studios all over Germany. We are the largest Körperformen partner in and around Cologne.",
      },
    ],
    weiter: [
      { label: "The DtGV study (German)", href: auszeichnungEn.quelle },
      { label: "Studios in and around Cologne", href: "/studio" },
    ],
  },
  {
    slug: "ruecken",
    frage: "Is EMS training good for your back?",
    kurz: "Back",
    beschreibung:
      "What EMS training means for your back and core, where the limits are and when you should talk to your doctor first.",
    antwort:
      "EMS training strengthens your muscles – including your back and core – without heavy weights. If you have existing complaints, please check with your doctor beforehand whether it is right for you. We are not a medical practice and do not promise any cure.",
    abschnitte: [
      {
        titel: "What happens in training",
        liste: [
          "The vest controls eight zones individually – including the upper and lower back.",
          "Your trainer puts the focus on your back and core if that is your goal.",
          "Simple exercises without weights – no extra load on your joints and spine.",
          "One session a week, 20 minutes.",
        ],
      },
      {
        titel: "Where the limits are",
        text: "EMS training is training, not therapy. With acute complaints, after operations or with conditions of the spine, talk to your doctor first – and tell us at your first appointment what applies to you.",
      },
    ],
    weiter: [
      { label: "EMS training for a strong back", href: "/ziel/ruecken" },
      { label: "Is EMS training safe?", href: "/fragen/sicherheit" },
    ],
  },
];

export function fragen(sprache: Sprache): Frage[] {
  return sprache === "en" ? FRAGEN_EN : FRAGEN;
}

export function frageIn(sprache: Sprache, slug: string): Frage | undefined {
  return fragen(sprache).find((f) => f.slug === slug);
}

/** Die englischen Kennungen der Fragen-Seiten - dieselben wie in @/lib/i18n/pfade. */
export const FRAGE_SLUG_EN: Record<string, string> = {
  kosten: "cost",
  sicherheit: "safety",
  erfahrungen: "reviews",
  ruecken: "back",
};

export function frageAusSlugEn(slug: string): string | undefined {
  return Object.keys(FRAGE_SLUG_EN).find((de) => FRAGE_SLUG_EN[de] === slug);
}

const STICHWORTE_EN: Record<string, RegExp> = {
  kosten: /cost|price|plan|membership/i,
  sicherheit: /safe|danger|pacemaker|pregnan/i,
  ruecken: /back|spine|core/i,
  erfahrungen: /experience|review|award/i,
};

/** fragenZu für englische Texte. */
export function fragenZuIn(sprache: Sprache, text: string, max = 2): Frage[] {
  if (sprache !== "en") return fragenZu(text, max);
  return FRAGEN_EN.filter((f) => STICHWORTE_EN[f.slug]?.test(text)).slice(0, max);
}
