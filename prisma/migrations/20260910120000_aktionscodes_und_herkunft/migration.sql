-- Aktionscodes und die Herkunft einer Anfrage.

CREATE TABLE "Promotion" (
  "id"          TEXT NOT NULL,
  "code"        TEXT NOT NULL,
  "label"       TEXT NOT NULL,
  "benefit"     TEXT,
  "active"      BOOLEAN NOT NULL DEFAULT true,
  "validFrom"   TIMESTAMP(3),
  "validUntil"  TIMESTAMP(3),
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- Der Code ist der Schlüssel, den Leute abtippen. Eindeutig, und immer in
-- Großbuchstaben gespeichert - "sommer26" und "SOMMER26" sind derselbe.
CREATE UNIQUE INDEX "Promotion_code_key" ON "Promotion"("code");

ALTER TABLE "Booking" ADD COLUMN "promotionId" TEXT;

-- Wird eine Aktion gelöscht, bleibt die Anfrage bestehen und verliert nur
-- den Bezug. Anfragen wegen einer aufgeräumten Aktion zu verlieren wäre
-- der teurere Fehler.
ALTER TABLE "Booking"
  ADD CONSTRAINT "Booking_promotionId_fkey"
  FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Booking_promotionId_idx" ON "Booking"("promotionId");

-- Herkunft: Seite, Kampagnenkennung aus der Adresse und der Name der
-- verweisenden Seite. Kein Cookie, kein Drittanbieter, keine vollständige
-- Verweisadresse.
ALTER TABLE "Booking" ADD COLUMN "herkunftSeite" TEXT;
ALTER TABLE "Booking" ADD COLUMN "herkunftKampagne" TEXT;
ALTER TABLE "Booking" ADD COLUMN "herkunftQuelle" TEXT;
