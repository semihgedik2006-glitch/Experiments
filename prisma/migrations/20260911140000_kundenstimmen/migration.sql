-- Kundenstimmen aus dem Adminbereich.
--
-- Sie ersetzen eine Liste erfundener Zitate im Quelltext. Die war als
-- Platzhalter fürs Layout gedacht und hätte beim Livegang ein Problem
-- ergeben: Erfundene Bewertungen sind unzulässig (§ 5b Abs. 3 UWG), und
-- sie standen nicht irgendwo, sondern auf der Startseite.
--
-- "aktiv" steht wie beim Vorher-Nachher-Bereich auf FALSE: Eine Stimme
-- erscheint erst, wenn jemand sie bewusst freigibt.

CREATE TABLE IF NOT EXISTS "Kundenstimme" (
  "id"                TEXT NOT NULL,
  "name"              TEXT NOT NULL,
  "text"              TEXT NOT NULL,
  "ziel"              TEXT,
  "monate"            INTEGER,
  "studioId"          TEXT,
  "einwilligungAm"    TIMESTAMP(3),
  "einwilligungNotiz" TEXT,
  "aktiv"             BOOLEAN NOT NULL DEFAULT false,
  "sortOrder"         INTEGER NOT NULL DEFAULT 0,
  "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"         TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Kundenstimme_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Kundenstimme_sortOrder_idx" ON "Kundenstimme"("sortOrder");
CREATE INDEX IF NOT EXISTS "Kundenstimme_studioId_idx" ON "Kundenstimme"("studioId");

-- SET NULL wie beim Vorher-Nachher-Bereich: Schließt ein Standort, geht
-- die Zustimmung der Person nicht mit verloren - der Eintrag verliert
-- nur seine Zuordnung.
DO $$ BEGIN
  ALTER TABLE "Kundenstimme"
    ADD CONSTRAINT "Kundenstimme_studioId_fkey"
    FOREIGN KEY ("studioId") REFERENCES "StudioLocation"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
