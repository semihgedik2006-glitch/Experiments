/**
 * Weiche Überblendung beim Seitenwechsel.
 *
 * Läuft bewusst über CSS statt über Motion. Über Motion gesteuert lieferte
 * der Server jede Seite mit opacity 0 aus - der gesamte Inhalt war also
 * unsichtbar, bis das JavaScript geladen und ausgeführt war. Auf einem
 * langsamen Mobilgerät waren das rund zweieinhalb Sekunden leere Seite, und
 * genau so lange wertete Google den Inhalt als nicht dargestellt.
 *
 * Next hängt dieses Template bei jedem Seitenwechsel neu ein, deshalb
 * startet die CSS-Animation von allein neu - es braucht dafür kein
 * JavaScript und keine Client-Komponente.
 *
 * Nur die Deckkraft wird bewegt: Ein Transform würde diesen Rahmen zum
 * Bezugssystem machen und fest positionierte Kinder wie das Suchfenster
 * zerlegen.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-fade">{children}</div>;
}
