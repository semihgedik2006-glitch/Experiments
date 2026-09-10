-- Das Ziel des Interessenten.
--
-- Ersetzt das freie Feld "Wunschzeit" im Anfrageformular. Die Spalte
-- "terminWunsch" bleibt bestehen: An bereits eingegangenen Anfragen steht
-- dort echter Text von echten Menschen, und der darf nicht verschwinden,
-- nur weil das Feld künftig nicht mehr abgefragt wird.
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "ziel" TEXT;
