# Körperformen - Website

Firmenwebseite für das EMS-Studio Körperformen (Hürth / Köln / Brühl). Gebaut mit Next.js (App Router), TypeScript, Tailwind CSS und Prisma (SQLite für die lokale Entwicklung).

## Setup

```bash
npm install
cp .env.example .env   # Werte anpassen (AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD)
npx prisma migrate deploy
npm run db:seed        # legt Admin-Account, Studio-Daten, Beispieltermine & Blogartikel an
npm run dev
```

Die Seite läuft danach unter [http://localhost:3000](http://localhost:3000), der Admin-Bereich unter `/admin/login` (Zugangsdaten aus `.env`).

## Wichtige Bereiche

- `src/app/(site)` - öffentliche Seiten (Home, Studio, Preise, Über uns, Probetermin, Blog, Kontakt, Impressum, Datenschutz)
- `src/app/admin` - passwortgeschütztes Admin-Dashboard (Buchungen, Verfügbarkeit, Blog, Nachrichten, Newsletter)
- `src/lib/actions` - Server Actions für Formulare und Admin-Verwaltung
- `prisma/schema.prisma` - Datenmodell
- `prisma/seed.ts` - Beispieldaten / Erstanlage des Admin-Accounts
- `src/lib/site-config.ts` - Name, Kontakt, Social-Media-Links, Keywords
- `src/lib/pricing-data.ts` - Preispakete (Platzhalter, bitte anpassen)

## Vor dem Livegang unbedingt anpassen

- Echte Studio-Adresse, Öffnungszeiten und Google-Maps-Link (über den Admin-Bereich oder direkt in der Datenbank/`prisma/seed.ts`)
- Platzhaltertexte in `Impressum` und `Datenschutz` (`src/app/(site)/impressum`, `.../datenschutz`) durch rechtlich geprüfte Inhalte ersetzen
- Social-Media-Links in `src/lib/site-config.ts`
- Preise in `src/lib/pricing-data.ts`
- `AUTH_SECRET` und `ADMIN_PASSWORD` in der Produktionsumgebung auf sichere, eigene Werte setzen
- Optional: `NEXT_PUBLIC_GA_ID` für Google Analytics setzen

## Deployment

Für den produktiven Einsatz empfiehlt sich Vercel (kostenloses Hosting für dieses Projekt) zusammen mit einer gehosteten Postgres-Datenbank (z.B. Neon oder Supabase, beide mit kostenlosem Starter-Tarif) statt der lokalen SQLite-Datenbank. Dafür `prisma/schema.prisma` auf `provider = "postgresql"` umstellen und einen passenden Prisma-Adapter (`@prisma/adapter-pg`) in `src/lib/prisma.ts` einsetzen.

## Nützliche Befehle

```bash
npm run dev      # Entwicklungsserver
npm run build    # Produktions-Build
npm run lint     # ESLint
npx prisma studio  # Datenbank im Browser durchsuchen
```
