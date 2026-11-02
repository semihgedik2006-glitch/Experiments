import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/sprach-link";
import { notFound } from "next/navigation";
import { Clock, Mail, MapPin, Navigation, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { isVisible } from "@/lib/site-toggles";
import { studioMapUrl } from "@/lib/studio-map";
import { haversineDistanceKm } from "@/lib/geo";
import { Container } from "@/components/ui/container";
import { TrainerWand } from "@/components/studio/trainer-wand";
import { Zusatzangebote } from "@/components/preise/zusatzangebote";
import { giltAn } from "@/lib/zusatzangebote";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { MapEmbed } from "@/components/map-embed";
import { BookingFlow } from "@/components/booking/booking-flow";
import { StandortJsonLd } from "@/components/structured-data";
import { WhatsappKnopf } from "@/components/whatsapp-knopf";
import { BeweisLeiste } from "@/components/beweis-leiste";
import type { Sprache } from "@/lib/sprache";
import { lokal } from "@/lib/i18n/lokal";
import { oeffnungszeiten } from "@/lib/i18n/oeffnungszeiten";
import { seitenMetadaten } from "@/lib/i18n/metadaten";
import { angebotIn } from "@/lib/zusatzangebote";
import { ortsname } from "@/lib/ortsname";

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
 * Wunschzeit-Anfrage für genau dieses Studio, die nächstgelegenen anderen
 * Standorte - und die beiden Textfelder aus dem Adminbereich.
 */

/** Wie viele Nachbarstandorte unten verlinkt werden. */
const NACHBARN = 3;

async function ladeStudio(slug: string) {
  return prisma.studioLocation.findUnique({ where: { slug } });
}

/**
 * Alle Standortseiten beim Veröffentlichen fertig erzeugen.
 *
 * Vorher entstand jede erst beim Aufruf - nach einer Pause dauerte das auf
 * der Live-Seite drei bis fünf Sekunden. Ausgerechnet auf den Seiten, auf
 * denen Leute aus der Google-Suche nach "EMS Hürth" landen. Ein neues
 * Studio, das erst später angelegt wird, entsteht weiter beim ersten
 * Aufruf (dynamicParams bleibt an).
 */
export async function studioSlugs() {
  const studios = await prisma.studioLocation.findMany({ select: { slug: true } });
  return studios.map(({ slug }) => ({ slug }));
}

export async function studioMetadaten(sprache: Sprache, slug: string): Promise<Metadata> {
  const studio = await ladeStudio(slug);
  if (!studio) return {};

  const ort = ortsname(studio.name, studio.city);
  const intro = lokal(sprache, studio.intro, studio.introEn)?.trim();

  // Der Ort steht vorn: Im Suchergebnis ist nach etwa 60 Zeichen Schluss,
  // und abgeschnitten werden soll der Markenname, nicht der Ort.
  return seitenMetadaten(sprache, `/studio/${studio.slug}`, {
    title: `EMS Training in ${ort}`,
    description:
      intro ||
      (sprache === "en"
        ? `EMS training at Körperformen in ${ort}: ${studio.street}, ${studio.postalCode} ${studio.city}. 20 minutes a week, appointment by arrangement - book your free trial session now.`
        : `EMS-Training bei Körperformen in ${ort}: ${studio.street}, ${studio.postalCode} ${studio.city}. 20 Minuten pro Woche, Termin nach Absprache - jetzt kostenlosen Probetermin sichern.`),
  });
}

export async function StudioDetailSeite({ sprache, slug }: { sprache: Sprache; slug: string }) {
  const en = sprache === "en";
  // Ist der Standortbereich im Adminbereich ausgeblendet, gilt das auch
  // für die einzelnen Seiten - sonst bliebe eine Hintertür offen.
  if (!(await isVisible("studio"))) return notFound();

  const studio = await ladeStudio(slug);
  if (!studio) return notFound();

  const ort = ortsname(studio.name, studio.city);
  const anschrift = `${studio.street}, ${studio.postalCode} ${studio.city}`;

  const [alleStudios, trainer, angebote] = await Promise.all([
    prisma.studioLocation.findMany({ orderBy: { sortOrder: "asc" } }),
    // Nur die eingeschalteten Profile, und nur die Felder, die die Karte
    // braucht - die Reihenfolge legt das Studio im Adminbereich fest.
    prisma.trainer.findMany({
      where: { studioId: studio.id, aktiv: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        rolle: true,
        qualifikation: true,
        text: true,
        rolleEn: true,
        qualifikationEn: true,
        textEn: true,
        fotoUrl: true,
      },
    }),
    // Die Einschränkung auf Standorte steckt in einer Liste am Angebot,
    // nicht in der Abfrage: Eine leere Liste heißt "überall", und das
    // ließe sich nur mit einer zweiten Bedingung abfragen. Bei einer
    // Handvoll Angeboten ist Filtern im Anschluss das Einfachere.
    prisma.zusatzangebot.findMany({
      where: { aktiv: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        text: true,
        preis: true,
        nameEn: true,
        textEn: true,
        preisEn: true,
        symbol: true,
        nurStudios: true,
      },
    }),
  ]);

  const nachbarn = naechsteStudios(studio, alleStudios, NACHBARN);
  const intro = lokal(sprache, studio.intro, studio.introEn)?.trim();
  const anfahrt = lokal(sprache, studio.anfahrt, studio.anfahrtEn)?.trim();

  const routeUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${studio.name}, ${anschrift}`,
  )}`;

  return (
    <>
      <StandortJsonLd studio={studio} sprache={sprache} />

      <PageHeader
        kicker={en ? "Location" : "Standort"}
        title={
          <>
            EMS Training in <span className="text-accent">{ort}</span>
          </>
        }
        intro={
          intro ||
          (en
            ? `Your Körperformen studio in ${ort}: 20 minutes of training a week, with a trainer by your side the whole time. Your first appointment is free and without obligation.`
            : `Dein Körperformen-Studio in ${ort}: 20 Minuten Training pro Woche, dabei steht die ganze Zeit ein Trainer neben dir. Der erste Termin ist kostenlos und unverbindlich.`)
        }
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="#termin">{en ? "Request a trial session" : "Probetermin anfragen"}</Button>
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
              sprache={sprache}
              text={
                en
                  ? `Hello, I am interested in a trial session at Körperformen in ${ort}.`
                  : `Hallo, ich interessiere mich für ein Probetraining bei Körperformen in ${ort}.`
              }
            />
          )}
        </div>

        {/* Wie man hier zu einem Termin kommt: Wunschzeit nennen, das
            Studio meldet sich. */}
        <BeweisLeiste studioId={studio.id} className="mt-8 max-w-xl" sprache={sprache} />
      </PageHeader>

      {/* Ein Foto aus einem Körperformen-Studio. Ausdrücklich so
          beschriftet: Es ist nicht zwingend dieser Standort - eigene Fotos
          je Studio kommen über die Trainer (TrainerWand weiter unten). */}
      <Container className="pt-4">
        <figure>
          <div className="overflow-hidden rounded-3xl">
            <Image
              src="/bilder/studio/high-five-trainerin.jpg"
              alt={
                en
                  ? "A Körperformen trainer and a client in an EMS suit high-five."
                  : "Eine Körperformen-Trainerin und ein Kunde im EMS-Anzug geben sich ein High Five."
              }
              width={1600}
              height={1067}
              sizes="(min-width: 1152px) 1104px, 100vw"
              className="aspect-[4/3] w-full object-cover sm:aspect-[21/9] sm:object-[50%_35%]"
            />
          </div>
          <figcaption className="mt-2 text-xs text-muted">{en ? "Training at Körperformen" : "Training bei Körperformen"}</figcaption>
        </figure>
      </Container>

      {/* Karte und Eckdaten */}
      <section className="py-20 sm:py-24">
        <Container className="grid gap-10 md:grid-cols-2">
          <Reveal className="overflow-hidden rounded-2xl border border-border">
            <MapEmbed
              src={studioMapUrl(studio)}
              title={en ? `${studio.name} on Google Maps` : `${studio.name} auf Google Maps`}
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
                  <span className="whitespace-pre-line">{oeffnungszeiten(sprache, studio)}</span>
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
              {en ? "Plan your route" : "Route planen"}
            </a>
          </Reveal>
        </Container>
      </section>

      {/* Anfahrt - nur, wenn dazu etwas hinterlegt ist. Eine Überschrift
          ohne Inhalt sieht nach einer kaputten Seite aus. */}
      {anfahrt && (
        <section className="border-t border-border bg-surface py-20">
          <Container className="max-w-3xl">
            <h2 className="text-2xl font-bold tracking-tight">
              {en ? `How to find us in ${ort}` : `So findest du uns in ${ort}`}
            </h2>
            <p className="mt-5 whitespace-pre-line leading-relaxed text-muted">
              {anfahrt}
            </p>
          </Container>
        </section>
      )}

      {/* Wer betreut - steht vor der Terminbuchung, weil er genau die
          Frage beantwortet, die unmittelbar davor aufkommt. */}
      <TrainerWand
        ort={ort}
        sprache={sprache}
        trainer={trainer.map((t) => ({
          id: t.id,
          name: t.name,
          fotoUrl: t.fotoUrl,
          rolle: lokal(sprache, t.rolle, t.rolleEn),
          qualifikation: lokal(sprache, t.qualifikation, t.qualifikationEn),
          text: lokal(sprache, t.text, t.textEn),
        }))}
      />

      {/* Nur die Angebote, die es an DIESEM Standort gibt. Ein Angebot,
          das hier steht und vor Ort nicht existiert, ist schlimmer als
          keines - der Gast fragt danach und bekommt ein Nein. */}
      <Zusatzangebote
        angebote={angebote.filter((angebot) => giltAn(angebot, studio.id)).map((a) => angebotIn(sprache, a))}
        kompakt
        sprache={sprache}
      />

      {/* Terminbuchung für genau diesen Standort */}
      <section id="termin" className="scroll-mt-20 border-t border-border py-20 sm:py-24">
        <Container className="max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight">
            {en ? `Trial session in ${ort}` : `Probetermin in ${ort}`}
          </h2>
          <p className="mt-4 text-muted">
            {en
              ? "Free and without obligation. We will call you to confirm - tell us in the form when is best to reach you."
              : "Kostenlos und unverbindlich. Wir melden uns telefonisch zur Bestätigung - sag uns im Formular, wann wir dich am besten erreichen."}
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
              {en ? "Other studios nearby" : "Weitere Studios in der Nähe"}
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {nachbarn.map(({ studio: nachbar, km }) => (
                <Link
                  key={nachbar.id}
                  href={`/studio/${nachbar.slug}`}
                  className="karte-hebt karte-glanz card block p-6"
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
                      {en
                        ? `about ${entfernungText(km, sprache)} km from here as the crow flies`
                        : `rund ${entfernungText(km, sprache)} km Luftlinie von hier`}
                    </span>
                  )}
                </Link>
              ))}
            </div>

            <Link
              href="/studio"
              className="mt-8 inline-block text-sm font-semibold text-accent hover:underline"
            >
              {en ? "View all studios" : "Alle Standorte ansehen"}
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
function entfernungText(km: number, sprache: Sprache): string {
  if (km >= 9.95) return String(Math.round(km));
  return sprache === "en" ? km.toFixed(1) : km.toFixed(1).replace(".", ",");
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
