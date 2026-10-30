import { MehrDazu } from "@/components/ui/mehr-dazu";
import { ablaufEinheit, gegenanzeigen } from "@/lib/ablauf";
import type { Sprache } from "@/lib/sprache";

/**
 * Was beim ersten Termin passiert und wann EMS nicht geeignet ist - unter
 * jedem Buchungsformular (Probetermin und Zielseiten), damit es dort steht,
 * wo die Entscheidung fällt.
 */
export function TerminHinweise({ sprache = "de" }: { sprache?: Sprache }) {
  const en = sprache === "en";
  // Zwei Auskünfte, die bisher nur auf /ems-training standen -
  // also eine Seite weiter, als sie gebraucht werden. Wer einen
  // Herzschrittmacher trägt, soll das vor dem Absenden lesen und
  // nicht danach. Aufgeklappt statt ausgeschrieben, damit die
  // Seite nicht länger wird als das Formular darauf.
  return (
    <div className="mt-8 space-y-2">
      <MehrDazu titel={en ? "What happens at your first appointment" : "Was beim ersten Termin passiert"}>
        <ol className="space-y-2">
          {ablaufEinheit(sprache).map((schritt) => (
            <li key={schritt.step}>
              <span className="font-semibold text-foreground">{schritt.step}</span>
              <span className="text-muted"> · {schritt.duration}</span>
              <br />
              {schritt.text}
            </li>
          ))}
        </ol>
      </MehrDazu>

      <MehrDazu titel={en ? "When EMS is not suitable" : "Wann EMS nicht geeignet ist"}>
        <p>
          {en
            ? "In these cases we do not offer EMS training at all:"
            : "In diesen Fällen verzichten wir grundsätzlich auf EMS-Training:"}
        </p>
        <ul className="list-disc space-y-1 pl-5">
          {gegenanzeigen(sprache).map((fall) => (
            <li key={fall}>{fall}</li>
          ))}
        </ul>
        <p>
          {en
            ? "We deliberately do not ask about this here – information about your health does not belong in an online form. Talk to us about it at your appointment or call beforehand; if in doubt, check briefly with your doctor."
            : "Wir fragen das hier bewusst nicht ab – Angaben zu deiner Gesundheit gehören nicht in ein Formular im Netz. Besprich es beim Termin oder ruf vorher an; im Zweifel sprich kurz mit deinem Arzt."}
        </p>
      </MehrDazu>
    </div>
  );
}
