-- Benachrichtigung des Studios über einen neuen Wartelisteneintrag.
--
-- Ohne sie erfährt das Studio von jemandem, der sich eingetragen hat,
-- erst, wenn zufällig jemand in die Warteliste schaut. Das ist ein Lead
-- wie jeder andere - nur mit dem Zusatz, dass seine Wunschzeit belegt
-- ist.
ALTER TYPE "MailArt" ADD VALUE IF NOT EXISTS 'WARTELISTE_INTERN';
