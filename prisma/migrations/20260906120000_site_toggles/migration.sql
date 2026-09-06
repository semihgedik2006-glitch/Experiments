-- Ein-/ausschaltbare Bereiche der Website.
CREATE TABLE "SiteToggle" (
    "key" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteToggle_pkey" PRIMARY KEY ("key")
);
