import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@koerperformen.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "aendern-Sie-mich123";

  const existingAdmin = await prisma.adminUser.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.adminUser.create({ data: { email: adminEmail, passwordHash } });
    console.log(`Admin-Account erstellt: ${adminEmail}`);
  }

  const existingStudio = await prisma.studioLocation.findFirst();
  if (!existingStudio) {
    await prisma.studioLocation.create({
      data: {
        name: "Körperformen Hürth",
        street: "Musterstraße 1",
        postalCode: "50354",
        city: "Hürth",
        phone: "+49 2233 000000",
        email: "info@koerperformen.com",
        mapEmbedUrl:
          "https://www.google.com/maps?q=H%C3%BCrth&output=embed",
        openingHours:
          "Montag - Freitag: 09:00 - 21:00 Uhr\nSamstag: 09:00 - 14:00 Uhr\nSonntag: geschlossen",
      },
    });
    console.log("Studio-Standort angelegt.");
  }

  const existingSlots = await prisma.availabilitySlot.count();
  if (existingSlots === 0) {
    const now = new Date();
    const slots = [];
    for (let day = 1; day <= 10; day++) {
      const date = new Date(now);
      date.setDate(now.getDate() + day);
      const weekday = date.getDay();
      if (weekday === 0) continue; // Sonntag geschlossen

      const times = ["09:00", "11:00", "14:00", "16:00", "18:00"];
      for (const startTime of times) {
        const [h, m] = startTime.split(":").map(Number);
        const endHour = m === 30 ? h + 1 : h;
        const endMinute = m === 30 ? 0 : 30;
        const endTime = `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`;
        slots.push({ date, startTime, endTime, capacity: 1 });
      }
    }
    await prisma.availabilitySlot.createMany({ data: slots });
    console.log(`${slots.length} Verfügbarkeits-Slots angelegt.`);
  }

  const existingPosts = await prisma.blogPost.count();
  if (existingPosts === 0) {
    await prisma.blogPost.createMany({
      data: [
        {
          slug: "was-ist-ems-training",
          title: "Was ist EMS-Training und wie funktioniert es?",
          excerpt:
            "EMS steht für Elektro-Muskel-Stimulation. Wir erklären, wie das Training funktioniert und warum 20 Minuten pro Woche ausreichen.",
          content:
            "EMS-Training kombiniert klassische Bewegungsübungen mit elektrischen Impulsen, die über eine spezielle Weste direkt auf die Muskulatur wirken. Dadurch werden bis zu 90% der Muskelfasern aktiviert - deutlich mehr als beim klassischen Training. Das Ergebnis: ein intensives Ganzkörpertraining in nur 20 Minuten, einmal pro Woche.",
          published: true,
          publishedAt: new Date(),
        },
        {
          slug: "ems-fuer-berufstaetige",
          title: "EMS-Training für Berufstätige mit wenig Zeit",
          excerpt:
            "Kein Zeitaufwand für Anfahrt, Umziehen oder lange Trainingseinheiten. So passt effektives Training in einen vollen Alltag.",
          content:
            "Gerade für Berufstätige zwischen 30 und 70 Jahren ist Zeit die knappste Ressource. Ein EMS-Training bei Körperformen dauert inklusive Beratung nur rund 20 Minuten - ganz ohne stundenlange Einheiten im Fitnessstudio. So bleibt Training auch im stressigen Alltag machbar.",
          published: true,
          publishedAt: new Date(),
        },
      ],
    });
    console.log("Beispiel-Blogartikel angelegt.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
