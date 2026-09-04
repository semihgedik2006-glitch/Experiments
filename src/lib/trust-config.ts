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
    title: "Immer 1:1 betreut",
    text: "Kein Training auf eigene Faust. Bei jeder Einheit steht ein Trainer neben dir und stellt die Intensität ein.",
  },
  {
    icon: "shield" as const,
    title: "Kein Abo beim Probetraining",
    text: "Das Probetraining ist kostenlos und endet mit dem Termin. Es entsteht keine Mitgliedschaft und keine Kündigungsfrist.",
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
