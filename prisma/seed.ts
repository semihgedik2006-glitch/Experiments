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
        street: "Krankenhausstr. 111",
        postalCode: "50354",
        city: "Hürth",
        phone: "+49 2233 9667181",
        email: "info@koerperformen.com",
        mapEmbedUrl:
          "https://www.google.com/maps?q=Krankenhausstr.+111,+50354+H%C3%BCrth&output=embed",
        openingHours:
          "Montag - Freitag: 08:00 - 21:00 Uhr\nSamstag: 10:00 - 16:00 Uhr\nSonntag: geschlossen",
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

  // Artikel werden per Slug upserted - `npm run db:seed` kann also jederzeit
  // erneut laufen und ergänzt nur, was fehlt, ohne Bestehendes zu überschreiben.
  const articles = [
    {
      slug: "was-ist-ems-training",
      title: "Was ist EMS-Training und wie funktioniert es?",
      excerpt:
        "EMS steht für Elektro-Muskel-Stimulation. Wir erklären, wie das Training funktioniert und warum 20 Minuten pro Woche ausreichen.",
      content:
        "EMS-Training kombiniert klassische Bewegungsübungen mit elektrischen Impulsen, die über eine spezielle Weste direkt auf die Muskulatur wirken. Dadurch werden bis zu 90% der Muskelfasern aktiviert - deutlich mehr als beim klassischen Training. Das Ergebnis: ein intensives Ganzkörpertraining in nur 20 Minuten, einmal pro Woche.",
    },
    {
      slug: "ems-fuer-berufstaetige",
      title: "EMS-Training für Berufstätige mit wenig Zeit",
      excerpt:
        "Kein Zeitaufwand für Anfahrt, Umziehen oder lange Trainingseinheiten. So passt effektives Training in einen vollen Alltag.",
      content:
        "Gerade für Berufstätige zwischen 30 und 70 Jahren ist Zeit die knappste Ressource. Ein EMS-Training bei Körperformen dauert inklusive Beratung nur rund 20 Minuten - ganz ohne stundenlange Einheiten im Fitnessstudio. So bleibt Training auch im stressigen Alltag machbar.",
    },
    {
      slug: "ems-gegen-rueckenschmerzen",
      title: "EMS gegen Rückenschmerzen: Was steckt dahinter?",
      excerpt:
        "Rund 80% der Deutschen kennen Rückenschmerzen. Warum EMS-Training gerade die tiefe Rumpfmuskulatur erreicht, die klassisches Training oft verfehlt.",
      content:
        "Wer viel sitzt, kennt das Ziehen im unteren Rücken. Die Ursache ist selten ein einzelnes Ereignis, sondern meist eine schwache tiefliegende Rumpfmuskulatur, die die Wirbelsäule nicht mehr ausreichend stützt.\nGenau hier liegt die Stärke von EMS: Die elektrischen Impulse erreichen auch die tiefen Muskelschichten, die mit klassischen Übungen nur schwer gezielt trainierbar sind. Studien der Deutschen Sporthochschule Köln zeigen, dass regelmäßiges EMS-Training Rückenbeschwerden deutlich reduzieren kann.\nWichtig ist die richtige Betreuung: Bei Körperformen wird jede Einheit 1:1 begleitet, die Impulsstärke individuell dosiert und die Übungsauswahl an dein Beschwerdebild angepasst.\nUnser Tipp: Ergänze das wöchentliche Training mit kleinen Gewohnheiten im Alltag - regelmäßig aufstehen, Schulterkreisen am Schreibtisch, ein kurzer Spaziergang in der Mittagspause. Die Kombination macht den Unterschied.",
    },
    {
      slug: "abnehmen-mit-ems",
      title: "Abnehmen mit EMS: realistisch erklärt",
      excerpt:
        "Kann man mit 20 Minuten pro Woche wirklich abnehmen? Ja - aber anders, als die Werbung mancher Anbieter verspricht. Ein ehrlicher Blick.",
      content:
        "Vorweg die ehrliche Antwort: EMS ist kein Wundermittel. Abnehmen funktioniert nur mit einem Kaloriendefizit - daran ändert auch die beste Technologie nichts.\nWas EMS aber besser kann als fast jedes andere Training: In kurzer Zeit viel Muskulatur aktivieren. Mehr Muskelmasse bedeutet einen höheren Grundumsatz - dein Körper verbrennt also auch in Ruhe mehr Kalorien. Genau dieser Effekt macht EMS zu einem starken Partner beim Abnehmen.\nDazu kommt der Nachbrenneffekt: Nach einer intensiven EMS-Einheit arbeitet dein Stoffwechsel noch Stunden auf erhöhtem Niveau.\nUnsere Empfehlung für nachhaltige Ergebnisse: wöchentliches EMS-Training für den Muskelerhalt, dazu eine eiweißreiche, alltagstaugliche Ernährung ohne Verbote - und Geduld. Ein halbes Kilo pro Woche ist realistisch und bleibt dauerhaft unten. Bei deinem Probetermin sprechen wir offen über deine Ziele und was in welchem Zeitraum erreichbar ist.",
    },
    {
      slug: "5-mythen-ueber-ems",
      title: "5 Mythen über EMS-Training im Faktencheck",
      excerpt:
        "Strom am Körper? Da halten sich hartnäckige Gerüchte. Wir räumen mit den fünf häufigsten Mythen auf.",
      content:
        "Mythos 1: 'EMS ist gefährlich.' Falsch. Die Impulse sind niederfrequent und wirken nur auf die Skelettmuskulatur. In Physiotherapie und Reha wird die Methode seit Jahrzehnten eingesetzt. Wichtig ist professionelle Betreuung - bei uns Standard.\nMythos 2: 'Das ist nur was für Profisportler.' Im Gegenteil: Die meisten unserer Mitglieder sind Berufstätige zwischen 30 und 70, viele davon Einsteiger. Das Training wird an jedes Level angepasst.\nMythos 3: 'Man muss sich dabei nicht bewegen.' Doch. EMS verstärkt aktive Bewegungen - wer nur schlaff herumsteht, verschenkt den Großteil des Effekts. Deshalb führst du bei uns einfache Übungen aus, während die Impulse arbeiten.\nMythos 4: '20 Minuten können nicht reichen.' Können sie - weil bis zu 90% der Muskelfasern gleichzeitig arbeiten statt nacheinander. Die Intensität ersetzt die Dauer.\nMythos 5: 'EMS ersetzt jede Bewegung im Alltag.' Nein. EMS ist ein hocheffizientes Krafttraining, aber Spazierengehen, Radfahren und Treppensteigen bleiben wertvoll für Herz und Kreislauf. Die Kombination macht dich fit.",
    },
  ];

  for (const article of articles) {
    await prisma.blogPost.upsert({
      where: { slug: article.slug },
      update: {},
      create: { ...article, published: true, publishedAt: new Date() },
    });
  }
  console.log(`${articles.length} Blogartikel geprüft/angelegt.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
