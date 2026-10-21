import { MehrDazu } from "@/components/ui/mehr-dazu";
import { ABLAUF_EINHEIT, GEGENANZEIGEN } from "@/lib/ablauf";

/**
 * Was beim ersten Termin passiert und wann EMS nicht geeignet ist - unter
 * jedem Buchungsformular (Probetermin und Zielseiten), damit es dort steht,
 * wo die Entscheidung fällt.
 */
export function TerminHinweise() {
  // Zwei Auskünfte, die bisher nur auf /ems-training standen -
  // also eine Seite weiter, als sie gebraucht werden. Wer einen
  // Herzschrittmacher trägt, soll das vor dem Absenden lesen und
  // nicht danach. Aufgeklappt statt ausgeschrieben, damit die
  // Seite nicht länger wird als das Formular darauf.
  return (
    <div className="mt-8 space-y-2">
      <MehrDazu titel="Was beim ersten Termin passiert">
        <ol className="space-y-2">
          {ABLAUF_EINHEIT.map((schritt) => (
            <li key={schritt.step}>
              <span className="font-semibold text-foreground">{schritt.step}</span>
              <span className="text-muted"> · {schritt.duration}</span>
              <br />
              {schritt.text}
            </li>
          ))}
        </ol>
      </MehrDazu>

      <MehrDazu titel="Wann EMS nicht geeignet ist">
        <p>
          In diesen Fällen verzichten wir grundsätzlich auf EMS-Training:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          {GEGENANZEIGEN.map((fall) => (
            <li key={fall}>{fall}</li>
          ))}
        </ul>
        <p>
          Wir fragen das hier bewusst nicht ab &ndash; Angaben zu deiner
          Gesundheit gehören nicht in ein Formular im Netz. Besprich es beim
          Termin oder ruf vorher an; im Zweifel sprich kurz mit deinem Arzt.
        </p>
      </MehrDazu>
    </div>
  );
}
