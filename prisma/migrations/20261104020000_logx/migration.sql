-- LogX-Anbindung (TryNow): Zugang je Studio und die Terminnummer in LogX
-- an der Anfrage. Alles optional; ohne Zugang ändert sich nichts.
ALTER TABLE "StudioLocation" ADD COLUMN "logxStudioHash" TEXT;
ALTER TABLE "StudioLocation" ADD COLUMN "logxProfileId" INTEGER;
ALTER TABLE "StudioLocation" ADD COLUMN "logxApiKey" TEXT;
ALTER TABLE "Booking" ADD COLUMN "logxAppointmentId" INTEGER;
ALTER TABLE "Booking" ADD COLUMN "logxGebuchtAm" TIMESTAMP(3);
