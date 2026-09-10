import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Mail, MapPin, Navigation, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { isVisible } from "@/lib/site-toggles";
import { siteConfig } from "@/lib/site-config";
import { studioMapUrl } from "@/lib/studio-map";
import { haversineDistanceKm } from "@/lib/geo";
import { tageAusSlots } from "@/lib/termin-tage";
import { freiePlaetze } from "@/lib/kapazitaet";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { MapEmbed } from "@/components/map-embed";
import { BookingFlow } from "@/components/booking/booking-flow";
import { StandortJsonLd } from "@/components/structured-data";
import { WhatsappKnopf } from "@/components/whatsapp-knopf";

/**
 * Eine eigene Seite je Standort.
 *
 * Der Grund ist einfach: Gesucht wird "EMS Training Rösrath", nicht "EMS
 * Training". Eine gemeinsame Seite mit vierzehn Abschnitten kann für keinen
 * dieser vierzehn Orte die passende Antwort sein - sie hat einen Titel, eine
 * Überschrift und eine Adresse, und die können nicht vierzehnmal etwas
 * anderes sagen.
 *
 * Damit die Seiten nicht vierzehn fast gleiche Seiten werden, steht auf
 * jeder etwas, das nur dort gilt: Anschrift, Öffnungszeiten, Karte, die
 * tatsächlich freien Termine dieses Studios, die nächstgelegenen anderen
 * Standorte - und die beiden Textfelder aus dem Adminbereich.
 */

/** Wie viele Nachbarstandorte unten verlinkt werden. */
const NACHBARN = 3;

async function ladeStudio(slug: string) {
  return prisma.studioLocation.findUnique({ where: { slug } });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const studio = await ladeStudio(slug);
  if (!studio) return {};

  const ort = ortsname(studio.name, studio.city);

  return {
    // Der Ort steht vorn: Im Suchergebnis ist nach etwa 60 Zeichen Schluss,
    // und abgeschnitten werden soll der Markenname, nicht der Ort.
    title: `EMS Training in ${ort}`,
    description:
      studio.intro?.trim() ||
      `EMS-Training bei Körperformen in ${ort}: ${studio.street}, ${studio.postalCode} ${studio.city}. 20 Minuten pro Woche, Termin nach Absprache - jetzt kostenlosen Probetermin sichern.`,
    alternates: { canonical: `/studio/${studio.slug}` },
    openGraph: {
      title: `EMS Training in ${ort} - ${studio.name}`,
      url: `${siteConfig.url}/studio/${studio.slug}`,
      type: "website",
    },
  };
}

/**
 * Der Ort, wie ihn jemand tippt.
 *
 * Der Studioname trägt den Markennamen ("Körperformen Köln Nippes"); für
 * eine Überschrift "EMS Training in Körperformen Köln Nippes" wäre das
 * Unsinn. Bleibt nach dem Abziehen nichts übrig, tut es der Ort aus der
 * Anschrift.
 */
function ortsname(name: string, city: string): string {
  const ohneMarke = name.replace(/^\s*Körperformen\s+/i, "").trim();
  return ohneMarke || city;
}

