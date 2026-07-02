# 🚀 Schritt-für-Schritt-Anleitung: Von hier bis zur Live-Webseite

Diese Anleitung führt dich vom aktuellen Stand (fertiger Code auf GitHub) bis zur
live erreichbaren Webseite unter deiner eigenen Domain.

---

## Schritt 1: Code auf deinen Computer holen

**Was du brauchst:**
- [Node.js](https://nodejs.org/de) (Version 20 oder neuer) - herunterladen und installieren
- [Git](https://git-scm.com/downloads) - herunterladen und installieren
- Einen Code-Editor, z.B. [Visual Studio Code](https://code.visualstudio.com/) (kostenlos)

**So geht's:**

1. Öffne ein Terminal (Windows: "Eingabeaufforderung" oder "PowerShell", Mac: "Terminal")
2. Führe diese Befehle aus:

```bash
git clone https://github.com/semihgedik2006-glitch/Experiments.git koerperformen
cd koerperformen
npm install
```

---

## Schritt 2: Projekt lokal starten

1. Kopiere die Datei `.env.example` und benenne die Kopie in `.env` um
2. Öffne `.env` im Editor und passe die Werte an:

```
DATABASE_URL="file:./dev.db"
AUTH_SECRET="hier-einen-langen-zufaelligen-text-einfuegen"
ADMIN_EMAIL="deine@email.de"
ADMIN_PASSWORD="dein-sicheres-passwort"
```

   💡 Einen sicheren Zufallswert für `AUTH_SECRET` bekommst du z.B. mit diesem
   Terminal-Befehl: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

3. Datenbank anlegen und mit Beispieldaten füllen:

```bash
npx prisma migrate deploy
npm run db:seed
```

   💡 Nach jedem `git pull` lohnt sich zusätzlich ein kurzer Check, ob es
   neue Datenbank-Änderungen gibt: `npx prisma migrate deploy` erneut
   ausführen (schadet nie, macht nichts kaputt, wenn nichts Neues da ist).

4. Entwicklungsserver starten:

```bash
npm run dev
```

5. Öffne im Browser:
   - Webseite: http://localhost:3000
   - Admin-Bereich: http://localhost:3000/admin/login (Login mit `ADMIN_EMAIL` / `ADMIN_PASSWORD` aus deiner `.env`)

---

## Schritt 3: Inhalte anpassen (deine echten Daten eintragen)

| Was | Datei | Anmerkung |
|---|---|---|
| Name, Telefonnummer, E-Mail, Social-Media-Links, SEO-Keywords | `src/lib/site-config.ts` | Zentrale Konfigurationsdatei |
| Preise & Pakete | `src/lib/pricing-data.ts` | Aktuell Platzhalter-Preise (89/119/159 €) |
| FAQ-Fragen | `src/lib/faq-data.ts` | Fragen ergänzen/ändern |
| Studio-Adresse, Öffnungszeiten, Google-Maps-Karte | `prisma/seed.ts` | Danach `rm dev.db && npx prisma migrate deploy && npm run db:seed` ausführen (Windows: `del dev.db`) |
| Startseiten-Texte | `src/components/home/hero.tsx`, `usp-grid.tsx`, `how-it-works.tsx` | Überschriften & Texte |
| Über-uns-Texte | `src/app/(site)/ueber-uns/page.tsx` | |
| Impressum | `src/app/(site)/impressum/page.tsx` | ⚠️ Pflicht! Platzhalter ersetzen |
| Datenschutzerklärung | `src/app/(site)/datenschutz/page.tsx` | ⚠️ Pflicht! Platzhalter ersetzen |

**Google-Maps-Karte mit echter Adresse:**
1. Öffne [Google Maps](https://www.google.com/maps) und suche dein Studio
2. Klicke auf "Teilen" → "Karte einbetten" → kopiere die URL aus dem `src="..."` Teil
3. Trage diese URL in `prisma/seed.ts` bei `mapEmbedUrl` ein (und setze die Datenbank wie oben beschrieben neu auf)

**Impressum & Datenschutz:** Kostenlose Generatoren z.B. bei
[e-recht24.de Impressum-Generator](https://www.e-recht24.de/impressum-generator.html) und
[e-recht24.de Datenschutz-Generator](https://www.e-recht24.de/muster-datenschutzerklaerung.html).
Im Zweifel von einem Anwalt prüfen lassen.

---

## Schritt 4: Logo & Bilder einbinden

✅ **Das echte Logo ist bereits eingebunden** (`public/logo-dark.svg` für dunklen
Hintergrund, `public/logo-light.svg` für hellen Hintergrund - `src/components/logo.tsx`
wechselt automatisch je nach Dark-/Light-Mode). Es wurde von eurer bestehenden
Seite körperformen.com übernommen.

Was noch fehlt, sind echte **Studio-Fotos** (aktuell nur Platzhalter/kein Bild):

1. Lade Studio-Fotos von [www.körperformen.com](https://www.körperformen.com) herunter
   (oder frage die Agentur/Zentrale nach den Originaldateien - wichtig wegen Bildrechten!)
2. Lege die Dateien im Ordner `public/` ab, z.B. `public/studio-1.jpg`
3. Binde sie in den passenden Komponenten ein, z.B. auf der Studio- oder Über-uns-Seite:

```tsx
import Image from "next/image";
<Image src="/studio-1.jpg" alt="Körperformen Studio Hürth" width={800} height={600} />
```

---

## Schritt 5: Änderungen speichern und hochladen (Git)

Nach jeder Änderung:

```bash
git add -A
git commit -m "Kurze Beschreibung was du geändert hast"
git push
```

Dein Repository: https://github.com/semihgedik2006-glitch/Experiments

---

## Schritt 6: Kostenlos veröffentlichen mit Vercel

[Vercel](https://vercel.com) ist der Hosting-Dienst der Next.js-Macher - für dieses Projekt kostenlos (Hobby-Tarif).

1. Gehe auf https://vercel.com/signup und melde dich **mit deinem GitHub-Account** an
2. Klicke auf **"Add New… → Project"**
3. Wähle dein Repository `Experiments` aus und klicke **"Import"**
4. Trage unter **"Environment Variables"** ein:
   - `DATABASE_URL` (siehe Schritt 7 - Datenbank-URL von Neon)
   - `AUTH_SECRET` (neuer Zufallswert, NICHT der aus der lokalen `.env`)
   - `ADMIN_EMAIL` und `ADMIN_PASSWORD`
5. Klicke **"Deploy"**

⚠️ **Wichtig:** Die lokale SQLite-Datenbank (`dev.db`) funktioniert bei Vercel **nicht**.
Für den Live-Betrieb brauchst du eine gehostete Datenbank → Schritt 7.

---

## Schritt 7: Kostenlose Produktions-Datenbank (Neon Postgres)

1. Registriere dich kostenlos bei https://neon.tech
2. Erstelle ein neues Projekt (Region: Frankfurt) und kopiere die **Connection String** (beginnt mit `postgresql://...`)
3. Passe im Code zwei Dateien an:

   **`prisma/schema.prisma`** - Provider umstellen:
   ```prisma
   datasource db {
     provider = "postgresql"
   }
   ```

   **`src/lib/prisma.ts`** - Postgres-Adapter verwenden:
   ```bash
   npm install @prisma/adapter-pg
   ```
   ```ts
   import { PrismaPg } from "@prisma/adapter-pg";
   const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
   ```
   (Gleiches in `prisma/seed.ts`.)

4. Migration und Seed gegen die neue Datenbank laufen lassen:
   ```bash
   DATABASE_URL="postgresql://..." npx prisma migrate deploy
   DATABASE_URL="postgresql://..." npm run db:seed
   ```
5. Die `postgresql://...`-URL als `DATABASE_URL` bei Vercel eintragen (Project → Settings → Environment Variables) und neu deployen

💡 Sag mir einfach Bescheid, wenn du an diesem Punkt bist - **diese Umstellung kann ich komplett für dich übernehmen.**

---

## Schritt 8: Deine Domain verbinden

1. Bei Vercel: Project → **Settings → Domains** → deine Domain eintragen
2. Vercel zeigt dir DNS-Einträge an (meist ein `A`-Record auf `76.76.21.21` und ein `CNAME` auf `cname.vercel-dns.com`)
3. Diese Einträge trägst du bei deinem Domain-Anbieter ein (dort wo du die Domain gekauft hast, z.B. IONOS, Strato, GoDaddy)
4. Nach wenigen Minuten bis Stunden ist die Seite unter deiner Domain erreichbar - HTTPS-Zertifikat kommt automatisch

---

## Schritt 9: Google Analytics einrichten (optional)

1. Kostenlos anmelden bei https://analytics.google.com
2. Eine "Property" für deine Webseite anlegen → du bekommst eine **Mess-ID** im Format `G-XXXXXXXXXX`
3. Diese ID bei Vercel als Umgebungsvariable eintragen: `NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX`
4. Neu deployen - fertig. (Ohne die Variable wird kein Tracking geladen.)

⚠️ Sobald Analytics aktiv ist, brauchst du in der Regel einen **Cookie-Consent-Banner** (DSGVO) und musst die Datenschutzerklärung anpassen. Sag Bescheid, dann baue ich den Banner ein.

---

## Schritt 10: Bei Google gefunden werden (SEO)

1. Melde dich bei der [Google Search Console](https://search.google.com/search-console) an
2. Füge deine Domain als Property hinzu (Bestätigung per DNS-Eintrag)
3. Reiche deine Sitemap ein: `https://deine-domain.de/sitemap.xml` (wird von der Seite automatisch erzeugt)
4. Lege zusätzlich ein [Google Business Profil](https://business.google.com) für das Studio an - wichtig für die lokale Suche ("EMS Studio Hürth")

---

## ✅ Checkliste vor dem Livegang

- [ ] Impressum mit echten Pflichtangaben gefüllt
- [ ] Datenschutzerklärung geprüft/ersetzt
- [ ] Echte Preise in `src/lib/pricing-data.ts`
- [ ] Echte Adresse, Telefonnummer, Öffnungszeiten (Seed/Admin)
- [ ] Echte Social-Media-Links in `src/lib/site-config.ts`
- [ ] Eigenes Logo und Fotos eingebunden (Bildrechte geklärt!)
- [ ] `AUTH_SECRET` und `ADMIN_PASSWORD` in Produktion auf sichere Werte gesetzt
- [ ] Produktions-Datenbank (Neon) verbunden
- [ ] Domain verbunden, Seite lädt über HTTPS
- [ ] Probetermin-Buchung einmal selbst durchgespielt

---

## Was ich als Nächstes für dich bauen kann

- Umstellung auf Postgres/Neon (Schritt 7) komplett übernehmen
- Cookie-Consent-Banner (DSGVO) für Google Analytics
- E-Mail-Benachrichtigung, wenn eine neue Buchung eingeht
- Logo/Bilder einbauen, sobald du mir die Dateien gibst
- Kundenkonto/Login, Online-Shop, weitere Standorte, Mehrsprachigkeit
