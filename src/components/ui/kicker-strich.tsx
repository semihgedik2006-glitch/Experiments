/**
 * Der kurze Strich vor jeder Abschnittsüberschrift. Er wächst von links
 * nach rechts, sobald der Abschnitt ins Bild kommt - gesteuert über den
 * EinblendWaechter und CSS (globals.css, "Einblenden").
 */
export function KickerStrich() {
  return <span aria-hidden data-einblenden="strich" className="h-px w-8 origin-left bg-accent/50" />;
}
