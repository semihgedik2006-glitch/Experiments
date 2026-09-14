import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Ein Aufklapper für das, was nicht jeder lesen muss.
 *
 * Der Anlass: Unter fast jedem Abschnitt stand ein erklärender Halbsatz,
 * der niemandem gehörte. Er beantwortete keine Frage, die jemand hatte -
 * er rechtfertigte, was darüber stand. In Summe las sich die Seite, als
 * müsste sie sich dauernd erklären.
 *
 * Die Erklärungen sind trotzdem richtig und für manche wichtig. Sie
 * stehen deshalb weiterhin da, nur eine Ebene tiefer: Wer sie sucht,
 * findet sie in einem Satz; wer sie nicht sucht, liest sie nicht.
 *
 * Bewusst <details> und kein eigener Aufklapper: Der Browser bringt
 * Tastaturbedienung, Vorlesen und die Suchfunktion (Strg+F findet auch
 * zugeklappten Text) von Haus aus mit. Ohne JavaScript funktioniert er
 * ebenfalls - und er ist im ausgelieferten HTML enthalten, also auch für
 * Suchmaschinen lesbar.
 */
export function MehrDazu({
  titel = "Mehr dazu",
  children,
  className = "",
  ton = "hell",
  zentriert = false,
}: {
  titel?: string;
  children: ReactNode;
  className?: string;
  /** "dunkel" für Abschnitte auf dunklem Grund (.on-ink). */
  ton?: "hell" | "dunkel";
  /**
   * Für mittig gesetzte Abschnitte.
   *
   * Ohne das springt der Aufklapper beim Öffnen: Zugeklappt ist das
   * <details> so breit wie seine Zeile und steht damit mittig, aufgeklappt
   * so breit wie sein Inhalt - die Zeile rutscht also nach links, sobald
   * jemand klickt. Mit fester Breite bleibt sie, wo sie war.
   */
  zentriert?: boolean;
}) {
  return (
    <details className={`mehr-dazu group ${zentriert ? "w-full max-w-xl text-left" : ""} ${className}`}>
      <summary
        className={`tastflaeche flex cursor-pointer list-none items-center gap-1.5 rounded-full px-3 py-2 text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
          zentriert ? "justify-center" : "inline-flex"
        }`}
      >
        {titel}
        <ChevronDown
          size={15}
          aria-hidden
          className="transition-transform duration-200 group-open:rotate-180"
        />
      </summary>
      <div
        // border-border war auf heller Fläche #e7e4da - gemessen kaum von
        // Weiß zu unterscheiden, die Linie las sich als Lücke. Der
        // Markenton ist auf beiden Flächen zu sehen und ordnet den Block
        // dem zu, was darüber steht.
        className={`lesebreite mt-3 space-y-3 border-l-2 pl-4 text-sm leading-relaxed text-muted ${
          ton === "dunkel" ? "border-lime/30" : "border-lime/50"
        }`}
      >
        {children}
      </div>
    </details>
  );
}

/**
 * Eine Zeile im Aufklapper: Begriff und Herkunft.
 *
 * Getrennt vom Fließtext, weil eine Angabe zur Herkunft einer Zahl keine
 * Erzählung ist, sondern eine Auskunft - und Auskünfte liest man schneller
 * in einer Liste als in einem Absatz.
 */
export function Herkunft({ begriff, children }: { begriff: string; children: ReactNode }) {
  return (
    <div>
      <dt className="font-semibold text-foreground">{begriff}</dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
  );
}
