# Aktionsplan: Sichtbarkeit bei Google, Bing und KI-Suche

Grundlage ist der SEO- und KI-Sichtbarkeits-Audit vom 30.10.2026
(https://claude.ai/artifact/TnerbzemUySbgHXmT3UWa1). Technisch ist die Seite
gut aufgestellt (robots.txt, llms.txt, strukturierte Daten). Kritisch sind zwei
Punkte. Beide brauchen etwas Code, der schon erledigt ist, und ein paar
Handgriffe, die nur du machen kannst.

Eine bestimmte Platzierung kann niemand versprechen. Die Schritte unten sorgen
dafür, dass die Suchmaschinen die Seite überhaupt kennen und die Standorte
auseinanderhalten können. Wie weit oben sie dann erscheinen, entscheiden sie
selbst.

---

## 1. Indexierung: Die Domain taucht in den Suchergebnissen nicht auf

**Befund.** In vier Testsuchen erschien koerperformen-koeln.de kein einziges
Mal. Zitiert wurden nur Verzeichnisse wie Branchenbücher und Vergleichsportale.
Solange die Suchmaschinen die Seite nicht im Index haben, hilft auch der beste
Inhalt nichts.

**Im Code erledigt.**

- `src/app/layout.tsx`: Neben dem Google-Bestätigungscode wird jetzt auch der
  Code der Bing Webmaster Tools als Meta-Tag ausgegeben
  (`BING_SITE_VERIFICATION`). Bing speist auch die Suche in ChatGPT und Copilot.
- `src/app/indexnow.txt/route.ts`: liefert den IndexNow-Schlüssel aus
  (`INDEXNOW_KEY`). Ohne Schlüssel gibt es dort nur einen 404.
- `scripts/indexnow.mjs` (`npm run indexnow`): prüft, dass die Live-Seite den
  Schlüssel kennt, liest alle Seiten aus der Sitemap und meldet sie an IndexNow.

**Deine Schritte.**

1. Google Search Console einrichten, wie in `docs/google-anleitung.md`
   beschrieben, und dort die Sitemap einreichen.
2. Bing Webmaster Tools (https://www.bing.com/webmasters) öffnen und die Website
   bestätigen. Am einfachsten über „Aus der Google Search Console importieren“.
   Alternativ die Methode „Meta-Tag“ wählen, den Wert aus `content="..."` in
   Vercel als `BING_SITE_VERIFICATION` eintragen, neu bereitstellen und dann
   bestätigen. Danach unter „Sitemaps“ `https://www.koerperformen-koeln.de/sitemap.xml`
   einreichen.
3. Einen IndexNow-Schlüssel erzeugen, zum Beispiel mit `openssl rand -hex 16`,
   in Vercel als `INDEXNOW_KEY` eintragen und neu bereitstellen.
4. Im Projektordner ausführen: `INDEXNOW_KEY=<derselbe Schlüssel> npm run indexnow`

**Daran merkst du, dass es gewirkt hat.**

- **Sofort:** Im Quelltext der Startseite stehen die Meta-Tags
  `google-site-verification` und `msvalidate.01`.
  `https://www.koerperformen-koeln.de/indexnow.txt` zeigt den Schlüssel, und das
  Skript meldet „N Seiten gemeldet (HTTP 200)“ oder „(HTTP 202)“.
- **Nach 2–7 Tagen:** In der Search Console unter „Seiten“ steigt „Indexiert“
  auf etwa 76.
- **Nach 2–4 Wochen:** Die Suche `site:koerperformen-koeln.de` liefert Treffer,
  und unter „Leistung“ erscheinen erste Suchbegriffe.

---

## 2. Studio-Texte: Die 14 Standortseiten sind fast identisch

**Befund.** Die 14 Standortseiten stimmen zu 94 % überein. Sie unterscheiden
sich nur in Adresse und Öffnungszeiten. Die Testsuche „EMS Studio Köln Nippes“
ergab kein Körperformen-Studio. Die Felder für eigene Texte (`intro` und
`anfahrt`) gibt es im Code bereits, live sind sie aber bei allen Studios leer.

**Im Code erledigt.**

- `src/app/admin/(dashboard)/studios/page.tsx`: Oben im Adminbereich unter
  „Studios“ steht jetzt ein gelber Hinweis mit den Namen aller Studios, bei denen
  „Text über diesen Standort“ oder „Anfahrt“ fehlt. Vorher sah man die Lücke nur,
  wenn man jedes Studio einzeln aufklappte.

**Deine Schritte.**

1. Im Adminbereich unter „Studios“ jedes Studio aufklappen und beide Felder mit
   echten Angaben füllen, die nur für diesen Standort stimmen: nächste
   Haltestelle, Parkmöglichkeiten, wo genau der Eingang ist, eine Besonderheit
   des Studios oder des Viertels. Zwei, drei Sätze je Feld genügen.
2. Danach `npm run indexnow` erneut ausführen (mit `INDEXNOW_KEY` wie oben),
   damit die geänderten Seiten neu abgerufen werden.

**Daran merkst du, dass es gewirkt hat.**

- **Sofort:** Der gelbe Hinweis im Adminbereich verschwindet, und jede
  Studio-Seite hat eine eigene Meta-Description.
- **Nach 1–3 Wochen:** In der Search Console erscheinen Suchbegriffe mit
  Stadtteil (etwa „EMS Nippes“), und unter „Seiten“ steht keine Studio-Seite
  mehr als „Duplikat“.

---

## Nächste Prüfung

Am **30.11.2026** dieselben Testsuchen wiederholen und die Zahlen aus der
Search Console und den Bing Webmaster Tools mit den Erwartungen oben vergleichen.
