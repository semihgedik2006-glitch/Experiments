import Link from "@/components/sprach-link";

/**
 * Der Hinweis über den englischen Rechtstexten.
 *
 * Impressum, Datenschutzerklärung und AGB gibt es auf Englisch zum Lesen.
 * Verbindlich ist die deutsche Fassung - weicht eine Übersetzung ab, gilt
 * das Original. Das steht ganz oben, damit es niemand übersieht, und
 * verlinkt direkt auf die deutsche Seite.
 */
export function VerbindlichHinweis({ dePfad }: { dePfad: string }) {
  return (
    <p className="rounded-2xl border border-lime/40 bg-lime/5 px-5 py-4 text-sm leading-relaxed text-foreground/85">
      This English version is provided for your convenience. Only the German version is legally binding;
      if the two differ, the German text applies.{" "}
      <Link href={dePfad} sprache="de" hrefLang="de" className="font-semibold text-accent underline underline-offset-2">
        Read the German version
      </Link>
      .
    </p>
  );
}
