-- Bitte um eine Bewertung und WhatsApp als Kontaktweg.

-- Der Link, unter dem man diesem Standort eine Google-Bewertung schreibt.
-- Je Standort ein eigener: Eine Bewertung, die beim falschen Studio
-- landet, hilft dem richtigen nicht.
ALTER TABLE "StudioLocation" ADD COLUMN "googleReviewUrl" TEXT;

-- WhatsApp-Nummer des Standorts. Bewusst getrennt vom Telefonfeld: Nicht
-- jede Festnetznummer ist auch bei WhatsApp erreichbar, und ein Knopf,
-- der ins Leere führt, ist schlimmer als keiner.
ALTER TABLE "StudioLocation" ADD COLUMN "whatsapp" TEXT;

-- Einmal fragen, nicht mehr. Ohne diesen Merker käme die Bitte bei jedem
-- täglichen Lauf erneut.
ALTER TABLE "Booking" ADD COLUMN "bewertungGesendetAm" TIMESTAMP(3);

-- Neue Art im Mail-Protokoll.
ALTER TYPE "MailArt" ADD VALUE 'BEWERTUNG';
