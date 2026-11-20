import type { CSSProperties, ReactNode } from "react";

/**
 * Einblenden beim Hinscrollen - ohne JavaScript im ersten Bild.
 *
 * Früher steuerte Motion das: Der Server lieferte jeden Abschnitt mit
 * opacity 0 aus, sichtbar wurde er erst nach der Hydration. Auf einem
 * langsamen Handy stand der erste Bildschirm so bis zu drei Sekunden halb
 * leer, und Google maß die Ladezeit (LCP) erst ab dann.
 *
 * Jetzt kommt alles sichtbar vom Server. Der EinblendWaechter
 * (components/einblend-waechter.tsx) versteckt nach dem Laden nur, was
 * unterhalb des Bildschirms liegt, und blendet es beim Hinscrollen per CSS
 * ein (globals.css, "Einblenden"). Was beim Laden schon im Bild ist, bleibt
 * einfach stehen.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      data-einblenden="block"
      className={className}
      style={delay ? ({ "--einblend-verzug": `${delay}s` } as CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}

/** Gruppe, deren Kinder (StaggerItem) nacheinander einblenden. */
export function Stagger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div data-einblenden="gruppe" className={className}>
      {children}
    </div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`einblenden-kind ${className ?? ""}`}>{children}</div>;
}
