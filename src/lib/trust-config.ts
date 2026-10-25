/**
 * Vertrauensbeweise.
 *
 * WICHTIG: Hier stehen ausschließlich Angaben, die nachweislich stimmen.
 * Erfundene Bewertungen, Mitgliederzahlen oder Sterne sind nach § 5b Abs. 3
 * UWG unzulässig und abmahnfähig - deshalb ist alles, was echte Daten
 * braucht, auf null gesetzt und wird schlicht nicht angezeigt, solange es
 * nicht ausgefüllt ist. Die Seite bleibt dadurch immer korrekt.
 */

/** Sterne-Bewertung aus dem Google-Unternehmensprofil. */
export type GoogleReviews = {
  /** Durchschnitt, z.B. 4.9 */
  rating: number;
  /** Anzahl abgegebener Bewertungen. */
  count: number;
  /** Link zum Profil, damit sich jeder selbst überzeugen kann. */
  url: string;
};

/**
 * Ausfüllen, sobald das Google-Unternehmensprofil steht:
 *
 *   export const googleReviews: GoogleReviews | null = {
 *     rating: 4.9,
 *     count: 87,
 *     url: "https://g.page/r/...",
 *   };
 *
 * Solange hier null steht, erscheint der Bewertungshinweis nirgends.
 */
export const googleReviews: GoogleReviews | null = null;

/**
 * Kennzahlen des Studios. Jeder Wert ist einzeln abschaltbar (null), damit
 * niemand gezwungen ist, eine Zahl zu erfinden, nur damit das Raster
 * aufgeht. Angezeigt wird nur, was gesetzt ist.
 */
export const studioFacts: { value: string; label: string }[] = [
  // Beispiel, sobald bekannt:
  // { value: "seit 2019", label: "in Hürth für dich da" },
  // { value: "400+", label: "betreute Mitglieder" },
];

/**
 * Zusagen, die unabhängig von Zahlen gelten und an anderer Stelle der Seite
 * ohnehin schon zugesichert werden. Sie sind der eigentliche Kern: keine
 * Behauptung über andere, sondern eine Selbstverpflichtung.
 */
export const trustPoints = [
  {
    icon: "user" as const,
    title: "Immer persönlich betreut",
    text: "Kein Training auf eigene Faust. Bei jeder Einheit steht ein Trainer neben dir und stellt die Intensität ein.",
  },
  {
    icon: "shield" as const,
    title: "Erst testen, dann entscheiden",
    text: "Das Probetraining ist kostenlos. Danach zeigt dir dein Trainer, welche Mitgliedschaft zu deinem Ziel passt.",
  },
  {
    icon: "file" as const,
    title: "Angebot schriftlich",
    text: "Preise bekommst du schwarz auf weiß mit nach Hause - ohne Entscheidungsdruck an Ort und Stelle.",
  },
  {
    icon: "lock" as const,
    title: "Deine Daten bleiben bei uns",
    // Formulierung bewusst eng an der Datenschutzerklärung: Die Datenbank
    // liegt in Frankfurt, das Hosting jedoch bei einem US-Anbieter. Ein
    // pauschales "alles bleibt in der EU" wäre deshalb falsch.
    text: "Terminanfragen speichern wir in einem Rechenzentrum in Frankfurt und geben sie nicht an Dritte weiter.",
  },
];

export const trustPointsEn: typeof trustPoints = [
  {
    icon: "user",
    title: "Always personally supervised",
    text: "No training on your own. In every session a trainer stands next to you and sets the intensity.",
  },
  {
    icon: "shield",
    title: "Try first, then decide",
    text: "The trial session is free. Afterwards your trainer shows you which membership suits your goal.",
  },
  {
    icon: "file",
    title: "Offer in writing",
    text: "You take the prices home in black and white - no pressure to decide on the spot.",
  },
  {
    icon: "lock",
    title: "Your data stays with us",
    text: "We store appointment requests in a data centre in Frankfurt and do not pass them on to third parties.",
  },
];

export function trustPointsIn(sprache: "de" | "en") {
  return sprache === "en" ? trustPointsEn : trustPoints;
}
