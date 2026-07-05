import "server-only";
import { prisma } from "@/lib/prisma";

const GENERATE_DAYS_AHEAD = 60;

function nextDatesForWeekday(weekday: number, daysAhead: number): Date[] {
  const dates: Date[] = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  for (let offset = 0; offset <= daysAhead; offset++) {
    const date = new Date(start);
    date.setDate(start.getDate() + offset);
    if (date.getDay() === weekday) dates.push(date);
  }

  return dates;
}

// Fills in any missing AvailabilitySlot rows for one recurring template,
// for the next ~60 days. Safe to call repeatedly - already-generated
// slots for a date are never duplicated.
export async function syncSlotsForTemplate(template: {
  id: string;
  studioId: string;
  weekday: number;
  startTime: string;
  endTime: string;
  capacity: number;
}) {
  const dates = nextDatesForWeekday(template.weekday, GENERATE_DAYS_AHEAD);
  if (dates.length === 0) return 0;

  const existing = await prisma.availabilitySlot.findMany({
    where: { templateId: template.id, date: { in: dates } },
    select: { date: true },
  });
  const existingDateKeys = new Set(existing.map((slot) => slot.date.toISOString().slice(0, 10)));

  const missingDates = dates.filter((date) => !existingDateKeys.has(date.toISOString().slice(0, 10)));
  if (missingDates.length === 0) return 0;

  await prisma.availabilitySlot.createMany({
    data: missingDates.map((date) => ({
      studioId: template.studioId,
      templateId: template.id,
      date,
      startTime: template.startTime,
      endTime: template.endTime,
      capacity: template.capacity,
    })),
  });

  return missingDates.length;
}

export async function syncSlotsForAllTemplates() {
  const templates = await prisma.slotTemplate.findMany();
  let created = 0;
  for (const template of templates) {
    created += await syncSlotsForTemplate(template);
  }
  return { templates: templates.length, created };
}

// Removes not-yet-booked future slots generated from a template - used
// right before deleting the template, so no orphaned open slots remain.
// Slots that already have a (non-cancelled) booking are left untouched.
export async function deleteUnbookedFutureSlotsForTemplate(templateId: string) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  await prisma.availabilitySlot.deleteMany({
    where: {
      templateId,
      date: { gte: startOfToday },
      bookings: { none: { status: { not: "CANCELLED" } } },
    },
  });
}
