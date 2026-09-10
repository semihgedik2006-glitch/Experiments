-- Trainerprofile je Standort.
--
-- Wer ein Probetraining bucht, stellt sich vor einem Fremden in enge
-- Trainingskleidung. Ein Gesicht und zwei Sätze senken diese Hürde mehr
-- als jede weitere Erklärung zum Training.

CREATE TABLE IF NOT EXISTS "Trainer" (
  "id"            TEXT NOT NULL,
  "studioId"      TEXT NOT NULL,
  "name"          TEXT NOT NULL,
  "rolle"         TEXT,
  "qualifikation" TEXT,
  "text"          TEXT,
  "fotoUrl"       TEXT,
  "aktiv"         BOOLEAN NOT NULL DEFAULT true,
  "sortOrder"     INTEGER NOT NULL DEFAULT 0,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Trainer_pkey" PRIMARY KEY ("id")
);

-- Studio und Reihenfolge zusammen: Die öffentliche Seite fragt immer
-- beides in einem ab.
CREATE INDEX IF NOT EXISTS "Trainer_studioId_sortOrder_idx"
  ON "Trainer"("studioId", "sortOrder");

-- Fällt ein Standort weg, fallen seine Profile mit. Ein Trainer ohne
-- Studio wäre ein Eintrag, der nirgends erscheint und den niemand findet.
DO $$ BEGIN
  ALTER TABLE "Trainer"
    ADD CONSTRAINT "Trainer_studioId_fkey"
    FOREIGN KEY ("studioId") REFERENCES "StudioLocation"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
