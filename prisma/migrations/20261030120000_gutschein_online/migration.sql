-- AlterTable
ALTER TABLE "Gutschein" ADD COLUMN     "karteToken" TEXT,
ADD COLUMN     "stripeSessionId" TEXT,
ADD COLUMN     "zahlweg" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Gutschein_stripeSessionId_key" ON "Gutschein"("stripeSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Gutschein_karteToken_key" ON "Gutschein"("karteToken");
