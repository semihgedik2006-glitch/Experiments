-- Eigene Adresse je Standort: /studio/koeln-nippes statt eines Sprungziels
-- auf einer gemeinsamen Seite.
--
-- Die Regeln hier müssen mit src/lib/slug.ts übereinstimmen. Neue
-- Standorte bekommen ihren Wert von dort, die vorhandenen einmalig hier.

ALTER TABLE "StudioLocation" ADD COLUMN "slug" TEXT;

-- Markenname weg, Umlaute ausgeschrieben, alles Übrige zu Bindestrichen.
-- Die Umlaute werden vor dem Kleinschreiben ersetzt, damit das Ergebnis
-- nicht davon abhängt, wie die Datenbank Groß- und Kleinschreibung
-- außerhalb des lateinischen Grundalphabets behandelt.
UPDATE "StudioLocation"
SET "slug" = trim(both '-' from regexp_replace(
  lower(
    replace(replace(replace(replace(replace(replace(replace(
      replace(name, 'Körperformen ', ''),
    'ä', 'ae'), 'Ä', 'Ae'), 'ö', 'oe'), 'Ö', 'Oe'), 'ü', 'ue'), 'Ü', 'Ue'), 'ß', 'ss')
  ),
  '[^a-z0-9]+', '-', 'g'));

-- Ein Standort, dessen Name nur aus dem Markennamen bestand, hätte jetzt
-- eine leere Adresse. Der Rückfall auf die Kennung ist hässlich, aber
-- eindeutig - und im Adminbereich änderbar.
UPDATE "StudioLocation" SET "slug" = 'studio-' || id WHERE "slug" IS NULL OR "slug" = '';

-- Zwei Standorte mit gleichem Ortsnamen wären sonst dieselbe Adresse.
-- Der zweite bekommt eine angehängte Ziffer; welcher der erste ist,
-- entscheidet die Reihenfolge aus dem Adminbereich.
WITH doppelte AS (
  SELECT id, "slug",
         row_number() OVER (PARTITION BY "slug" ORDER BY "sortOrder", id) AS nr
    FROM "StudioLocation"
)
UPDATE "StudioLocation" s
   SET "slug" = d."slug" || '-' || d.nr
  FROM doppelte d
 WHERE s.id = d.id AND d.nr > 1;

ALTER TABLE "StudioLocation" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "StudioLocation_slug_key" ON "StudioLocation"("slug");
