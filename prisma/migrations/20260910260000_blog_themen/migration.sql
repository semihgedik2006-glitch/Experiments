-- Themen je Blogbeitrag.
--
-- Zweck: Verwandte Beiträge unter einem Artikel und ein Filter in der
-- Übersicht. Ohne Themen ist "verwandt" nur "zuletzt erschienen", und das
-- ist bei fünf Beiträgen zufällig.
--
-- Als Textliste und nicht als eigene Tabelle: Es gibt keine Eigenschaften
-- an einem Thema außer seinem Namen, und eine Verknüpfungstabelle für
-- reine Schlagwörter macht jedes Auslesen aufwendiger, ohne etwas zu
-- können.
ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "themen" TEXT[] NOT NULL DEFAULT '{}';

-- Startbelegung für die fünf mitgelieferten Beiträge.
--
-- Diese Texte stammen aus der Grundausstattung (prisma/seed.ts), nicht vom
-- Studio - die Themen dazu gehören deshalb ebenfalls dorthin. Ohne sie
-- wäre die Funktion beim Ausliefern unsichtbar, und niemand käme auf die
-- Idee, sie zu benutzen.
--
-- Nur dort, wo noch nichts steht: Ein zweiter Lauf überschreibt damit
-- keine Themen, die im Adminbereich vergeben wurden.
UPDATE "BlogPost" SET "themen" = ARRAY['Grundlagen','EMS erklärt']
  WHERE slug = 'was-ist-ems-training' AND cardinality("themen") = 0;
UPDATE "BlogPost" SET "themen" = ARRAY['Alltag','Wenig Zeit']
  WHERE slug = 'ems-fuer-berufstaetige' AND cardinality("themen") = 0;
UPDATE "BlogPost" SET "themen" = ARRAY['Rücken','Gesundheit']
  WHERE slug = 'ems-gegen-rueckenschmerzen' AND cardinality("themen") = 0;
UPDATE "BlogPost" SET "themen" = ARRAY['Abnehmen','Ernährung']
  WHERE slug = 'abnehmen-mit-ems' AND cardinality("themen") = 0;
UPDATE "BlogPost" SET "themen" = ARRAY['Grundlagen','EMS erklärt','Gesundheit']
  WHERE slug = '5-mythen-ueber-ems' AND cardinality("themen") = 0;
