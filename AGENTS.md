<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Körperformen – Projektanleitung für KI-Agenten (Codex, Claude & Co.)

Diese Datei liest jeder Agent zuerst. Sie gilt für alle, die an diesem Repo
arbeiten – Semih, Marcel und ihre Assistenten. Antworten an Menschen bitte
**auf Deutsch, in einfacher Sprache** (beide sind keine Entwickler).

## Was das ist

Die Website von **Körperformen EMS** – 14 Studios in Köln und Umgebung.
Live unter **https://www.koerperformen-koeln.de** (auch ems-training.koeln).

- Next.js 16 (App Router, Turbopack), React, Tailwind, TypeScript
- Prisma 7 mit Postgres bei **Neon**
- Gehostet bei **Vercel** (Team „koerperformen“, Projekt „experiments“)
- E-Mails über **Resend**, Absender `termine@koerperformen-koeln.de`
- Deutsche Seite unter `/`, englische Seite unter `/en` (gleiche Inhalte)

## Branches und Ablauf – WICHTIG

- **Produktion** ist der Branch `claude/website-creation-questions-d6i07i`.
  Jeder Merge dorthin geht automatisch bei Vercel live.
- Nie direkt auf den Produktions-Branch pushen. Immer: eigener Branch →
  Pull Request (als Entwurf) → Vercel baut eine Vorschau → erst mergen,
  wenn Semih oder Marcel ausdrücklich „merge“ sagt.
- Nach einem Merge: prüfen, dass der Vercel-Build „Ready“ ist. Schlägt er
  mit `P1001 Can't reach database` fehl, war Neon kurz nicht erreichbar –
  einmal neu bauen, dann klappt es meist.

## Datenbank – Vorsicht

- **Vorschau und Produktion teilen sich dieselbe Datenbank.** Der Build
  führt `prisma migrate deploy` aus – eine Migration in einem PR läuft also
  schon beim Bauen der Vorschau auf den echten Daten.
- Migrationen deshalb nur **hinzufügend** schreiben (neue Spalten/Tabellen,
  `ADD VALUE IF NOT EXISTS`), nie Spalten löschen oder umbenennen, Updates
  nur mit Bedingung (`WHERE ... IS NULL`).
- Lokal **nicht** gegen die Produktionsdatenbank entwickeln. Für eigene
  Tests bei Neon einen Branch der Datenbank anlegen und dessen URL in die
  eigene `.env` schreiben (Vorlage: `.env.example`).

## Datenbank-Verbrauch (Neon) – seit dem Ausfall am 25.11.2026

Neon rechnet nach Laufzeit ab, und die Datenbank schläft erst nach fünf
Minuten Ruhe ein. Alles, was regelmäßig abfragt, hält sie wach. Im
November 2026 war so das Kontingent aufgebraucht, die Formulare fielen aus.

- Öffentliche Seiten erneuern sich einmal am Tag (`revalidate` in
  `src/app/layout.tsx`) und sofort bei Änderungen (`revalidatePath`).
  Keine kurzen Fristen einbauen, kein Abruf im Minutentakt von außen.
- Der morgendliche Lauf `api/cron/generate-slots` erneuert alle Seiten in
  einem Rutsch (`src/lib/aufwaermen.ts`).
- Fällt die Datenbank aus, gehen Probetermin-Anfragen und
  Kontaktnachrichten per Mail an `TEAM_EMAIL` und die Kopie-Empfänger
  (`src/lib/notweg.ts`, Betreff beginnt mit „NOTWEG“). Diese Anfragen
  stehen dann nicht im Adminbereich.
- Schalter und Texte fallen nur noch bei fehlender Tabelle auf
  Standardwerte zurück, nicht bei einem Ausfall – sonst würden
  ausgeblendete Bereiche sichtbar.

## Geheimnisse

- Keine Schlüssel, Passwörter oder API-Keys ins Repo schreiben. Sie stehen
  bei Vercel (Settings → Environment Variables) oder im Adminbereich.
- Der LogX-Schlüssel steht nur im Adminbereich je Studio.
- **LogX / miha bodytec API:** niemals `POST /book` gegen die echte API
  aufrufen – das legt echte Termine an. Nur lesende GET-Aufrufe, sparsam.

## Inhaltliche Regeln (vom Team so gewünscht)

