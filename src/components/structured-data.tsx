import { getStudios, getFaqItems } from "@/lib/data";
import { siteConfig } from "@/lib/site-config";
import { legalConfig } from "@/lib/legal-config";

/**
 * Strukturierte Daten (JSON-LD).
 *
 * Bisher hatte die Seite davon nichts. Für ein Studio mit festem Standort
 * ist das der größte Hebel bei Google: Adresse, Telefonnummer und
 * Öffnungszeiten landen damit direkt im Suchergebnis und in der Karte,
 * statt dass Google sie aus dem Fließtext raten muss.
 *
 * Alle Angaben stammen aus der Datenbank beziehungsweise aus der
 * Impressumskonfiguration - es wird nichts doppelt gepflegt und nichts
 * erfunden.
 */

function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // Die Daten stammen ausschließlich aus der eigenen Datenbank, nicht
      // aus Nutzereingaben. Spitze Klammern werden dennoch entschärft,
      // damit ein Studioname mit "<" das Skript nicht beenden kann.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/**
 * Wandelt die frei gepflegten Öffnungszeiten in das von Google erwartete
 * Format um. Erkannt wird "Montag - Freitag: 08:00 - 21:00 Uhr" ebenso wie
 * "Samstag: 10:00 - 16:00 Uhr". Zeilen ohne Uhrzeit (etwa "Sonntag:
 * geschlossen") entfallen - eine fehlende Angabe ist besser als eine
 * falsche.
 */
const dayNames: Record<string, string> = {
  montag: "Monday",
  dienstag: "Tuesday",
  mittwoch: "Wednesday",
  donnerstag: "Thursday",
  freitag: "Friday",
  samstag: "Saturday",
  sonntag: "Sunday",
};
const dayOrder = Object.values(dayNames);

function parseOpeningHours(raw: string) {
  const result: { "@type": "OpeningHoursSpecification"; dayOfWeek: string[]; opens: string; closes: string }[] = [];

  for (const line of raw.split("\n")) {
    const times = line.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
    if (!times) continue;

    const daysPart = line.split(":")[0].toLowerCase();
    const found = Object.keys(dayNames).filter((d) => daysPart.includes(d));
    if (found.length === 0) continue;

    let days: string[];
    if (found.length === 2 && /[-–]/.test(daysPart)) {
      // Zeitspanne wie "Montag - Freitag": alle Tage dazwischen aufnehmen.
      const from = dayOrder.indexOf(dayNames[found[0]]);
      const to = dayOrder.indexOf(dayNames[found[1]]);
      days = from <= to ? dayOrder.slice(from, to + 1) : [dayNames[found[0]], dayNames[found[1]]];
    } else {
      days = found.map((d) => dayNames[d]);
    }

    result.push({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: days,
      opens: times[1].padStart(5, "0"),
      closes: times[2].padStart(5, "0"),
    });
  }

  return result;
}

/**
 * Das Studio als Ort - Adresse, Koordinaten, Öffnungszeiten, Profile.
 * Gehört auf Startseite, Studio- und Kontaktseite.
 */
export async function StudioJsonLd() {
  const studios = await getStudios();
  if (studios.length === 0) return null;

  const data = studios.map((studio) => ({
    "@context": "https://schema.org",
    // HealthClub ist die passende Unterart von LocalBusiness für ein
    // Trainingsstudio.
    "@type": "HealthClub",
    // Kennung und Adresse zeigen auf die Standortseite. Vorher verwiesen
    // alle vierzehn auf die Startseite - für Google war damit nicht
    // erkennbar, welche Seite zu welchem Standort gehört.
    "@id": `${siteConfig.url}/studio/${studio.slug}#studio`,
    name: studio.name,
    description: studio.intro?.trim() || siteConfig.description,
    url: `${siteConfig.url}/studio/${studio.slug}`,
    telephone: studio.phone,
    email: studio.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: studio.street,
      postalCode: studio.postalCode,
      addressLocality: studio.city,
      addressCountry: "DE",
    },
    ...(studio.latitude != null && studio.longitude != null
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: studio.latitude,
            longitude: studio.longitude,
          },
        }
      : {}),
    openingHoursSpecification: parseOpeningHours(studio.openingHours),
    sameAs: Object.values(siteConfig.social),
    ...(legalConfig.vatId ? { vatID: legalConfig.vatId } : {}),
  }));

  return <JsonLd data={data.length === 1 ? data[0] : data} />;
}

