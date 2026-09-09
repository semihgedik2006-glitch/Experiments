-- Persönlicher Schlüssel für den Absage-/Verschiebe-Link und Merker für
-- die Erinnerung am Vortag.
ALTER TABLE "Booking" ADD COLUMN "manageToken" TEXT;
ALTER TABLE "Booking" ADD COLUMN "reminderSentAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Booking_manageToken_key" ON "Booking"("manageToken");

-- Bestehende Buchungen bekommen einen Schlüssel, damit auch für sie ein
-- Link erzeugt werden kann. gen_random_uuid() steht in PostgreSQL 13+
-- ohne Erweiterung zur Verfügung.
UPDATE "Booking"
SET "manageToken" = replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')
WHERE "manageToken" IS NULL;
