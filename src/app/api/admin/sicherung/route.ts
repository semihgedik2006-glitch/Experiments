import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

/**
 * Vollständiger Datenexport als JSON-Datei.
 *
 * Gedacht als Sicherung, die man selbst in der Hand hat: eine Datei, die
 * man herunterlädt und irgendwo hinlegt, wo sie nicht mit der Datenbank
 * zusammen verloren gehen kann. Sie ersetzt keine Sicherung beim
 * Datenbankanbieter (siehe /admin/sicherung), aber sie schließt die Lücke
 * bis dahin und schützt vor dem häufigeren Fall: versehentlich gelöscht.
 *
 * Enthalten sind auch Namen, E-Mail-Adressen und Telefonnummern von
 * Interessenten. Deshalb ohne Anmeldung kein Zugriff - und deshalb gehört
 * die Datei nicht in eine Cloud, die nicht euch gehört.
 *
 * Das Administrator-Passwort wird bewusst NICHT mitgesichert: Ein Abzug
 * der Anmeldedaten in einer Datei auf einem Schreibtischrechner ist ein
 * Risiko, dem kein Nutzen gegenübersteht - ein neues Passwort ist schneller
 * gesetzt als ein altes wiederhergestellt.
 */
export async function GET() {
  const adminId = await getAdminSession();
  if (!adminId) {
    return Response.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  const [
    studios,
    slotTemplates,
    availabilitySlots,
    bookings,
    blogPosts,
    comments,
    faqItems,
    contactMessages,
    newsletterSubscribers,
    siteToggles,
  ] = await Promise.all([
    prisma.studioLocation.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.slotTemplate.findMany(),
    prisma.availabilitySlot.findMany(),
    prisma.booking.findMany(),
    prisma.blogPost.findMany(),
    prisma.comment.findMany(),
    prisma.faqItem.findMany(),
    prisma.contactMessage.findMany(),
    prisma.newsletterSubscriber.findMany(),
    prisma.siteToggle.findMany().catch(() => []),
  ]);

  const daten = {
    erzeugtAm: new Date().toISOString(),
    hinweis:
      "Datenexport der Körperformen-Website. Enthält personenbezogene Daten - bitte entsprechend aufbewahren.",
    inhalt: {
      studios,
      slotTemplates,
      availabilitySlots,
      bookings,
      blogPosts,
      comments,
      faqItems,
      contactMessages,
      newsletterSubscribers,
      siteToggles,
    },
  };

  const datum = new Date().toISOString().slice(0, 10);

  return new Response(JSON.stringify(daten, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="koerperformen-sicherung-${datum}.json"`,
      // Eine Sicherung darf nie aus einem Zwischenspeicher kommen.
      "Cache-Control": "no-store",
    },
  });
}
