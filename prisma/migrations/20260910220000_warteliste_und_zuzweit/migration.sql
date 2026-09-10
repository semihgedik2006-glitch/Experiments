-- Warteliste für belegte Zeiten und die Angabe "wir kommen zu zweit".

-- Zwei Personen belegen zwei Plätze. Ohne diese Angabe stünde bei einem
-- Termin für eine Person plötzlich ein Paar - und der Trainer hätte für
-- eine Weste zu viel keinen Anschluss.
ALTER TABLE "Booking" ADD COLUMN "zuZweit" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "Warteliste" (
  "id"               TEXT NOT NULL,
  "slotId"           TEXT NOT NULL,
  "studioId"         TEXT,
  "name"             TEXT NOT NULL,
  "email"            TEXT NOT NULL,
  "phone"            TEXT NOT NULL,
  "erreichbarkeit"   TEXT,
  "zuZweit"          BOOLEAN NOT NULL DEFAULT false,
  -- Wann diesem Eintrag Bescheid gegeben wurde, dass etwas frei ist.
  -- Verhindert, dass dieselbe Person bei jedem Freiwerden erneut
  -- angeschrieben wird.
  "benachrichtigtAm" TIMESTAMP(3),
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Warteliste_pkey" PRIMARY KEY ("id")
);

-- Verschwindet der Termin, verschwindet auch die Warteliste dazu: Sie
-- hätte ohne ihn keine Bedeutung mehr.
ALTER TABLE "Warteliste"
  ADD CONSTRAINT "Warteliste_slotId_fkey"
  FOREIGN KEY ("slotId") REFERENCES "AvailabilitySlot"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Der Standort bleibt dagegen erhalten, wenn das Studio gelöscht wird -
-- sonst verlöre eine Studioleitung ihre Liste, weil jemand aufgeräumt hat.
ALTER TABLE "Warteliste"
  ADD CONSTRAINT "Warteliste_studioId_fkey"
  FOREIGN KEY ("studioId") REFERENCES "StudioLocation"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Warteliste_slotId_idx" ON "Warteliste"("slotId");
CREATE INDEX "Warteliste_studioId_idx" ON "Warteliste"("studioId");

ALTER TYPE "MailArt" ADD VALUE 'WARTELISTE_FREI';