export default async function StudioDetailSeite({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Ist der Standortbereich im Adminbereich ausgeblendet, gilt das auch
  // für die einzelnen Seiten - sonst bliebe eine Hintertür offen.
  if (!(await isVisible("studio"))) return notFound();

  const { slug } = await params;
  const studio = await ladeStudio(slug);
  if (!studio) return notFound();

  const ort = ortsname(studio.name, studio.city);
  const anschrift = `${studio.street}, ${studio.postalCode} ${studio.city}`;

  const [alleStudios, slots] = await Promise.all([
    prisma.studioLocation.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.availabilitySlot.findMany({
      where: { studioId: studio.id, date: { gte: heuteMitternacht() } },
      include: { bookings: { where: { status: { not: "CANCELLED" } } } },
      orderBy: [{ date: "asc" }, { startTime: "asc" }, { id: "asc" }],
    }),
  ]);

  // Tage für das Buchungsformular - dieselbe Form wie auf /probetermin,
  // nur auf diesen einen Standort begrenzt. Belegte Zeiten bleiben dabei:
  // Sie sind der Einstieg in die Warteliste.
  const tage = tageAusSlots(
    slots.map((slot) => ({ ...slot, frei: freiePlaetze(slot.capacity, slot.bookings) })),
  );

  const nachbarn = naechsteStudios(studio, alleStudios, NACHBARN);

  const routeUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${studio.name}, ${anschrift}`,
  )}`;

  return (
    <>
      <StandortJsonLd studio={studio} />

      <PageHeader
        kicker="Standort"
        title={
          <>
            EMS Training in <span className="text-accent">{ort}</span>
          </>
        }
        intro={
          studio.intro?.trim() ||
          `Dein Körperformen-Studio in ${studio.city}: 20 Minuten Training pro Woche, immer zu zweit mit einem Trainer. Der erste Termin ist kostenlos und unverbindlich.`
        }
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="#termin">Probetermin anfragen</Button>
          {studio.phone && (
            <Button href={`tel:${studio.phone}`} variant="secondary">
              <Phone size={16} /> {studio.phone}
            </Button>
          )}
          {/* Nur wenn eine WhatsApp-Nummer hinterlegt ist. Ein Knopf, der
              in einem Konto landet, das niemand liest, ist schlimmer als
              keiner. */}
          {studio.whatsapp && (
            <WhatsappKnopf
              nummer={studio.whatsapp}
              variante="schlicht"
              text={`Hallo, ich interessiere mich für ein Probetraining bei Körperformen in ${ort}.`}
            />
          )}
        </div>
      </PageHeader>

      {/* Karte und Eckdaten */}
      <section className="py-20 sm:py-24">
        <Container className="grid gap-10 md:grid-cols-2">
          <Reveal className="overflow-hidden rounded-2xl border border-border">
            <MapEmbed
              src={studioMapUrl(studio)}
              title={`${studio.name} auf Google Maps`}
              className="h-96 w-full"
            />
          </Reveal>

          <Reveal delay={0.15} className="card p-8">
            <h2 className="text-xl font-semibold">{studio.name}</h2>

            <ul className="mt-6 space-y-5 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-accent" aria-hidden />
                <span>
                  {studio.street}
                  <br />
                  {studio.postalCode} {studio.city}
                </span>
              </li>
              {studio.phone && (
                <li className="flex items-start gap-3">
                  <Phone size={18} className="mt-0.5 shrink-0 text-accent" aria-hidden />
                  <a href={`tel:${studio.phone}`} className="hover:underline">
                    {studio.phone}
                  </a>
                </li>
              )}
              {studio.email && (
                <li className="flex items-start gap-3">
                  <Mail size={18} className="mt-0.5 shrink-0 text-accent" aria-hidden />
                  <a href={`mailto:${studio.email}`} className="break-all hover:underline">
                    {studio.email}
                  </a>
                </li>
              )}
              {studio.openingHours && (
                <li className="flex items-start gap-3">
                  <Clock size={18} className="mt-0.5 shrink-0 text-accent" aria-hidden />
                  <span className="whitespace-pre-line">{studio.openingHours}</span>
                </li>
              )}
            </ul>

            <a
              href={routeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:border-lime hover:text-accent"
            >
              <Navigation size={16} aria-hidden />
              Route planen
            </a>
          </Reveal>
        </Container>
      </section>

      {/* Anfahrt - nur, wenn dazu etwas hinterlegt ist. Eine Überschrift
          ohne Inhalt sieht nach einer kaputten Seite aus. */}
      {studio.anfahrt?.trim() && (
        <section className="border-t border-border bg-surface py-20">
          <Container className="max-w-3xl">
            <h2 className="text-2xl font-bold tracking-tight">
              So findest du uns in {ort}
            </h2>
            <p className="mt-5 whitespace-pre-line leading-relaxed text-muted">
              {studio.anfahrt}
            </p>
          </Container>
        </section>
      )}

      {/* Terminbuchung für genau diesen Standort */}
      <section id="termin" className="scroll-mt-20 border-t border-border py-20 sm:py-24">
        <Container className="max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight">
            Probetermin in {ort}
          </h2>
          <p className="mt-4 text-muted">
            Kostenlos und unverbindlich. Wir melden uns telefonisch zur Bestätigung -
            sag uns im Formular, wann wir dich am besten erreichen.
          </p>

          <div className="mt-10">
            {/* Nur dieser Standort: Die Auswahl oben entfällt damit von
                selbst, und die Anfrage kommt beim richtigen Studio an. */}
            <BookingFlow
              studios={[
                {
                  id: studio.id,
                  name: studio.name,
                  street: studio.street,
                  postalCode: studio.postalCode,
                  city: studio.city,
                  latitude: studio.latitude,
                  longitude: studio.longitude,
                },
              ]}
              slotsByStudio={{ [studio.id]: tage }}
            />
          </div>
        </Container>
      </section>

      {/* Nachbarstandorte - für Besucher der zweitbeste Treffer, wenn der
          Weg hierher zu weit ist. */}
      {nachbarn.length > 0 && (
        <section className="border-t border-border bg-surface py-20">
          <Container>
            <h2 className="text-2xl font-bold tracking-tight">
              Weitere Studios in der Nähe
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {nachbarn.map(({ studio: nachbar, km }) => (
                <Link
                  key={nachbar.id}
                  href={`/studio/${nachbar.slug}`}
                  className="card block p-6 transition-colors hover:border-lime"
                >
                  <span className="flex items-center gap-2 font-semibold">
                    <MapPin size={15} className="shrink-0 text-accent" aria-hidden />
                    {ortsname(nachbar.name, nachbar.city)}
                  </span>
                  <span className="mt-1.5 block text-sm text-muted">
                    {nachbar.street}, {nachbar.postalCode} {nachbar.city}
                  </span>
                  {km !== null && (
                    <span className="mt-2 block text-xs text-muted">
                      rund {entfernungText(km)} km Luftlinie von hier
                    </span>
                  )}
                </Link>
              ))}
            </div>

            <Link
              href="/studio"
              className="mt-8 inline-block text-sm font-semibold text-accent hover:underline"
            >
              Alle Standorte ansehen
            </Link>
          </Container>
        </section>
      )}
    </>
  );
}

/**
 * Entfernung als Text.
 *
 * Unter zehn Kilometern mit einer Nachkommastelle, darüber gerundet - bei
 * zwölf Kilometern Luftlinie ist die zweite Stelle keine Information mehr.
 * Die Grenze liegt bei 9,95 und nicht bei 10: Sonst würde aus 9,97 km
 * gerundet "10,0 km", direkt neben einem "10 km" in der nächsten Zeile.
 */
function entfernungText(km: number): string {
  return km < 9.95 ? km.toFixed(1).replace(".", ",") : String(Math.round(km));
}

function heuteMitternacht(): Date {
  const heute = new Date();
  heute.setHours(0, 0, 0, 0);
  return heute;
}

type StudioZeile = {
  id: string;
  slug: string;
  name: string;
  street: string;
  postalCode: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  sortOrder: number;
};

/**
 * Die nächstgelegenen anderen Standorte.
 *
 * Sind Koordinaten hinterlegt, wird nach Luftlinie sortiert. Fehlen sie,
 * gilt die Reihenfolge aus dem Adminbereich - dann wird auch keine
 * Entfernung behauptet.
 */
function naechsteStudios(
  aktuell: StudioZeile,
  alle: StudioZeile[],
  anzahl: number,
): { studio: StudioZeile; km: number | null }[] {
  const andere = alle.filter((s) => s.id !== aktuell.id);

  if (aktuell.latitude === null || aktuell.longitude === null) {
    return andere.slice(0, anzahl).map((studio) => ({ studio, km: null }));
  }

  const mitEntfernung = andere.map((studio) => ({
    studio,
    km:
      studio.latitude !== null && studio.longitude !== null
        ? haversineDistanceKm(
            aktuell.latitude as number,
            aktuell.longitude as number,
            studio.latitude,
            studio.longitude,
          )
        : null,
  }));

  // Standorte ohne Koordinaten hängen hinten an, statt die Sortierung
  // unbrauchbar zu machen.
  mitEntfernung.sort((a, b) => {
    if (a.km === null && b.km === null) return a.studio.sortOrder - b.studio.sortOrder;
    if (a.km === null) return 1;
    if (b.km === null) return -1;
    return a.km - b.km;
  });

  return mitEntfernung.slice(0, anzahl);
}
