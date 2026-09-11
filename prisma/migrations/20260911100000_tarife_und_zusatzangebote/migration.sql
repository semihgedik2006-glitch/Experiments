-- Preisübersicht und Zusatzangebote.
--
-- Beides erscheint nur, wenn etwas eingetragen ist. Die Preisseite sagt
-- bisher ausdrücklich, dass dort keine Preisliste steht - das ist eine
-- Entscheidung des Studios und keine Lücke. Diese Tabellen ändern daran
-- nichts, sie machen nur möglich, es anders zu handhaben.

-- Änderbare Einzeltexte. Gegenstück zu SiteToggle: dort ein Schalter je
-- Bereich, hier ein Text je Schlüssel. Gebraucht für den Preishinweis -
-- eine rechtlich geforderte Angabe (§ 3 PAngV), deren Wortlaut vom Studio
-- kommen muss und nicht aus dem Code.
CREATE TABLE IF NOT EXISTS "SiteText" (
  "key"       TEXT NOT NULL,
  "wert"      TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SiteText_pkey" PRIMARY KEY ("key")
);

-- Tarife. Der Preis steht als Text da, nicht als Zahl: "ab 69 €",
-- "auf Anfrage" und "89 € / Monat" sind alle zulässig und alle keine Zahl.
CREATE TABLE IF NOT EXISTS "Tarif" (
  "id"          TEXT NOT NULL,
  "name"        TEXT NOT NULL,
  "untertitel"  TEXT,
  "preis"       TEXT,
  "preisZusatz" TEXT,
  "leistungen"  TEXT[] NOT NULL DEFAULT '{}',
  "empfohlen"   BOOLEAN NOT NULL DEFAULT false,
  "hinweis"     TEXT,
  "aktiv"       BOOLEAN NOT NULL DEFAULT true,
  "sortOrder"   INTEGER NOT NULL DEFAULT 0,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Tarif_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Tarif_sortOrder_idx" ON "Tarif"("sortOrder");

-- Zusatzangebote. nurStudios leer heißt: an allen Standorten.
CREATE TABLE IF NOT EXISTS "Zusatzangebot" (
  "id"         TEXT NOT NULL,
  "name"       TEXT NOT NULL,
  "text"       TEXT,
  "preis"      TEXT,
  "symbol"     TEXT NOT NULL DEFAULT 'sonstiges',
  "nurStudios" TEXT[] NOT NULL DEFAULT '{}',
  "aktiv"      BOOLEAN NOT NULL DEFAULT true,
  "sortOrder"  INTEGER NOT NULL DEFAULT 0,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Zusatzangebot_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Zusatzangebot_sortOrder_idx" ON "Zusatzangebot"("sortOrder");
