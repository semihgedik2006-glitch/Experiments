-- Freier Terminwunsch an einer Buchungsanfrage.
--
-- Die festen Zeiten decken nicht ab, was Interessenten tatsächlich fragen:
-- "am liebsten abends nach 18 Uhr" oder "nur samstags". Bisher landete das
-- im Nachrichtenfeld oder gar nicht. Als eigenes Feld steht es an der
-- Anfrage, wo man beim Zurückrufen hinschaut - und geht in die Tabelle mit.
ALTER TABLE "Booking" ADD COLUMN "terminWunsch" TEXT;
