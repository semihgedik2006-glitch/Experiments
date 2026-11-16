---
name: design-pruefung
description: Pflicht vor jedem PR, der auf der Webseite etwas Sichtbares ändert. Screenshots in allen Breiten, Messung von Kontrast, Trefferflächen, Überlappung, Barrierefreiheit und kaputten Links. Auslöser: Design, Layout, CSS, Knopf, Farbe, Abstand, „sieht komisch aus“.
---

# Design-Prüfung

1. `npm run dev` starten.
2. Vorher: `node tools/design-pruefung.mjs http://localhost:3000/<seite> --breiten 320,390,820,1280,1440,1920 --aus /tmp/dp-vorher --nur-bericht`
3. Ändern.
4. Nachher: `node tools/design-pruefung.mjs http://localhost:3000/<seite> --breiten 320,390,820,1280,1440,1920 --aus /tmp/dp` (Exit-Code 1 heißt Fehler). Bei zweisprachigen Seiten auch die `/en/`-Fassung.
5. Screenshots selbst ansehen (mindestens 390 und 1440): Hierarchie, Ausrichtung, gleiche Ecken und Abstände je Ebene, Zustände (Hover, Fokus, leer, Fehler, Laden), am Rechner keine einzelne Spalte über 1.200 px.
6. Tabelle aus `bericht.md` und je Breite ein Satz zu den Screenshots in die PR-Beschreibung. Neue Fehler gegenüber vorher: nicht mergen.

Gemessen: waagerechter Überlauf, Trefferflächen (Handy und Tablet 44 × 44 px, Rechner 24 × 24 px, Mitte nicht verdeckt), Kontrast 4,5 : 1 (große Schrift 3 : 1, auf Bild und Verlauf an Bildpunkten), Text ragt aus Knopf oder Kasten, lang, Zoom, Namen, Labels, alt, Überschriften, Fokus-Stil, Konsolenfehler, 4xx/5xx, Abstände außerhalb des 2-px-Rasters.

Seiten mit Scroll-Animationen mit `--ruhig` prüfen: das Skript scrollt einmal durch und wartet, bis alles stillsteht.

Externe Dienste (Google, Vercel-Analytics) fallen in dieser Umgebung oft aus und erscheinen als Warnung, nicht als Fehler. Gewollte Meldungen über `--vorher datei.mjs` mit `export const erlaubt = [/…/]` ausnehmen.

Selbsttest: `node tools/design-pruefung.mjs --selbsttest`.
