-- Newsletter-Versand aus dem Adminbereich.
--
-- Zwei Teile, die zusammengehören: die Ausgaben selbst und der
-- Abmeldeschlüssel je Abonnent. Der zweite ist der wichtigere - ohne
-- funktionierende Abmeldung darf ein Newsletter gar nicht erst rausgehen
-- (§ 7 UWG, Art. 21 DSGVO).

-- 1. Abmeldeschlüssel an jedem Abonnenten.
--
-- In drei Schritten statt in einem: Eine Spalte, die sofort NOT NULL sein
-- soll, lässt sich an einer Tabelle mit Inhalt nicht anlegen. Erst
-- hinzufügen, dann für alle bestehenden Zeilen füllen, dann festziehen.
ALTER TABLE "NewsletterSubscriber" ADD COLUMN IF NOT EXISTS "abmeldeToken" TEXT;

-- gen_random_uuid() steckt in PostgreSQL ab Version 13 bereits drin und
-- braucht keine Erweiterung. Zweimal aneinandergehängt und ohne
-- Bindestriche ergibt das 64 Zeichen - dieselbe Länge wie die
-- Verwaltungsschlüssel an den Buchungen.
UPDATE "NewsletterSubscriber"
   SET "abmeldeToken" = replace(gen_random_uuid()::text, '-', '')
                     || replace(gen_random_uuid()::text, '-', '')
 WHERE "abmeldeToken" IS NULL;

ALTER TABLE "NewsletterSubscriber" ALTER COLUMN "abmeldeToken" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "NewsletterSubscriber_abmeldeToken_key"
  ON "NewsletterSubscriber"("abmeldeToken");

-- 2. Die Ausgaben.
DO $$ BEGIN
  CREATE TYPE "NewsletterStatus" AS ENUM ('ENTWURF', 'LAEUFT', 'VERSENDET');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "Newsletter" (
  "id"           TEXT NOT NULL,
  "betreff"      TEXT NOT NULL,
  "text"         TEXT NOT NULL,
  "status"       "NewsletterStatus" NOT NULL DEFAULT 'ENTWURF',
  "versendetAm"  TIMESTAMP(3),
  "zugestellt"   INTEGER NOT NULL DEFAULT 0,
  "gescheitert"  INTEGER NOT NULL DEFAULT 0,
  "versendetVon" TEXT,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Newsletter_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Newsletter_createdAt_idx" ON "Newsletter"("createdAt");

-- 2b. Wer eine Ausgabe bekommen hat.
--
-- Der eindeutige Schlüssel aus Ausgabe und Adresse ist keine Kosmetik: Ein
-- Versand läuft in Abschnitten, und ohne ihn bekäme beim zweiten Abschnitt
-- die halbe Liste alles doppelt.
CREATE TABLE IF NOT EXISTS "NewsletterEmpfang" (
  "id"           TEXT NOT NULL,
  "newsletterId" TEXT NOT NULL,
  "empfaenger"   TEXT NOT NULL,
  "ok"           BOOLEAN NOT NULL,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "NewsletterEmpfang_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "NewsletterEmpfang_newsletterId_empfaenger_key"
  ON "NewsletterEmpfang"("newsletterId", "empfaenger");

DO $$ BEGIN
  ALTER TABLE "NewsletterEmpfang"
    ADD CONSTRAINT "NewsletterEmpfang_newsletterId_fkey"
    FOREIGN KEY ("newsletterId") REFERENCES "Newsletter"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 3. Zwei neue Arten im Mail-Protokoll.
ALTER TYPE "MailArt" ADD VALUE IF NOT EXISTS 'NEWSLETTER';
ALTER TYPE "MailArt" ADD VALUE IF NOT EXISTS 'NEWSLETTER_TEST';
