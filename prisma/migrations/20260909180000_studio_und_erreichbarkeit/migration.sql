-- Standort und telefonische Erreichbarkeit an der Buchungsanfrage.
--
-- Der Standort stand bisher nur mittelbar an der Anfrage: über den
-- gewählten Termin. Wer oben ein Studio anklickte, aber keine feste Zeit,
-- schickte seine Wahl nie mit - die Anfrage hing danach an keinem
-- Standort und musste von Hand zugeordnet werden.
ALTER TABLE "Booking" ADD COLUMN "studioId" TEXT;

-- Wann jemand telefonisch am besten zu erreichen ist. Ohne diese Angabe
-- beginnt jede Anfrage mit Rückrufversuchen ins Leere.
ALTER TABLE "Booking" ADD COLUMN "erreichbarkeit" TEXT;

-- Bestehende Anfragen bekommen den Standort ihres Termins. Danach ist
-- "studioId ist leer" gleichbedeutend mit "kam ohne Terminauswahl herein,
-- bevor es dieses Feld gab" - und nicht mehr mit "hat einen Termin, aber
-- wir wissen nicht wo".
UPDATE "Booking" b
   SET "studioId" = s."studioId"
  FROM "AvailabilitySlot" s
 WHERE b."slotId" = s."id";

-- Wird ein Studio gelöscht, bleibt die Anfrage bestehen und verliert nur
-- ihre Zuordnung. Eine Anfrage mit Namen und Telefonnummer verschwinden zu
-- lassen, weil ein Standort geschlossen hat, wäre die schlechtere Variante.
ALTER TABLE "Booking"
  ADD CONSTRAINT "Booking_studioId_fkey"
  FOREIGN KEY ("studioId") REFERENCES "StudioLocation"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Booking_studioId_idx" ON "Booking"("studioId");
