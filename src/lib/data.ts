import { prisma } from "@/lib/prisma";
import { freiePlaetze } from "@/lib/kapazitaet";

export async function getStudio() {
  return prisma.studioLocation.findFirst({ orderBy: { sortOrder: "asc" } });
}

export async function getStudios() {
  return prisma.studioLocation.findMany({ orderBy: { sortOrder: "asc" } });
}

/**
 * Alle kommenden Termine mit der Zahl der freien Plätze.
 *
 * Belegte Termine werden mitgeliefert und nicht mehr weggefiltert: Sie
 * sind der Einstieg in die Warteliste. Wer sie nicht sieht, kann sich auch
 * nicht eintragen - und bekommt stattdessen die Fehlermeldung "leider
 * ausgebucht", wenn er zufällig im falschen Moment absendet.
 */
export async function getSlotsMitBelegung(studioId?: string) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const slots = await prisma.availabilitySlot.findMany({
    where: { date: { gte: startOfToday }, ...(studioId ? { studioId } : {}) },
    include: {
      bookings: {
        where: { status: { not: "CANCELLED" } },
        select: { zuZweit: true },
      },
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }, { id: "asc" }],
  });

  return slots.map((slot) => ({
    ...slot,
    frei: freiePlaetze(slot.capacity, slot.bookings),
  }));
}

/** Nur die Termine, in die noch jemand hineinpasst. */
export async function getUpcomingSlots(studioId?: string) {
  return (await getSlotsMitBelegung(studioId)).filter((slot) => slot.frei > 0);
}

export async function getPublishedPosts(limit?: number) {
  return prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

export async function getPostBySlug(slug: string) {
  return prisma.blogPost.findFirst({ where: { slug, published: true } });
}

export async function getFaqItems() {
  return prisma.faqItem.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getApprovedComments(postId: string) {
  return prisma.comment.findMany({
    where: { postId, approved: true, parentId: null },
    orderBy: { createdAt: "desc" },
    include: {
      replies: {
        where: { approved: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}
