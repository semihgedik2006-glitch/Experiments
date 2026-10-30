-- CreateEnum
CREATE TYPE "GutscheinStatus" AS ENUM ('ANGEFRAGT', 'AUSGESTELLT', 'EINGELOEST', 'STORNIERT');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MailArt" ADD VALUE 'MITGLIED_WILLKOMMEN';
ALTER TYPE "MailArt" ADD VALUE 'MITGLIED_JUBILAEUM';
ALTER TYPE "MailArt" ADD VALUE 'MITGLIED_UMFRAGE';
ALTER TYPE "MailArt" ADD VALUE 'MITGLIEDER_INTERN';
ALTER TYPE "MailArt" ADD VALUE 'GUTSCHEIN_EINGANG';
ALTER TYPE "MailArt" ADD VALUE 'GUTSCHEIN_INTERN';

-- CreateTable
CREATE TABLE "Mitglied" (
    "id" TEXT NOT NULL,
    "logxNummer" TEXT,
    "vorname" TEXT NOT NULL,
    "nachname" TEXT NOT NULL,
    "email" TEXT,
    "studioId" TEXT,
    "vertragsbeginn" TIMESTAMP(3),
    "laufzeitMonate" INTEGER,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "werbungErlaubt" BOOLEAN NOT NULL DEFAULT false,
    "werbungErlaubtAm" TIMESTAMP(3),
    "werbungQuelle" TEXT,
    "mailsAbbestellt" BOOLEAN NOT NULL DEFAULT false,
    "token" TEXT NOT NULL,
    "mailsVersandt" TEXT[],
    "umfrageNote" INTEGER,
    "umfrageKommentar" TEXT,
    "umfrageAm" TIMESTAMP(3),
    "nachgehaktAm" TIMESTAMP(3),
    "gespraechAm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mitglied_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gutschein" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "art" TEXT NOT NULL,
    "betrag" INTEGER NOT NULL,
    "status" "GutscheinStatus" NOT NULL DEFAULT 'ANGEFRAGT',
    "studioId" TEXT,
    "kaeuferName" TEXT NOT NULL,
    "kaeuferEmail" TEXT,
    "kaeuferTelefon" TEXT,
    "fuer" TEXT,
    "widmung" TEXT,
    "vorOrt" BOOLEAN NOT NULL DEFAULT false,
    "ausgestelltAm" TIMESTAMP(3),
    "gueltigBis" TIMESTAMP(3),
    "eingeloestAm" TIMESTAMP(3),
    "notiz" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gutschein_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kennzahl" (
    "id" TEXT NOT NULL,
    "studioId" TEXT NOT NULL,
    "monat" TIMESTAMP(3) NOT NULL,
    "mitglieder" INTEGER,
    "zugaenge" INTEGER,
    "kuendigungen" INTEGER,
    "pausen" INTEGER,
    "gespraeche" INTEGER,
    "zusatzverkaeufe" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kennzahl_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Mitglied_logxNummer_key" ON "Mitglied"("logxNummer");

-- CreateIndex
CREATE UNIQUE INDEX "Mitglied_token_key" ON "Mitglied"("token");

-- CreateIndex
CREATE INDEX "Mitglied_studioId_idx" ON "Mitglied"("studioId");

-- CreateIndex
CREATE INDEX "Mitglied_email_idx" ON "Mitglied"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Gutschein_code_key" ON "Gutschein"("code");

-- CreateIndex
CREATE INDEX "Gutschein_studioId_idx" ON "Gutschein"("studioId");

-- CreateIndex
CREATE INDEX "Gutschein_status_idx" ON "Gutschein"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Kennzahl_studioId_monat_key" ON "Kennzahl"("studioId", "monat");

-- AddForeignKey
ALTER TABLE "Mitglied" ADD CONSTRAINT "Mitglied_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "StudioLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gutschein" ADD CONSTRAINT "Gutschein_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "StudioLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kennzahl" ADD CONSTRAINT "Kennzahl_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "StudioLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
