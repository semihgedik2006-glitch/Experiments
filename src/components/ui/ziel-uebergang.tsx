import { ViewTransition, type ReactNode } from "react";

/**
 * Das Ziel-Motiv gleitet beim Seitenwechsel an seinen neuen Platz.
 *
 * Wer auf der Startseite "Mehr zu Rücken" anklickt, sieht das Motiv aus
 * der Karte in den Kopf der Zielseite wandern - statt dass eine Seite
 * verschwindet und eine andere erscheint. Zwischen zwei Zielseiten
 * ("Anderes Ziel?") geht das eine Motiv ins andere über.
 *
 * Der Name darf auf einer Seite nur einmal vorkommen, sonst bricht der
 * Browser den Übergang ab - deshalb `an`: Die Zielkarte trägt ihn nur auf
 * der Startseite, auf den Zielseiten trägt ihn der Kopf.
 *
 * Bei "Bewegung reduzieren" schaltet globals.css die Animation ab.
 */
export function ZielUebergang({ an = true, children }: { an?: boolean; children: ReactNode }) {
  if (!an) return <>{children}</>;
  return <ViewTransition name="ziel-motiv">{children}</ViewTransition>;
}
