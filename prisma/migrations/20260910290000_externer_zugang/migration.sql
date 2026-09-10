-- Zugang zu Instagram.
--
-- Der Schlüssel steht in der Datenbank und nicht in einer
-- Umgebungsvariablen: Instagram-Schlüssel laufen nach 60 Tagen ab und
-- müssen vorher getauscht werden. Ein neuer Wert lässt sich aber nicht in
-- eine Umgebungsvariable zurückschreiben - die Wand wäre nach zwei Monaten
-- still verschwunden.

CREATE TABLE IF NOT EXISTS "ExternerZugang" (
  "id"            TEXT NOT NULL,
  "token"         TEXT NOT NULL,
  "laeuftAb"      TIMESTAMP(3),
  "erneuertAm"    TIMESTAMP(3),
  "letzterFehler" TEXT,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ExternerZugang_pkey" PRIMARY KEY ("id")
);
