import { prisma } from "@/lib/prisma";

/**
 * Ein- und ausschaltbare Bereiche der Website.
 *
 * Gedacht für Inhalte, die noch nicht fertig sind: Sie lassen sich im
 * Adminbereich ausblenden, statt dass jemand Code ändern muss. Ein
 * ausgeblendeter Bereich verschwindet überall - im Menü, in der Suche und
 * in der Sitemap - und die zugehörige Seite antwortet mit 404.
 *
 * Neuen Bereich anlegen: hier einen Eintrag ergänzen. Ein Datenbankeintrag
 * entsteht erst beim ersten Speichern; bis dahin gilt der Standardwert.
 */
export type ToggleKey =
  | "ueber-uns"
  | "erfolgsgeschichten"
  | "blog"
  | "studio"
  | "preise"
  | "google-bewertungen"
  | "newsletter"
  | "kommentare";

export const toggleDefinitions: {
  key: ToggleKey;
  label: string;
  description: string;
  /** Wenn der Bereich eine eigene Seite hat: deren Adresse. */
  href?: string;
  defaultVisible: boolean;
}[] = [
  {
    key: "ueber-uns",
    label: "Über uns",
    description: "Die Seite über euch und das Team, samt Eintrag im Menü.",
    href: "/ueber-uns",
    defaultVisible: true,
  },
  {
    key: "erfolgsgeschichten",
    label: "Erfolgsgeschichten",
    description:
      "Die Seite mit den Kundenstimmen und der Bereich dazu auf der Startseite. Solange dort Platzhalter stehen, besser ausblenden.",
    href: "/erfolgsgeschichten",
    defaultVisible: true,
  },
  {
    key: "blog",
    label: "Blog",
    description: "Die Blogübersicht, die Beiträge und der Bereich auf der Startseite.",
    href: "/blog",
    defaultVisible: true,
  },
  {
    key: "studio",
    label: "Studio-Seite",
    description: "Die Übersicht aller Standorte mit Adressen und Öffnungszeiten.",
    href: "/studio",
    defaultVisible: true,
  },
  {
    key: "preise",
    label: "Preise",
    description: "Die Seite zu den Konditionen.",
    href: "/preise",
    defaultVisible: true,
  },
  {
    key: "google-bewertungen",
    label: "Google-Bewertungen",
    description:
      "Der Bewertungshinweis. Erscheint ohnehin erst, wenn echte Zahlen hinterlegt sind.",
    defaultVisible: true,
  },
  {
    key: "newsletter",
    label: "Newsletter-Anmeldung",
    description: "Das Anmeldefeld im Fußbereich der Seite.",
    defaultVisible: true,
  },
  {
    key: "kommentare",
    label: "Kommentare im Blog",
    description:
      "Kommentarformular und Kommentarliste unter den Beiträgen. Ausgeblendet bleiben bereits vorhandene Kommentare erhalten.",
    defaultVisible: true,
  },
];

export type Toggles = Record<ToggleKey, boolean>;

function defaults(): Toggles {
  return Object.fromEntries(
    toggleDefinitions.map((entry) => [entry.key, entry.defaultVisible]),
  ) as Toggles;
}

/**
 * Liest alle Schalter. Fehlt ein Eintrag in der Datenbank, gilt der
 * Standardwert - die Seite funktioniert also auch ohne jede gespeicherte
 * Einstellung.
 */
export async function getToggles(): Promise<Toggles> {
  const result = defaults();

  try {
    const rows = await prisma.siteToggle.findMany();
    for (const row of rows) {
      if (row.key in result) result[row.key as ToggleKey] = row.visible;
    }
  } catch {
    // Ist die Tabelle noch nicht angelegt, bleibt es bei den Standardwerten,
    // statt dass die ganze Seite ausfällt.
  }

  return result;
}

export async function isVisible(key: ToggleKey): Promise<boolean> {
  return (await getToggles())[key];
}
