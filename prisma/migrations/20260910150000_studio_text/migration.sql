-- Eigener Text je Standort.
--
-- Vierzehn Unterseiten, die sich nur in Adresse und Öffnungszeiten
-- unterscheiden, sind für Google vierzehn fast gleiche Seiten - und die
-- wertet Google ab. Diese beiden Felder sind der Platz für das, was
-- wirklich nur an diesem Standort gilt: das Studio selbst und der Weg
-- dorthin.
ALTER TABLE "StudioLocation" ADD COLUMN "intro" TEXT;
ALTER TABLE "StudioLocation" ADD COLUMN "anfahrt" TEXT;