- Keine Vergleiche mit Fitnessstudios.
- Keine Gesundheits- oder Heilversprechen.
- Nur echte Fotos (Studios, Team) – keine Stockbilder von Fremden.
- Beim Probetermin bleibt es bei **Wunschzeiten** (Kunde nennt Tage und
  Tageszeit, das Studio ruft zurück).
- Keine Preise auf der Gutscheinseite außer der Weihnachtsaktion.
- Fakten über Studios (Parkplätze, Haltestellen …) nie erfinden.

## Vor jedem PR

- `npx tsc --noEmit`, `npm run lint`, `npm test`
- Bei sichtbaren Änderungen: Skill `.claude/skills/design-pruefung/SKILL.md`
  (`node tools/design-pruefung.mjs <url> --breiten 320,390,820,1280,1440,1920`).
  Neue Fehler gegenüber vorher: nicht mergen.
- Texte immer auch auf Englisch nachziehen (`/en`).

## Wo was liegt

- Seiten: `src/app/(site)/…` (deutsch), `src/app/(en)/en/…` (englisch),
  der eigentliche Inhalt in `src/components/seiten/*.tsx`
- Adminbereich: `src/app/admin/(dashboard)/…` – Anfragen, Studios, Trainer,
  E-Mail-Versand, Nachrichten, Sichtbarkeit (Schalter für Seitenteile),
  Aktionen (Aktionscodes), Auswertung, Startklar (To-do-Liste fürs Team)
- Server-Aktionen: `src/lib/actions/*.ts`
- E-Mails: `src/lib/email.ts` (jeder Versand landet im Protokoll unter
  Admin → E-Mail-Versand; 3 Versuche bei Fehlern)
- Tägliche Läufe: `src/app/api/cron/*` und `vercel.json`
- Anleitungen: `docs/google-anleitung.md`, `docs/logx-anleitung.md`,
  `docs/codex-start.md`

## Wie Anfragen laufen

1. Kunde füllt das Probetermin-Formular aus → Eintrag unter Admin → Anfragen.
2. Mail ans Studio (Adresse aus Admin → Studios), dann Eingangsbestätigung
   an den Kunden, dann eine Kopie an die Adressen unter Admin →
   E-Mail-Versand → „Kopie jeder Anfrage“ (mit „⚠ NICHT ZUGESTELLT“, wenn
   die Studio-Mail scheiterte).
3. Das Studio ruft an, setzt den Stand und bestätigt den Termin im Admin.
4. Bitte um eine Google-Bewertung: nur per Knopf bei der Anfrage.

## Gutscheine (Seite /gutschein bzw. /en/voucher)

Code: `src/lib/gutschein.ts` (Texte, Preis) und `src/components/seiten/gutschein.tsx`.

- **Sichtbar** erst, wenn unter Admin → Sichtbarkeit der Schalter
  „Gutscheine (Weihnachten)“ an ist (geplant ab 1. Dezember). Ausgeschaltet
  sehen angemeldete Admins die Seite trotzdem als Vorschau.
- **Weihnachtsaktion** „4 Wochen EMS-Training“ für **99 €**: Kauf über
  Digistore24. Der Kauf-Link kommt **nicht** in den Code, sondern in die
  Vercel-Variable `DIGISTORE_GUTSCHEIN_URL` (Produktion, danach neu
  bauen). Ohne sie zeigt die Seite statt „Jetzt kaufen“ das Formular.
  Digistore24 kümmert sich um Zahlung, Rechnung, Widerruf und schickt den
  Gutschein als PDF.
- **Alle anderen Gutscheine** (Wertgutschein, Zehnerkarte): Anfrage über
  das Formular auf der Seite. Sie kommt als Kontaktnachricht mit Betreff
  „Gutschein-Anfrage“ an – unter Admin → Nachrichten und per Mail an die
  Sammeladresse (`TEAM_EMAIL`). Bezahlt wird im Studio oder per Überweisung.
- **Noch nicht gebaut** (mögliche nächste Schritte, vorher mit dem Team
  absprechen): Verkäufe von Digistore24 automatisch übernehmen (IPN/Webhook
  → Liste der verkauften Gutscheine im Admin), Gutscheincode beim Einlösen
  im Admin prüfen und als eingelöst markieren, Hinweis im Probetermin-Formular
  „Ich habe einen Gutschein“.
