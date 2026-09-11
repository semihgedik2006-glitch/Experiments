-- Zugangslinks zum eigenen Terminbereich.
--
-- Gespeichert wird der Abdruck des Schlüssels, nie der Schlüssel selbst:
-- Wer diese Tabelle liest, kann damit keinen gültigen Link bauen. Der
-- Schlüssel steht einzig im Postfach dessen, der ihn angefordert hat.

CREATE TABLE IF NOT EXISTS "Kundenzugang" (
  "id"          TEXT NOT NULL,
  "email"       TEXT NOT NULL,
  "tokenHash"   TEXT NOT NULL,
  "ablaufAm"    TIMESTAMP(3) NOT NULL,
  "geoeffnetAm" TIMESTAMP(3),
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Kundenzugang_pkey" PRIMARY KEY ("id")
);

-- Eindeutig: Ein Abdruck gehört zu genau einem Zugang. Dient zugleich als
-- Suchweg beim Öffnen des Links - der einzige Zugriff, der schnell sein
-- muss.
CREATE UNIQUE INDEX IF NOT EXISTS "Kundenzugang_tokenHash_key"
  ON "Kundenzugang"("tokenHash");

-- Für die Begrenzung je Adresse: "wie viele Links wurden in der letzten
-- Stunde für diese Adresse angefordert?"
CREATE INDEX IF NOT EXISTS "Kundenzugang_email_createdAt_idx"
  ON "Kundenzugang"("email", "createdAt");

-- Fürs tägliche Aufräumen abgelaufener Zugänge.
CREATE INDEX IF NOT EXISTS "Kundenzugang_ablaufAm_idx"
  ON "Kundenzugang"("ablaufAm");

-- Eigene Art im Mailprotokoll, damit ein Zugangslink dort nicht wie eine
-- Terminbestätigung aussieht.
ALTER TYPE "MailArt" ADD VALUE IF NOT EXISTS 'KUNDENBEREICH';
