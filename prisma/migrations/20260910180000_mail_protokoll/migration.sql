-- Protokoll der verschickten E-Mails und zwei Merker an der Anfrage.

CREATE TYPE "MailArt" AS ENUM (
  'ANFRAGE_EINGANG',
  'ANFRAGE_INTERN',
  'NACHFASS_INTERN',
  'KONTAKT_INTERN',
  'BESTAETIGUNG',
  'ERINNERUNG',
  'ABSAGE_GAST',
  'VERSCHOBEN_GAST'
);

-- Gespeichert werden Empfänger und Betreff, nicht der Inhalt: Für die
-- Frage "ist sie rausgegangen" genügt das, und ein Abzug der Datenbank
-- enthält damit keine vollständigen Nachrichten.
CREATE TABLE "MailLog" (
  "id"         TEXT NOT NULL,
  "art"        "MailArt" NOT NULL,
  "empfaenger" TEXT NOT NULL,
  "betreff"    TEXT NOT NULL,
  "ok"         BOOLEAN NOT NULL,
  "fehler"     TEXT,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MailLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MailLog_createdAt_idx" ON "MailLog"("createdAt");

-- Merker an der Anfrage: Ohne sie käme die Benachrichtigung ans Studio
-- bei jedem Wiederholungslauf erneut, und die Erinnerung an eine offene
-- Anfrage jeden Tag.
ALTER TABLE "Booking" ADD COLUMN "studioBenachrichtigtAm" TIMESTAMP(3);
ALTER TABLE "Booking" ADD COLUMN "nachfassGesendetAm" TIMESTAMP(3);
