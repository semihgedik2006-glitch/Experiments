-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_slotId_fkey";

-- AlterTable: a booking can now exist without pointing at a specific slot
-- (visitor only left a preferred day/time instead of picking one)
ALTER TABLE "Booking" ALTER COLUMN "slotId" DROP NOT NULL;

-- AddForeignKey: keep the booking (and the customer's contact info) if the
-- slot it referenced gets deleted, instead of cascading the delete onto it
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "AvailabilitySlot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
