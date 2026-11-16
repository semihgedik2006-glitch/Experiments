-- Kopie jeder neuen Anfrage an die Leitung (siehe sendAnfrageKopieEmail).
ALTER TYPE "MailArt" ADD VALUE IF NOT EXISTS 'ANFRAGE_KOPIE';
