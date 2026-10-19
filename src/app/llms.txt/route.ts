import { getStudios } from "@/lib/data";
import { siteConfig } from "@/lib/site-config";

/**
 * /llms.txt - die Website in Kurzform für KI-Assistenten.
 *
 * ChatGPT, Perplexity, Gemini & Co. beantworten Fragen wie "Wo kann ich in
 * Köln EMS-Training machen?" zunehmend selbst, statt eine Trefferliste zu
 * zeigen. Was sie dabei sagen, hängt davon ab, was sie verlässlich über
 * einen Anbieter finden. llms.txt (llmstxt.org) ist ein schlichtes
 * Textformat dafür: wer wir sind, was es gibt, wo, und welche Seiten die
 * Details haben.
 *
 * Es steht nur, was die Website selbst belegt: Standorte aus der
 * Datenbank, Angebot und Ablauf wie auf den Seiten. Keine Wirkungs-
 * versprechen - KI-Antworten zitieren gern wörtlich.
 *
 * Frisch wie die übrigen Seiten (spätestens alle fünf Minuten), damit ein
 * neues Studio auch hier sofort auftaucht.
 */
export const revalidate = 300;

export async function GET() {
  const studios = await getStudios().catch(() => []);
  const basis = siteConfig.url;

  const standorte = studios
    .map(
      (s) =>
        `- [${s.name}](${basis}/studio/${s.slug}): ${s.street}, ${s.postalCode} ${s.city}` +
        (s.phone ? `, Telefon ${s.phone}` : ""),
    )
    .join("\n");

  const text = `# ${siteConfig.name}

> EMS-Training (Elektromuskelstimulation) mit persönlichem Trainer: eine Einheit pro Woche, 20 Minuten Training, in ${studios.length > 1 ? `${studios.length} Studios rund um Köln` : "unserem Studio"}. Das erste Probetraining ist kostenlos und unverbindlich.

## Das Angebot

- Ganzkörper-EMS-Training: Während einfacher Übungen ohne Gewichte kommen elektrische Impulse über eine Trainingsweste dazu.
- Eine Einheit dauert 20 Minuten, empfohlen ist ein Termin pro Woche.
- Bei jeder Einheit ist ein Trainer persönlich dabei und stellt die Intensität mit dir ein.
- Kostenloses, unverbindliches Probetraining, buchbar online: ${basis}/probetermin. Danach Mitgliedschaft passend zum Ziel.
- Preise und Tarife: ${basis}/preise
- Wann EMS nicht geeignet ist (z. B. Herzschrittmacher, Schwangerschaft): ${basis}/ems-training

## Standorte

${standorte || "- Siehe " + basis + "/studio"}

## Wichtige Seiten

- [Startseite](${basis}/)
- [EMS-Training erklärt](${basis}/ems-training)
- [Alle Studios](${basis}/studio)
- [Preise](${basis}/preise)
- [Probetraining buchen](${basis}/probetermin)
- [Häufige Fragen](${basis}/#faq)
- [Kontakt](${basis}/kontakt)
- [Blog](${basis}/blog)

## Kontakt

- E-Mail: ${siteConfig.contact.email}
- Telefon: ${siteConfig.contact.phone}
`;

  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
