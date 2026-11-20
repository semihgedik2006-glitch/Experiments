-- Vorschläge von Nox für FAQ und Studio-Texte. Sichtbar wird davon nichts,
-- bis jemand im Adminbereich auf "Übernehmen" drückt.
CREATE TABLE "NoxEntwurf" (
    "id" TEXT NOT NULL,
    "art" TEXT NOT NULL,
    "studioId" TEXT,
    "feld" TEXT,
    "frage" TEXT,
    "frageEn" TEXT,
    "text" TEXT NOT NULL,
    "textEn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NoxEntwurf_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "NoxEntwurf_art_idx" ON "NoxEntwurf"("art");
