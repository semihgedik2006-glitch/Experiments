import { ExternalLink, Star } from "lucide-react";
import { Container } from "@/components/ui/container";
import { googleBewertungen } from "@/lib/google-bewertungen";
import type { Sprache } from "@/lib/sprache";

/**
 * Sterne und die neuesten Bewertungen von Google - echte Daten, auf dem
 * Server geholt (@/lib/google-bewertungen). Gibt es keine, erscheint der
 * Abschnitt nicht: lieber nichts als etwas Erfundenes.
 *
 * Google verlangt, dass Herkunft und Verfasser erkennbar sind - deshalb
 * der Hinweis "Bewertungen von Google", die Namen der Verfasser (mit Link
 * auf ihr Profil, sofern Google einen liefert) und der Weg zu allen
 * Bewertungen auf Google.
 */
export async function GoogleBewertungenAbschnitt({
  placeId,
  ort,
  sprache,
}: {
  placeId: string | null;
  ort: string;
  sprache: Sprache;
}) {
  const daten = await googleBewertungen(placeId, sprache);
  if (!daten) return null;
  const en = sprache === "en";
  const note = daten.sterne.toLocaleString(en ? "en-GB" : "de-DE", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  return (
    <section className="border-t border-border py-16 sm:py-20">
      <Container>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {en ? `What people say about ${ort}` : `Was andere über ${ort} sagen`}
        </h2>
        <p className="mt-3 flex flex-wrap items-center gap-2 text-muted">
          <Sterne wert={daten.sterne} />
          <span>
            <strong className="text-foreground">{note}</strong> {en ? "out of 5" : "von 5"} &middot;{" "}
            {daten.anzahl.toLocaleString(en ? "en-GB" : "de-DE")}{" "}
            {en ? "Google reviews" : "Google-Bewertungen"}
          </span>
        </p>

        {daten.bewertungen.length > 0 && (
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {daten.bewertungen.map((b, i) => (
              <li key={i} className="flex flex-col rounded-2xl border border-border bg-surface p-5">
                <Sterne wert={b.sterne} klein />
                <p className="mt-3 line-clamp-6 flex-1 text-sm leading-relaxed">{b.text}</p>
                <p className="mt-4 text-xs text-muted">
                  {b.autorLink ? (
                    <a href={b.autorLink} target="_blank" rel="noopener noreferrer nofollow" className="font-semibold text-foreground hover:underline">
                      {b.autor}
                    </a>
                  ) : (
                    <span className="font-semibold text-foreground">{b.autor}</span>
                  )}
                  {b.wann ? ` · ${b.wann}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
          <span>{en ? "Reviews from Google" : "Bewertungen von Google"}</span>
          {daten.link && (
            <a
              href={daten.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-accent hover:underline"
            >
              {en ? "All reviews on Google" : "Alle Bewertungen auf Google"}
              <ExternalLink size={12} aria-hidden />
            </a>
          )}
        </p>
      </Container>
    </section>
  );
}

function Sterne({ wert, klein = false }: { wert: number; klein?: boolean }) {
  const groesse = klein ? 14 : 18;
  return (
    <span className="inline-flex" role="img" aria-label={`${wert.toFixed(1)} / 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={groesse}
          aria-hidden
          className={n <= Math.round(wert) ? "fill-lime text-lime" : "text-border"}
        />
      ))}
    </span>
  );
}
