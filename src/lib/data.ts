import { prisma } from "@/lib/prisma";

export async function getStudio() {
  return prisma.studioLocation.findFirst();
}

export async function getUpcomingSlots() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const slots = await prisma.availabilitySlot.findMany({
    where: { date: { gte: startOfToday } },
    include: { bookings: { where: { status: { not: "CANCELLED" } } } },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  return slots.filter((slot) => slot.bookings.length < slot.capacity);
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