/**
 * Ein einzelner Standort auf seiner eigenen Seite.
 *
 * Unterschied zu StudioJsonLd: Dort steht eine Liste aller Standorte, und
 * alle verweisen auf die Startadresse. Hier steht genau ein Ort, und seine
 * "url" zeigt auf diese Seite - erst dadurch weiß Google, welche Adresse zu
 * welchem Studio gehört. Dazu die Brotkrumen, damit im Suchergebnis
 * "Startseite › Standorte › Köln Nippes" statt der nackten Adresse steht.
 */
export function StandortJsonLd({
  studio,
}: {
  studio: {
    id: string;
    slug: string;
    name: string;
    street: string;
    postalCode: string;
    city: string;
    phone: string;
    email: string;
    openingHours: string;
    intro: string | null;
    latitude: number | null;
    longitude: number | null;
  };
}) {
  const url = `${siteConfig.url}/studio/${studio.slug}`;

  return (
    <JsonLd
      data={[
        {
          "@context": "https://schema.org",
          "@type": "HealthClub",
          "@id": `${url}#studio`,
          name: studio.name,
          description: studio.intro?.trim() || siteConfig.description,
          url,
          telephone: studio.phone,
          email: studio.email,
          address: {
            "@type": "PostalAddress",
            streetAddress: studio.street,
            postalCode: studio.postalCode,
            addressLocality: studio.city,
            addressCountry: "DE",
          },
          ...(studio.latitude != null && studio.longitude != null
            ? {
                geo: {
                  "@type": "GeoCoordinates",
                  latitude: studio.latitude,
                  longitude: studio.longitude,
                },
              }
            : {}),
          openingHoursSpecification: parseOpeningHours(studio.openingHours),
          parentOrganization: { "@type": "Organization", name: siteConfig.name },
          sameAs: Object.values(siteConfig.social),
          ...(legalConfig.vatId ? { vatID: legalConfig.vatId } : {}),
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Startseite", item: siteConfig.url },
            { "@type": "ListItem", position: 2, name: "Standorte", item: `${siteConfig.url}/studio` },
            { "@type": "ListItem", position: 3, name: studio.name, item: url },
          ],
        },
      ]}
    />
  );
}

/**
 * Die Website selbst.
 *
 * Bewusst ohne SearchAction: Dafür bräuchte es eine Ergebnisseite mit einer
 * eigenen Adresse. Die Suche läuft hier aber nur über ein Overlay, ein
 * Suchbegriff lässt sich also nicht verlinken. Google die Angabe trotzdem
 * zu melden, würde Besucher auf eine Seite schicken, die den Suchbegriff
 * ignoriert.
 */
export function WebsiteJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: siteConfig.name,
        url: siteConfig.url,
        inLanguage: "de-DE",
        publisher: { "@type": "Organization", name: siteConfig.name },
      }}
    />
  );
}

/**
 * Die häufigen Fragen. Sie stehen ohnehin schon auf mehreren Seiten - so
 * können sie zusätzlich aufklappbar im Suchergebnis erscheinen.
 */
export async function FaqJsonLd() {
  const items = await getFaqItems();
  if (items.length === 0) return null;

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      }}
    />
  );
}

/** Ein einzelner Blogbeitrag. */
export function ArticleJsonLd({
  title,
  description,
  slug,
  publishedAt,
  updatedAt,
}: {
  title: string;
  description: string;
  slug: string;
  publishedAt: Date | null;
  updatedAt: Date;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: title,
        description,
        inLanguage: "de-DE",
        mainEntityOfPage: `${siteConfig.url}/blog/${slug}`,
        ...(publishedAt ? { datePublished: publishedAt.toISOString() } : {}),
        dateModified: updatedAt.toISOString(),
        author: { "@type": "Organization", name: siteConfig.name },
        publisher: { "@type": "Organization", name: siteConfig.name },
      }}
    />
  );
}
