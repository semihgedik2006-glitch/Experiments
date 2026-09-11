import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
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

  let studio = await prisma.studioLocation.findFirst({ orderBy: { sortOrder: "asc" } });
  if (!studio) {
    studio = await prisma.studioLocation.create({
      data: {
        name: "Körperformen Hürth",
        // Adresse der Standortseite: /studio/huerth
        slug: "huerth",
        street: "Krankenhausstr. 111",
        postalCode: "50354",
        city: "Hürth",
        phone: "+49 2233 9667181",
        email: "info@koerperformen.com",
        mapEmbedUrl:
          "https://www.google.com/maps?q=Krankenhausstr.+111,+50354+H%C3%BCrth&output=embed",
        openingHours:
          "Montag - Freitag: 08:00 - 21:00 Uhr\nSamstag: 10:00 - 16:00 Uhr\nSonntag: geschlossen",
        latitude: 50.88,
        longitude: 6.8817,
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
        slots.push({ studioId: studio.id, date, startTime, endTime, capacity: 1 });
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
      themen: ["Grundlagen", "EMS erklärt"],
      title: "Was ist EMS-Training und wie funktioniert es?",
      excerpt:
        "EMS steht für Elektro-Muskel-Stimulation. Wir erklären, wie das Training funktioniert und warum 20 Minuten pro Woche ausreichen.",
      content:
        "EMS-Training kombiniert klassische Bewegungsübungen mit elektrischen Impulsen, die über eine spezielle Weste direkt auf die Muskulatur wirken. Die Impulse erreichen dabei auch tiefer liegende Muskelschichten, die sich mit klassischen Übungen nur schwer gezielt ansteuern lassen. Deshalb dauert eine Einheit bei uns rund 20 Minuten und findet einmal pro Woche statt - wie stark sie wirkt, hängt von der Intensität ab, die dein Trainer mit dir zusammen einstellt.",
    },
    {
      slug: "ems-fuer-berufstaetige",
      themen: ["Alltag", "Wenig Zeit"],
      title: "EMS-Training für Berufstätige mit wenig Zeit",
      excerpt:
        "Kein Zeitaufwand für Anfahrt, Umziehen oder lange Trainingseinheiten. So passt effektives Training in einen vollen Alltag.",
      content:
        "Gerade für Berufstätige zwischen 30 und 70 Jahren ist Zeit die knappste Ressource. Ein EMS-Training bei Körperformen dauert inklusive Beratung nur rund 20 Minuten - ganz ohne stundenlange Einheiten im Fitnessstudio. So bleibt Training auch im stressigen Alltag machbar.",
    },
    {
      slug: "ems-gegen-rueckenschmerzen",
      themen: ["Rücken", "Gesundheit"],
      title: "EMS gegen Rückenschmerzen: Was steckt dahinter?",
      excerpt:
        "Rückenschmerzen gehören zu den häufigsten Beschwerden überhaupt. Warum EMS-Training gerade die tiefe Rumpfmuskulatur erreicht, die klassisches Training oft verfehlt.",
      content:
        "Wer viel sitzt, kennt das Ziehen im unteren Rücken. Die Ursache ist selten ein einzelnes Ereignis, sondern meist eine schwache tiefliegende Rumpfmuskulatur, die die Wirbelsäule nicht mehr ausreichend stützt.\nGenau hier setzt EMS an: Die elektrischen Impulse erreichen auch die tiefen Muskelschichten, die mit klassischen Übungen nur schwer gezielt trainierbar sind. Ob das im Einzelfall hilft, hängt von der Ursache der Beschwerden ab - bei anhaltenden oder starken Schmerzen gehört die Abklärung zuerst zum Arzt, nicht ins Studio.\nWichtig ist die richtige Betreuung: Bei Körperformen wird jede Einheit persönlich begleitet, die Impulsstärke individuell dosiert und die Übungsauswahl an dein Beschwerdebild angepasst.\nUnser Tipp: Ergänze das wöchentliche Training mit kleinen Gewohnheiten im Alltag - regelmäßig aufstehen, Schulterkreisen am Schreibtisch, ein kurzer Spaziergang in der Mittagspause. Die Kombination macht den Unterschied.",
    },
    {
      slug: "abnehmen-mit-ems",
      themen: ["Abnehmen", "Ernährung"],
      title: "Abnehmen mit EMS: realistisch erklärt",
      excerpt:
        "Kann man mit 20 Minuten pro Woche wirklich abnehmen? Ja - aber anders, als die Werbung mancher Anbieter verspricht. Ein ehrlicher Blick.",
      content:
        "Vorweg die ehrliche Antwort: EMS ist kein Wundermittel. Abnehmen funktioniert nur mit einem Kaloriendefizit - daran ändert auch die beste Technologie nichts.\nWas EMS aber besser kann als fast jedes andere Training: In kurzer Zeit viel Muskulatur aktivieren. Mehr Muskelmasse bedeutet einen höheren Grundumsatz - dein Körper verbrennt also auch in Ruhe mehr Kalorien. Genau dieser Effekt macht EMS zu einem starken Partner beim Abnehmen.\nUnsere Empfehlung für Ergebnisse, die bleiben: wöchentliches EMS-Training für den Muskelerhalt, dazu eine eiweißreiche, alltagstaugliche Ernährung ohne Verbote - und Geduld. Wie schnell es geht, ist von Mensch zu Mensch verschieden und hängt vor allem daran, ob die Ernährung mitzieht. Bei deinem Probetermin sprechen wir offen über deine Ziele und was in welchem Zeitraum für dich erreichbar ist.",
    },
    {
      slug: "5-mythen-ueber-ems",
      themen: ["Grundlagen", "EMS erklärt", "Gesundheit"],
      title: "5 Mythen über EMS-Training im Faktencheck",
      excerpt:
        "Strom am Körper? Da halten sich hartnäckige Gerüchte. Wir räumen mit den fünf häufigsten Mythen auf.",
      content:
        "Mythos 1: 'EMS ist für jeden gefährlich.' So pauschal stimmt das nicht - entscheidend sind Betreuung und Vorgeschichte. Deshalb wird bei uns jede Einheit persönlich begleitet und die Intensität langsam aufgebaut. Es gibt aber echte Gegenanzeigen: unter anderem Herzschrittmacher, Schwangerschaft, Epilepsie, akute Entzündungen und fieberhafte Infekte. Sprich im Zweifel vorher mit deinem Arzt - und sag uns beim Probetermin, was bei dir vorliegt.\nMythos 2: 'Das ist nur was für Profisportler.' Im Gegenteil: Die meisten unserer Mitglieder sind Berufstätige zwischen 30 und 70, viele davon Einsteiger. Das Training wird an jedes Level angepasst.\nMythos 3: 'Man muss sich dabei nicht bewegen.' Doch. EMS verstärkt aktive Bewegungen - wer nur schlaff herumsteht, verschenkt den Großteil des Effekts. Deshalb führst du bei uns einfache Übungen aus, während die Impulse arbeiten.\nMythos 4: '20 Minuten können nicht reichen.' Für ein Krafttraining können sie reichen - weil bei EMS viele Muskelgruppen gleichzeitig arbeiten statt nacheinander. Die Intensität ersetzt die Dauer, nicht aber die Regelmäßigkeit.\nMythos 5: 'EMS ersetzt jede Bewegung im Alltag.' Nein. EMS ist ein hocheffizientes Krafttraining, aber Spazierengehen, Radfahren und Treppensteigen bleiben wertvoll für Herz und Kreislauf. Die Kombination macht dich fit.",
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

  // FAQ-Einträge - im Admin unter /admin/faq bearbeitbar.
  const faqs = [
    {
      question: "Wie oft muss ich trainieren?",
      answer:
        "Einmal pro Woche, rund 20 Minuten. Darauf ist das Training ausgelegt: kurz, dafür intensiv und mit genug Abstand dazwischen, damit sich die Muskulatur erholen kann. Das ist deutlich weniger Zeitaufwand als klassisches Fitnesstraining.",
    },
    {
      question: "Ist EMS-Training für Anfänger geeignet?",
      answer:
        "Ja. Das Training wird individuell auf deinen Fitnesslevel abgestimmt und von unseren Trainern durchgehend begleitet - unabhängig davon, ob du Anfänger oder erfahren bist.",
    },
    {
      question: "Ist EMS-Training gelenkschonend?",
      answer:
        "Es kommt ohne schwere Gewichte aus - die Belastung für Gelenke und Wirbelsäule ist dadurch geringer als beim Hanteltraining. Ob es bei bestehenden Beschwerden für dich in Frage kommt, klärst du vorher bitte mit deinem Arzt; wir sind kein medizinischer Betrieb.",
    },
    {
      question: "Was sollte ich zum Training mitbringen?",
      answer:
        "Bequeme Sportkleidung sowie ein großes und ein kleines Handtuch reichen aus. Die EMS-Ausrüstung stellen wir dir im Studio zur Verfügung.",
    },
    {
      question: "Kann ich das Training kostenlos testen?",
      answer:
        "Ja, bei einem unverbindlichen Probetermin lernst du das Studio, unser Team und die EMS-Technologie ganz ohne Kosten kennen.",
    },
    {
      question: "Wie schnell sehe ich erste Ergebnisse?",
      answer:
        "Das ist von Mensch zu Mensch sehr unterschiedlich und hängt an Ausgangslage, Ernährung, Schlaf und vor allem an der Regelmäßigkeit. Eine seriöse Zahl können wir dir hier nicht nennen - was in deinem Fall realistisch ist, besprechen wir beim Probetermin offen.",
    },
    {
      question: "Ist EMS-Training sicher?",
      answer:
        "Bei uns trainierst du ausschließlich unter persönlicher Anleitung, mit geprüften Geräten, und wir gehen beim ersten Termin gemeinsam durch, was bei dir zu beachten ist. Entscheidend ist die Betreuung - und dass du uns sagst, wenn etwas vorliegt. Die Fälle, in denen wir grundsätzlich nicht trainieren, stehen bei der Frage „Für wen ist EMS nicht geeignet?“.",
    },
    {
      question: "Bekomme ich Muskelkater?",
      answer:
        "Nach den ersten Einheiten sehr wahrscheinlich - und zwar auch an Stellen, von denen du nicht wusstest, dass dort Muskeln sind. Das ist ein gutes Zeichen: Es zeigt, wie tief das Training wirkt. Mit der Zeit reguliert sich das.",
    },
    {
      question: "Für wen ist EMS nicht geeignet?",
      answer:
        "Bei Herzschrittmachern und anderen elektronischen Implantaten, in der Schwangerschaft, bei Epilepsie, akuten Erkrankungen oder Thrombosen verzichten wir grundsätzlich auf EMS-Training. Im Zweifel klärst du das kurz mit deinem Arzt - wir beraten dich ehrlich.",
    },
    {
      question: "Muss ich etwas mitbringen oder vorbereiten?",
      answer:
        "Nein. Funktionsunterwäsche und die EMS-Ausrüstung stellen wir. Du brauchst nur dich selbst, ein großes und ein kleines Handtuch - und etwas Neugier.",
    },
    {
      question: "Was kostet eine Mitgliedschaft?",
      answer:
        "Das hängt von deinen Zielen und dem passenden Trainingspaket ab. Wir besprechen die Konditionen persönlich und transparent bei deinem kostenlosen Probetermin - ohne versteckte Kosten und ohne Druck.",
    },
  ];

  for (const [index, faq] of faqs.entries()) {
    await prisma.faqItem.upsert({
      where: { question: faq.question },
      update: {},
      create: { ...faq, sortOrder: (index + 1) * 10 },
    });
  }
  console.log(`${faqs.length} FAQ-Einträge geprüft/angelegt.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
