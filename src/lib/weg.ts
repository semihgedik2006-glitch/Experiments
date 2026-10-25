/**
 * Der Weg durch die Website - vier Stationen.
 *
 * Vorher standen acht Seiten gleichrangig im Menü, und wer neu war, musste
 * selbst herausfinden, in welcher Reihenfolge sie Sinn ergeben. Die vier
 * Stationen sind diese Reihenfolge: erst verstehen, was EMS ist, dann
 * sehen, wie der erste Besuch abläuft, dann Studio und Mitgliedschaft
 * wählen - und danach dranbleiben.
 *
 * Jede Seite gehört zu genau einer Station. Am Seitenende zeigt die
 * Weg-Leiste (components/weg-leiste.tsx), wo man steht und wohin es
 * weitergeht.
 */

export type StationsSchluessel = "verstehen" | "erleben" | "entscheiden" | "dabeibleiben";

export type Station = {
  schluessel: StationsSchluessel;
  name: string;
  frage: string;
  /** Die Hauptseite der Station - dorthin führt "Weiter". */
  href: string;
  /** Weitere Seiten derselben Station. */
  auch?: { label: string; href: string }[];
};

export const STATIONEN: Station[] = [
  {
    schluessel: "verstehen",
    name: "Verstehen",
    frage: "Was ist EMS-Training?",
    href: "/ems-training",
  },
  {
    schluessel: "erleben",
    name: "Erleben",
    frage: "Wie läuft mein erster Besuch ab?",
    href: "/erster-besuch",
  },
  {
    schluessel: "entscheiden",
    name: "Entscheiden",
    frage: "Welches Studio, welche Mitgliedschaft?",
    href: "/studio",
    auch: [{ label: "Preise", href: "/preise" }],
  },
  {
    schluessel: "dabeibleiben",
    name: "Dabeibleiben",
    frage: "Tipps, Wissen und Einblicke",
    href: "/blog",
    auch: [{ label: "Socials", href: "/socials" }],
  },
];

export const STATIONEN_EN: Station[] = [
  { schluessel: "verstehen", name: "Understand", frage: "What is EMS training?", href: "/ems-training" },
  { schluessel: "erleben", name: "Experience", frage: "How does my first visit work?", href: "/erster-besuch" },
  {
    schluessel: "entscheiden",
    name: "Decide",
    frage: "Which studio, which membership?",
    href: "/studio",
    auch: [{ label: "Prices", href: "/preise" }],
  },
  {
    schluessel: "dabeibleiben",
    name: "Keep going",
    frage: "Tips, knowledge and insights",
    href: "/blog",
    auch: [{ label: "Socials", href: "/socials" }],
  },
];

export function stationen(sprache: "de" | "en"): Station[] {
  return sprache === "en" ? STATIONEN_EN : STATIONEN;
}
