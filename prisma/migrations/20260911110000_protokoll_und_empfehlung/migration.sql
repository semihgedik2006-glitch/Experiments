-- Änderungsprotokoll und Empfehlungsprogramm.

-- 1. Wer hat wann was geändert.
--
-- Der Anlass: Seit es mehrere Zugänge gibt, kann niemand die Frage "wer
-- hat diese Buchung storniert?" beantworten. Bei vierzehn Standorten
-- wird daraus schnell ein Streit darüber, ob überhaupt jemand etwas
-- geändert hat.
DO $$ BEGIN
  CREATE TYPE "ProtokollArt" AS ENUM ('ANGELEGT', 'GEAENDERT', 'GELOESCHT', 'VERSENDET', 'STATUS');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "Protokoll" (
  "id"        TEXT NOT NULL,
  "wer"       TEXT NOT NULL,
  "art"       "ProtokollArt" NOT NULL,
  "bereich"   TEXT NOT NULL,
  "betreff"   TEXT NOT NULL,
  "detail"    TEXT,
  "studioId"  TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Protokoll_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Protokoll_createdAt_idx" ON "Protokoll"("createdAt");
-- Studio und Zeit zusammen: Eine Studioleitung fragt immer beides in
-- einem ab.
CREATE INDEX IF NOT EXISTS "Protokoll_studioId_createdAt_idx"
  ON "Protokoll"("studioId", "createdAt");

-- Bewusst KEIN Fremdschlüssel auf Studio oder Zugang: Ein Protokoll, das
-- beim Löschen eines Standorts mitverschwindet, ist genau dann weg, wenn
-- man es braucht.

-- 2. Wer wen geworben hat.
CREATE TABLE IF NOT EXISTS "Empfehlung" (
  "id"        TEXT NOT NULL,
  "code"      TEXT NOT NULL,
  "name"      TEXT NOT NULL,
  "email"     TEXT,
  "phone"     TEXT,
  "studioId"  TEXT,
  "praemie"   TEXT,
  "notiz"     TEXT,
  "aktiv"     BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Empfehlung_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Empfehlung_code_key" ON "Empfehlung"("code");
CREATE INDEX IF NOT EXISTS "Empfehlung_studioId_idx" ON "Empfehlung"("studioId");

DO $$ BEGIN
  ALTER TABLE "Empfehlung"
    ADD CONSTRAINT "Empfehlung_studioId_fkey"
    FOREIGN KEY ("studioId") REFERENCES "StudioLocation"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 3. Die Anfrage merkt sich, wer sie geworben hat.
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "empfehlungId" TEXT;
ALTER TABLE "Booking"
  ADD COLUMN IF NOT EXISTS "praemieGutgeschrieben" BOOLEAN NOT NULL DEFAULT false;

DO $$ BEGIN
  ALTER TABLE "Booking"
    ADD CONSTRAINT "Booking_empfehlungId_fkey"
    FOREIGN KEY ("empfehlungId") REFERENCES "Empfehlung"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
