-- CreateTable
CREATE TABLE "SlotTemplate" (
    "id" TEXT NOT NULL,
    "studioId" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SlotTemplate_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "AvailabilitySlot" ADD COLUMN "templateId" TEXT;

-- CreateIndex
CREATE INDEX "SlotTemplate_studioId_idx" ON "SlotTemplate"("studioId");

-- CreateIndex
CREATE INDEX "AvailabilitySlot_templateId_idx" ON "AvailabilitySlot"("templateId");

-- AddForeignKey
ALTER TABLE "SlotTemplate" ADD CONSTRAINT "SlotTemplate_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "StudioLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilitySlot" ADD CONSTRAINT "AvailabilitySlot_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "SlotTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
