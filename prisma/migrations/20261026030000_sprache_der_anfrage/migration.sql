-- Sprache der Seite, auf der angefragt wurde: Danach richten sich die
-- E-Mails an den Gast, und das Studio sieht, wer auf Englisch angefragt hat.
-- Bestehende Anfragen kamen alle von der deutschen Seite.
ALTER TABLE "Booking" ADD COLUMN "sprache" TEXT NOT NULL DEFAULT 'de';
ALTER TABLE "Warteliste" ADD COLUMN "sprache" TEXT NOT NULL DEFAULT 'de';
