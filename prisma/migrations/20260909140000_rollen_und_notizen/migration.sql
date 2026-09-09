-- Rollen für den Adminbereich und Bindung eines Zugangs an einen Standort.
CREATE TYPE "AdminRole" AS ENUM ('LEITUNG', 'STUDIOLEITUNG');

ALTER TABLE "AdminUser" ADD COLUMN "name" TEXT;
ALTER TABLE "AdminUser" ADD COLUMN "role" "AdminRole" NOT NULL DEFAULT 'LEITUNG';
ALTER TABLE "AdminUser" ADD COLUMN "studioId" TEXT;

-- Beim Löschen eines Studios bleibt der Zugang bestehen und verliert nur
-- seine Zuordnung. Ein Zugang, der durch ein gelöschtes Studio plötzlich
-- alles sähe, wäre die gefährlichere Variante.
ALTER TABLE "AdminUser"
  ADD CONSTRAINT "AdminUser_studioId_fkey"
  FOREIGN KEY ("studioId") REFERENCES "StudioLocation"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "AdminUser_studioId_idx" ON "AdminUser"("studioId");

-- Interner Vermerk an einer Buchung.
ALTER TABLE "Booking" ADD COLUMN "internalNote" TEXT;
