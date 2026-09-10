import "server-only";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { freiePlaetze } from "@/lib/kapazitaet";
import { sendWartelisteFreiEmail } from "@/lib/email";
import { siteConfig } from "@/lib/site-config";

/**
 * Wird ein Platz frei, rückt der Nächste nach.
 *
 * Aufgerufen überall dort, wo ein Platz frei werden kann: wenn das Studio
 * eine Buchung storniert, wenn ein Gast selbst absagt, und wenn ein Gast
 * seinen Termin auf eine andere Zeit legt (dann wird die alte frei).
 *
 * Zwei Regeln:
 *
 * Der Reihe nach. Wer sich zuerst eingetragen hat, wird zuerst gefragt -
 * alles andere wäre bei einer Warteliste schwer zu erklären.
 *
 * Nur, wer hineinpasst. Wird ein Platz frei und der Nächste kommt zu
 * zweit, wird der übersprungen statt eine Zusage zu bekommen, die nicht
 * einzuhalten ist. Er behält seinen Platz in der Reihe.
 *
 * Diese Funktion wirft nicht: Eine Stornierung darf nicht daran scheitern,
 * dass eine Benachrichtigung hakt.
 */
export async function wartelisteBenachrichtigen(slotId: string | null | undefined) {
  if (!slotId) return { benachrichtigt: 0 };

  try {
    const slot = await prisma.availabilitySlot.findUnique({
      where: { id: slotId },
      include: {
        studio: true,
        bookings: { where: { status: { not: "CANCELLED" } }, select: { zuZweit: true } },
      },
    });
    if (!slot) return { benachrichtigt: 0 };

    // Termine in der Vergangenheit sind kein Angebot mehr.
    const heute = new Date();
    heute.setHours(0, 0, 0, 0);
    if (slot.date < heute) return { benachrichtigt: 0 };

    let frei = freiePlaetze(slot.capacity, slot.bookings);
    if (frei <= 0) return { benachrichtigt: 0 };

    const wartende = await prisma.warteliste.findMany({
      where: { slotId, benachrichtigtAm: null },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });

    const terminZeile = `${formatDate(slot.date)} um ${slot.startTime} Uhr`;
    let benachrichtigt = 0;

    for (const eintrag of wartende) {
      const braucht = eintrag.zuZweit ? 2 : 1;
      if (braucht > frei) continue;

      const ok = await sendWartelisteFreiEmail({
        email: eintrag.email,
        name: eintrag.name,
        terminZeile,
        studioName: slot.studio?.name ?? null,
        studioAdresse: slot.studio
          ? `${slot.studio.street}, ${slot.studio.postalCode} ${slot.studio.city}`
          : null,
        link: slot.studio
          ? `${siteConfig.url}/studio/${slot.studio.slug}#termin`
          : `${siteConfig.url}/probetermin`,
      });

      // Auch ein gescheiterter Versuch wird vermerkt: Sonst bekäme dieselbe
      // Person bei der nächsten Stornierung eine zweite Mail zu einem
      // Termin, für den sie längst zu spät ist.
      await prisma.warteliste.update({
        where: { id: eintrag.id },
        data: { benachrichtigtAm: new Date() },
      });

      if (ok) benachrichtigt++;
      // Der Platz gilt als vergeben, sobald jemand gefragt wurde - sonst
      // bekämen bei einem freien Platz alle gleichzeitig Bescheid.
      frei -= braucht;
      if (frei <= 0) break;
    }

    return { benachrichtigt };
  } catch (error) {
    console.error("Warteliste konnte nicht benachrichtigt werden:", error);
    return { benachrichtigt: 0 };
  }
}
