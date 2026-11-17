# Start mit Codex – für Marcel

## 1. Einmalig einrichten

1. Einladung zu GitHub annehmen (Mail von GitHub, Repo
   `semihgedik2006-glitch/Experiments`).
2. Einladung zu Vercel annehmen (Team „koerperformen“). Dort siehst du jeden
   Build, die Vorschau-Links und die Einstellungen (Environment Variables).
3. Zugang zum Adminbereich: https://www.koerperformen-koeln.de/admin – E-Mail
   und Passwort bekommst du von Semih.
4. In Codex das Repo öffnen bzw. klonen:
   `git clone https://github.com/semihgedik2006-glitch/Experiments.git`

## 2. Diesen Text als erste Nachricht an Codex schicken

```
Du arbeitest an der Website von Körperformen EMS (14 Studios in Köln und
Umgebung). Ich bin Marcel, Mitinhaber, kein Entwickler – erklär mir alles
auf Deutsch und in einfacher Sprache.

Lies zuerst AGENTS.md im Repo komplett, dazu docs/logx-anleitung.md und
docs/google-anleitung.md. Halte dich an die Regeln dort, besonders:
- nie direkt auf den Produktions-Branch pushen, immer eigener Branch und
  Pull Request, mergen erst, wenn ich "merge" sage
- Vorschau und Live teilen sich die Datenbank: Migrationen nur hinzufügend
- keine Geheimnisse ins Repo, niemals POST /book bei LogX
- keine Fitnessstudio-Vergleiche, keine Heilversprechen, nur echte Fotos

Gib mir danach eine kurze Übersicht:
1. Was die Website heute alles kann (für Kunden und im Adminbereich)
2. Wie Anfragen und E-Mails laufen
3. Wie die Gutscheine funktionieren: Weihnachtsaktion über Digistore24,
   andere Gutscheine über das Formular, was ich vor dem 1. Dezember noch
   tun muss
4. Was noch offen ist bzw. was du als Nächstes vorschlagen würdest

Ändere noch nichts, bis ich dir sage, was ich möchte. Mach Vorschläge,
bevor du etwas baust.
```

## 3. Gutscheine – was vor dem 1. Dezember zu tun ist

1. Bei Digistore24 das Produkt „4 Wochen EMS-Training“ für 99 € anlegen
   (Gutschein als PDF, Rechnung und Widerruf macht Digistore24).
2. Den Bestell-Link bei Vercel unter Settings → Environment Variables als
   `DIGISTORE_GUTSCHEIN_URL` eintragen (Umgebung: Production), danach unter
   Deployments den letzten Build „Redeploy“.
3. Am 1. Dezember im Admin unter Sichtbarkeit den Schalter
   „Gutscheine (Weihnachten)“ einschalten. Vorher siehst du die Seite als
   angemeldeter Admin schon als Vorschau: /gutschein
4. Anfragen für Wertgutschein und Zehnerkarte kommen unter Admin →
   Nachrichten an (Betreff „Gutschein-Anfrage“) und per Mail.
5. Ideen für später (mit Codex bauen, vorher absprechen): Verkäufe von
   Digistore24 automatisch in den Admin übernehmen, Gutscheincodes beim
   Einlösen prüfen und abhaken.
