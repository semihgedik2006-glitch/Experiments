-- AlterTable: geo-coordinates for nearest-studio lookup
ALTER TABLE "StudioLocation" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- AlterTable: link each slot to a studio (nullable first for backfill)
ALTER TABLE "AvailabilitySlot" ADD COLUMN     "studioId" TEXT;

-- Backfill existing slots onto the first studio (by sortOrder) so no data is lost
UPDATE "AvailabilitySlot"
SET "studioId" = (SELECT "id" FROM "StudioLocation" ORDER BY "sortOrder" ASC, "updatedAt" ASC LIMIT 1)
WHERE "studioId" IS NULL;

-- Make the column required now that existing rows are backfilled
ALTER TABLE "AvailabilitySlot" ALTER COLUMN "studioId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "AvailabilitySlot_studioId_idx" ON "AvailabilitySlot"("studioId");

-- AddForeignKey
ALTER TABLE "AvailabilitySlot" ADD CONSTRAINT "AvailabilitySlot_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "StudioLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
