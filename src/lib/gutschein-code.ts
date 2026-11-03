import "server-only";
import { prisma } from "@/lib/prisma";
import { neuerGutscheinCode } from "@/lib/gutschein-verwaltung";

/**
 * Einen Code finden, den es noch nicht gibt.
 *
 * Bei rund 500 Milliarden Möglichkeiten trifft schon der erste Versuch;
 * die Schleife ist nur dafür da, dass ein Zufallstreffer nicht als Fehler
 * beim Kunden ankommt.
 */
export async function freierGutscheinCode(): Promise<string> {
  for (let versuch = 0; versuch < 5; versuch++) {
    const code = neuerGutscheinCode();
    const vorhanden = await prisma.gutschein.findUnique({ where: { code }, select: { id: true } });
    if (!vorhanden) return code;
  }
  throw new Error("Kein freier Gutscheincode gefunden.");
}
