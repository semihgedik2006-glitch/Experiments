-- Englische Fassungen der Texte aus dem Adminbereich (für /en).
-- Alle freiwillig: Leer heißt, auf der englischen Seite steht der deutsche Text.
ALTER TABLE "StudioLocation" ADD COLUMN "openingHoursEn" TEXT;
ALTER TABLE "StudioLocation" ADD COLUMN "introEn" TEXT;
ALTER TABLE "StudioLocation" ADD COLUMN "anfahrtEn" TEXT;

ALTER TABLE "Trainer" ADD COLUMN "rolleEn" TEXT;
ALTER TABLE "Trainer" ADD COLUMN "qualifikationEn" TEXT;
ALTER TABLE "Trainer" ADD COLUMN "textEn" TEXT;

ALTER TABLE "BlogPost" ADD COLUMN "titleEn" TEXT;
ALTER TABLE "BlogPost" ADD COLUMN "excerptEn" TEXT;
ALTER TABLE "BlogPost" ADD COLUMN "contentEn" TEXT;

ALTER TABLE "FaqItem" ADD COLUMN "questionEn" TEXT;
ALTER TABLE "FaqItem" ADD COLUMN "answerEn" TEXT;

ALTER TABLE "SiteText" ADD COLUMN "wertEn" TEXT;

ALTER TABLE "Tarif" ADD COLUMN "nameEn" TEXT;
ALTER TABLE "Tarif" ADD COLUMN "untertitelEn" TEXT;
ALTER TABLE "Tarif" ADD COLUMN "preisEn" TEXT;
ALTER TABLE "Tarif" ADD COLUMN "preisZusatzEn" TEXT;
ALTER TABLE "Tarif" ADD COLUMN "leistungenEn" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Tarif" ADD COLUMN "hinweisEn" TEXT;

ALTER TABLE "Zusatzangebot" ADD COLUMN "nameEn" TEXT;
ALTER TABLE "Zusatzangebot" ADD COLUMN "textEn" TEXT;
ALTER TABLE "Zusatzangebot" ADD COLUMN "preisEn" TEXT;

ALTER TABLE "Verwandlung" ADD COLUMN "zeitraumEn" TEXT;
ALTER TABLE "Verwandlung" ADD COLUMN "kontextEn" TEXT;
ALTER TABLE "Verwandlung" ADD COLUMN "textEn" TEXT;

ALTER TABLE "Kundenstimme" ADD COLUMN "textEn" TEXT;
