import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

/**
 * Der LogX-Schlüssel der Studios ist grundsätzlich ausgeblendet.
 *
 * Studiodaten werden an vielen Stellen vollständig geladen und an
 * Bausteine im Browser weitergereicht (Buchungsformular, Karte ...). Ohne
 * diese Regel stünde der Schlüssel dann im Quelltext der Seite. Wer ihn
 * braucht (@/lib/actions/logx, Buchung), fragt ihn mit select ausdrücklich ab.
 */
function neuerClient() {
  return new PrismaClient({ adapter, omit: { studioLocation: { logxApiKey: true } } });
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof neuerClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? neuerClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
