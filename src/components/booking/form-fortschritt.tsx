import { Check } from "lucide-react";

/**
 * Drei Striche über dem Anfrageformular: Wann - Deine Daten - Erreichbarkeit.
 *
 * Das Formular ist auf dem Handy zwei Bildschirme lang. Wer unten ankommt,
 * soll sehen, dass er fast fertig ist - und wer oben anfängt, dass es nur
 * drei Schritte sind. Ein Strich füllt sich, sobald sein Teil ausgefüllt
 * ist; die Reihenfolge ist dabei egal, man darf springen.
 *
 * Nur transform (scaleX) wird animiert, und bei "Bewegung reduzieren"
 * steht der Strich sofort voll da.
 */
export function FormFortschritt({
  schritte,
  en,
}: {
  schritte: { label: string; fertig: boolean }[];
  en: boolean;
}) {
  const erledigt = schritte.filter((s) => s.fertig).length;
  return (
    <div>
      <ol className="grid grid-cols-3 gap-2" aria-label={en ? "Progress" : "Fortschritt"}>
        {schritte.map((schritt, i) => (
          <li key={schritt.label} className="min-w-0">
            <span className="block h-1.5 overflow-hidden rounded-full bg-border">
              <span
                className={`block h-full origin-left rounded-full bg-lime motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out ${
                  schritt.fertig ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </span>
            <span
              className={`mt-1.5 flex items-center gap-1 truncate text-[11px] font-medium ${
                schritt.fertig ? "text-accent" : "text-muted"
              }`}
            >
              {schritt.fertig ? <Check size={12} strokeWidth={3} aria-hidden /> : <span aria-hidden>{i + 1}.</span>}
              <span className="truncate">{schritt.label}</span>
              <span className="sr-only">{schritt.fertig ? (en ? " – done" : " – erledigt") : (en ? " – open" : " – offen")}</span>
            </span>
          </li>
        ))}
      </ol>
      {/* Für Vorleseprogramme: Der Stand in einem Satz, angesagt bei jeder
          Änderung - aber höflich, ohne das Tippen zu unterbrechen. */}
      <p className="sr-only" aria-live="polite">
        {en ? `${erledigt} of ${schritte.length} steps done` : `${erledigt} von ${schritte.length} Schritten erledigt`}
      </p>
    </div>
  );
}
