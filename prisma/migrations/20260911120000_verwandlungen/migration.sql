-- Vorher-Nachher-Bilder.
--
-- Zwei Dinge sind hier anders als bei jeder anderen Tabelle, und beide
-- sind Absicht:
--
-- "aktiv" steht auf FALSE. Überall sonst ist ein neuer Eintrag sofort
-- sichtbar, weil das die bequemere Voreinstellung ist. Hier nicht: Auf
-- dem Bild ist ein Mensch zu sehen, und der erscheint erst, wenn jemand
-- das bewusst freigibt.
--
-- "einwilligungAm" ist zwar NULL-bar, aber die Serveraktion lässt ohne
-- dieses Datum kein "aktiv" zu. Eine Datenbankbedingung wäre strenger,
-- würde aber auch das Anlegen eines Entwurfs verhindern - und dann legt
-- niemand den Eintrag an, bevor die Unterschrift da ist.

CREATE TABLE IF NOT EXISTS "Verwandlung" (
  "id"                TEXT NOT NULL,
  "name"              TEXT NOT NULL,
  "zeitraum"          TEXT NOT NULL,
  "kontext"           TEXT NOT NULL,
  "text"              TEXT,
  "vorherUrl"         TEXT NOT NULL,
  "nachherUrl"        TEXT NOT NULL,
  "studioId"          TEXT,
  "einwilligungAm"    TIMESTAMP(3),
  "einwilligungForm"  TEXT,
  "einwilligungNotiz" TEXT,
  "aktiv"             BOOLEAN NOT NULL DEFAULT false,
  "sortOrder"         INTEGER NOT NULL DEFAULT 0,
  "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"         TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Verwandlung_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Verwandlung_sortOrder_idx" ON "Verwandlung"("sortOrder");
CREATE INDEX IF NOT EXISTS "Verwandlung_studioId_idx" ON "Verwandlung"("studioId");

-- SET NULL und nicht CASCADE: Schließt ein Standort, bleibt die
-- Einwilligung der abgebildeten Person bestehen - der Eintrag verliert
-- nur seine Zuordnung. Ein stillschweigend gelöschter Nachweis wäre bei
-- genau diesen Daten das falsche Verhalten.
DO $$ BEGIN
  ALTER TABLE "Verwandlung"
    ADD CONSTRAINT "Verwandlung_studioId_fkey"
    FOREIGN KEY ("studioId") REFERENCES "StudioLocation"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
