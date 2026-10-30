import type { Metadata } from "next";
import Link from "@/components/sprach-link";
import {
  CalendarCheck,
  CalendarClock,
  CalendarX,
  Clock,
  MapPin,
  Pencil,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { ZugangAnfordern } from "@/components/termin/zugang-anfordern";
import { zugangPruefen } from "@/lib/kundenbereich";
import { oeffnungszeitenAufEnglisch } from "@/lib/i18n/oeffnungszeiten";
import type { Sprache } from "@/lib/sprache";

export function meineTermineListeMetadaten(sprache: Sprache): Metadata {
  return {
    title: sprache === "en" ? "My appointments" : "Meine Termine",
    // Wie die Seite zum einzelnen Termin: Sie gehört genau einem Menschen
    // und darf weder in einer Suchmaschine landen noch beim Weiterklicken
    // als Herkunft mitgehen.
    robots: { index: false, follow: false, nocache: true },
    referrer: "no-referrer",
  };
}

/** "18:30" auf Deutsch, "6:30 pm" auf Englisch. */
function uhr(sprache: Sprache, zeit: string): string {
  return sprache === "en" ? oeffnungszeitenAufEnglisch(zeit) : `${zeit} Uhr`;
}

/**
 * Die eigenen Termine, erreicht über den Link aus der E-Mail.
 *
 * Diese Seite zeigt und verweist weiter - geändert wird weiterhin auf
 * der Seite zum einzelnen Termin. Nicht aus Vorsicht, sondern damit es
 * das Absagen nur einmal gibt: Zwei Stellen, an denen ein Termin
 * storniert werden kann, sind zwei Stellen, an denen die
 * Absage-E-Mail und die frei werdende Zeit auseinanderlaufen können.
 *
 * Dass der Weiterleitungslink den Schlüssel zum einzelnen Termin
 * enthält, weitet nichts aus: Wer diese Seite offen hat, hat Zugriff auf
 * das Postfach - und dort liegen die Bestätigungsmails mit genau diesen
 * Schlüsseln ohnehin.
 *
 * Ein abgelaufener Schlüssel führt nicht auf eine Fehlerseite, sondern
 * auf dasselbe Formular wie am Anfang - denn abgelaufen ist hier der
 * Normalfall und kein Fehler. Ein unbekannter Schlüssel zeigt genau
 * dasselbe: So lässt sich von außen nicht unterscheiden, ob ein
 * Schlüssel je gültig war.
 */
export async function MeineTermineListe({ sprache, token }: { sprache: Sprache; token: string }) {
  const en = sprache === "en";
  const zugang = await zugangPruefen(token);

  if (!zugang) {
    return (
      <>
        <PageHeader
          ohneMotiv
          kicker={en ? "Your appointments" : "Deine Termine"}
          title={
            en ? (
              <>
                This link is <span className="text-accent">no longer valid</span>
              </>
            ) : (
              <>
                Dieser Link gilt <span className="text-accent">nicht mehr</span>
              </>
            )
          }
          intro={
            en
              ? "Access links expire after a short time - that is intentional. You can get a new one right away, as often as you like."
              : "Zugangslinks laufen nach kurzer Zeit ab - das ist so gewollt. Einen neuen bekommst du sofort, beliebig oft."
          }
        />
        <Container className="pb-24">
          <ZugangAnfordern />
        </Container>
      </>
    );
  }

  const heute = new Date();
  heute.setHours(0, 0, 0, 0);

  const buchungen = await prisma.booking.findMany({
    // Ohne Rücksicht auf Groß- und Kleinschreibung - aus demselben Grund
    // wie beim Anfordern: An der Anfrage steht die Adresse so, wie sie
    // getippt wurde.
    where: { email: { equals: zugang.email, mode: "insensitive" } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      status: true,
      createdAt: true,
      manageToken: true,
      zuZweit: true,
      terminTag: true,
      terminUhrzeit: true,
      slot: {
        select: {
          date: true,
          startTime: true,
          endTime: true,
          studio: { select: { name: true, street: true, postalCode: true, city: true } },
        },
      },
      studio: { select: { name: true, street: true, postalCode: true, city: true } },
    },
  });

  // Eine Anfrage ohne feste Zeit zählt als offen, solange sie nicht
  // abgesagt ist: Sie wartet auf einen Rückruf und gehört damit nach
  // oben, nicht ins Archiv.
  // Der Tag des Termins: fester Platz oder vom Studio eingetragen.
  const terminTag = (b: (typeof buchungen)[number]) => b.slot?.date ?? b.terminTag ?? null;

  const istOffen = (b: (typeof buchungen)[number]) => {
    const tag = terminTag(b);
    return b.status !== "CANCELLED" && (!tag || tag >= heute);
  };

  // Abgefragt wird nach Eingang, angezeigt wird nach Termin: In einer
  // Liste mit der Überschrift "Kommende Termine" erwartet niemand die
  // zuletzt gestellte Anfrage oben, sondern den nächsten Termin.
  // Anfragen ohne feste Zeit haben keinen Platz auf dieser Zeitachse und
  // stehen deshalb hinten.
  const offen = buchungen
    .filter(istOffen)
    .sort((a, b) => (terminTag(a)?.getTime() ?? Infinity) - (terminTag(b)?.getTime() ?? Infinity));

  // Rückwärts: Das zuletzt Gewesene interessiert am ehesten.
  const vergangen = buchungen
    .filter((b) => !istOffen(b))
    .sort(
      (a, b) =>
        (terminTag(b)?.getTime() ?? b.createdAt.getTime()) -
        (terminTag(a)?.getTime() ?? a.createdAt.getTime()),
    );

  const vorname = buchungen[0]?.name.split(" ")[0];

  return (
    <>
      <PageHeader
        ohneMotiv
        kicker={en ? "Your appointments" : "Deine Termine"}
        title={
          vorname ? (
            <>
              {en ? "Hello" : "Hallo"} <span className="text-accent">{vorname}</span>
            </>
          ) : en ? (
            <>
              Your <span className="text-accent">appointments</span>
            </>
          ) : (
            <>
              Deine <span className="text-accent">Termine</span>
            </>
          )
        }
        intro={
          en
            ? offen.length > 0
              ? `This is what is coming up - under ${zugang.email}.`
              : `There is nothing coming up under ${zugang.email} at the moment.`
            : offen.length > 0
              ? `Das steht bei dir an - unter ${zugang.email}.`
              : `Unter ${zugang.email} steht bei uns gerade nichts an.`
        }
      />

      <Container className="pb-24">
        <section>
          <h2 className="text-lg font-semibold">{en ? "Upcoming appointments" : "Kommende Termine"}</h2>
          {offen.length === 0 ? (
            <p className="mt-3 max-w-xl text-sm text-muted">
              {en ? "No open appointment at the moment." : "Gerade kein offener Termin."}{" "}
              <Link sprache={sprache} href="/probetermin" className="text-accent underline underline-offset-2">
                {en ? "Book a new appointment" : "Neuen Termin buchen"}
              </Link>
            </p>
          ) : (
            <ul className="mt-5 space-y-4">
              {offen.map((buchung) => (
                <li key={buchung.id}>
                  <TerminKarte buchung={buchung} sprache={sprache} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {vergangen.length > 0 && (
          <section className="mt-14">
            <h2 className="text-lg font-semibold">{en ? "Earlier" : "Früher"}</h2>
            <ul className="mt-5 space-y-3">
              {vergangen.map((buchung) => (
                <li key={buchung.id}>
                  <TerminKarte buchung={buchung} sprache={sprache} vorbei />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Die Gültigkeit steht am Ende und nicht als Warnbalken oben:
            Sie ist eine Auskunft, kein Problem. */}
        {en ? (
          <p className="mt-14 border-t border-border pt-6 text-xs text-muted">
            This link is valid until{" "}
            {zugang.ablaufAm.toLocaleTimeString("en-GB", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
              timeZone: "Europe/Berlin",
            })}
            . After that, get a new one at{" "}
            <Link sprache={sprache} href="/meine-termine" className="text-accent underline underline-offset-2">
              my-appointments
            </Link>{" "}
            - as often as you like.
          </p>
        ) : (
          <p className="mt-14 border-t border-border pt-6 text-xs text-muted">
            Dieser Link gilt noch bis{" "}
            {zugang.ablaufAm.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}{" "}
            Uhr. Danach holst du dir auf{" "}
            <Link sprache={sprache} href="/meine-termine" className="text-accent underline underline-offset-2">
              meine-termine
            </Link>{" "}
            einen neuen - beliebig oft.
          </p>
        )}
      </Container>
    </>
  );
}

type Buchung = {
  id: string;
  status: string;
  createdAt: Date;
  manageToken: string | null;
  zuZweit: boolean;
  terminTag: Date | null;
  terminUhrzeit: string | null;
  slot: {
    date: Date;
    startTime: string;
    endTime: string;
    studio: { name: string; street: string; postalCode: string; city: string };
  } | null;
  studio: { name: string; street: string; postalCode: string; city: string } | null;
};

/**
 * Eine Zeile in der Liste.
 *
 * Der Standort steht auch dann da, wenn keine feste Zeit gewählt wurde -
 * ohne ihn stünde bei einer Anfrage ohne Termin nur "noch offen", und
 * niemand wüsste, um welches der vierzehn Studios es geht.
 */
function TerminKarte({
  buchung,
  vorbei,
  sprache,
}: {
  buchung: Buchung;
  vorbei?: boolean;
  sprache: Sprache;
}) {
  const en = sprache === "en";
  const ort = buchung.slot?.studio ?? buchung.studio;
  const abgesagt = buchung.status === "CANCELLED";

  // Kein Abdunkeln für Vergangenes: Ein Deckkraftwert über der ganzen
  // Karte trifft auch den ohnehin schon grauen Adresstext, und der
  // rutscht damit unter den lesbaren Kontrast - gemessen, nicht vermutet.
  // Die Überschrift "Früher" sagt dasselbe, ohne etwas unlesbar zu machen.
  return (
    <div className="card p-5">
      <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
        {abgesagt ? (
          <>
            <CalendarX size={17} className="text-danger" aria-hidden /> {en ? "Cancelled" : "Abgesagt"}
          </>
        ) : buchung.status === "CONFIRMED" ? (
          <>
            <CalendarCheck size={17} className="text-accent" aria-hidden /> {en ? "Confirmed" : "Bestätigt"}
          </>
        ) : (
          <>
            <Clock size={17} className="text-accent" aria-hidden />{" "}
            {en ? "Request received" : "Anfrage eingegangen"}
          </>
        )}
        {buchung.zuZweit && (
          <span className="font-normal text-muted">· {en ? "two people" : "zu zweit"}</span>
        )}
      </p>

      <p className="mt-3 flex items-start gap-2.5 text-sm">
        <CalendarClock size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden />
        <span>
          {buchung.slot ? (
            <>
              {formatDate(buchung.slot.date, sprache)}
              <br />
              {en
                ? `${uhr("en", buchung.slot.startTime)} - ${uhr("en", buchung.slot.endTime)}`
                : `${buchung.slot.startTime} - ${buchung.slot.endTime} Uhr`}
            </>
          ) : buchung.terminTag ? (
            <>
              {formatDate(buchung.terminTag, sprache)}
              {buchung.terminUhrzeit && (
                <>
                  <br />
                  {uhr(sprache, buchung.terminUhrzeit)}
                </>
              )}
            </>
          ) : (
            <>
              {en
                ? "No fixed time yet - we will agree it with you personally."
                : "Noch keine feste Zeit - wir stimmen sie mit dir persönlich ab."}
              <br />
              <span className="text-muted">
                {en ? "Requested on" : "Angefragt am"} {formatDate(buchung.createdAt, sprache)}
              </span>
            </>
          )}
        </span>
      </p>

      {ort && (
        <p className="mt-2.5 flex items-start gap-2.5 text-sm">
          <MapPin size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden />
          <span>
            {ort.name}
            <br />
            <span className="text-muted">
              {ort.street}, {ort.postalCode} {ort.city}
            </span>
          </span>
        </p>
      )}

      {/* Nur bei dem, was sich noch ändern lässt. Ein Knopf an einem
          vergangenen Termin führt auf eine Seite, die "geht nicht mehr"
          sagt - das ist ein Klick, der nur enttäuscht. */}
      {!vorbei && !abgesagt && buchung.manageToken && (
        <Link
          sprache={sprache}
          href={`/termin/${buchung.manageToken}`}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
        >
          <Pencil size={14} aria-hidden />
          {en ? "Cancel or reschedule" : "Absagen oder verlegen"}
        </Link>
      )}
    </div>
  );
}
