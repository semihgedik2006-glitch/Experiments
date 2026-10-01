-- info@koerperformen.com nimmt keine E-Mails an: Die Domain gehört nicht
-- Körperformen (sie steht bei einem Domain-Marktplatz, MX "0 ."). Die
-- Adresse kam aus den Startdaten und stand beim Studio Hürth. Anfrage-Mails
-- dorthin wären zurückgekommen.
--
-- Ersetzt wird NUR genau diese Adresse. Wer im Adminbereich schon eine
-- andere eingetragen hat, behält sie.
UPDATE "StudioLocation"
SET "email" = 'huerth@kformen.com'
WHERE lower("email") = 'info@koerperformen.com';
