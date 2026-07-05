import { prisma } from "@/lib/prisma";

export async function getStudio() {
  return prisma.studioLocation.findFirst({ orderBy: { sortOrder: "asc" } });
}

export async function getStudios() {
  return prisma.studioLocation.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getUpcomingSlots(studioId?: string) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const slots = await prisma.availabilitySlot.findMany({
    where: { date: { gte: startOfToday }, ...(studioId ? { studioId } : {}) },
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
