-- Der vereinbarte Termin an Anfragen ohne festen Platz (Wunschzeiten).
-- Nur neue Spalten, bestehende Daten bleiben unverändert.
ALTER TABLE "Booking" ADD COLUMN "terminTag" TIMESTAMP(3);
ALTER TABLE "Booking" ADD COLUMN "terminUhrzeit" TEXT;
