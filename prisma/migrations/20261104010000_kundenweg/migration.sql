-- Fortschritt einer Anfrage (Status-Leiste im Adminbereich), zwei neue
-- Mailarten und die Google-Place-ID der Studios.

CREATE TYPE "Fortschritt" AS ENUM ('NEU', 'ANGERUFEN', 'NICHT_ERREICHT', 'TERMIN_VEREINBART', 'ERSCHIENEN', 'NICHT_ERSCHIENEN', 'MITGLIED', 'KEIN_INTERESSE');

ALTER TABLE "Booking" ADD COLUMN "fortschritt" "Fortschritt" NOT NULL DEFAULT 'NEU';
ALTER TABLE "Booking" ADD COLUMN "fortschrittAm" TIMESTAMP(3);
ALTER TABLE "Booking" ADD COLUMN "nichtErschienenGesendetAm" TIMESTAMP(3);

-- Bestehende Anfragen einordnen, so gut es die Daten hergeben:
-- bestätigte haben einen vereinbarten Termin; liegt der schon in der
-- Vergangenheit, wissen wir trotzdem nicht, ob der Gast kam - deshalb
-- bleibt es bei "Termin vereinbart". Stornierte und offene bleiben "neu";
-- das Studio kann sie in der Liste einordnen.
UPDATE "Booking" SET "fortschritt" = 'TERMIN_VEREINBART' WHERE "status" = 'CONFIRMED';

CREATE INDEX "Booking_fortschritt_idx" ON "Booking"("fortschritt");

ALTER TYPE "MailArt" ADD VALUE 'NICHT_ERSCHIENEN';
ALTER TYPE "MailArt" ADD VALUE 'TAGESLISTE';

ALTER TABLE "StudioLocation" ADD COLUMN "googlePlaceId" TEXT;
