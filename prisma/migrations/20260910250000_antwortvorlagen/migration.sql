-- Vorlagen für Antwort-E-Mails.
--
-- Die Website verschickt diese Antworten NICHT selbst: Eine Antwort auf
-- eine Kontaktanfrage kommt aus dem Postfach des Studios, damit der
-- Interessent darauf antworten kann und der Verlauf dort steht, wo ihn
-- alle sehen. Die Vorlage füllt deshalb nur das Mailprogramm vor.
CREATE TABLE IF NOT EXISTS "Antwortvorlage" (
    "id" TEXT NOT NULL,
    "titel" TEXT NOT NULL,
    "betreff" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Antwortvorlage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Antwortvorlage_aktiv_sortOrder_idx"
    ON "Antwortvorlage" ("aktiv", "sortOrder");
