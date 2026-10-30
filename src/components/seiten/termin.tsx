import type { Metadata } from "next";
import Link from "@/components/sprach-link";
import { notFound } from "next/navigation";
import { CalendarCheck, CalendarX, Clock, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { passtNoch } from "@/lib/kapazitaet";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { TerminVerwaltung, type FreieZeit } from "@/components/termin/termin-verwaltung";
import { oeffnungszeitenAufEnglisch } from "@/lib/i18n/oeffnungszeiten";
import type { Sprache } from "@/lib/sprache";

export function terminMetadaten(sprache: Sprache): Metadata {
  return {
    title: sprache === "en" ? "Your appointment" : "Dein Termin",
    // Diese Seite gehört genau einer Person. Sie darf weder in einer
    // Suchmaschine landen noch als Verweis weitergereicht werden.
    robots: { index: false, follow: false, nocache: true },
    referrer: "no-referrer",
  };
}

/** "18:30 Uhr" auf Deutsch, "6:30 pm" auf Englisch. */
function uhr(sprache: Sprache, zeit: string): string {
  return sprache === "en" ? oeffnungszeitenAufEnglisch(zeit) : `${zeit} Uhr`;
}

function spanne(sprache: Sprache, von: string, bis: string): string {
  return sprache === "en" ? `${uhr("en", von)} - ${uhr("en", bis)}` : `${von} - ${bis} Uhr`;
}

/** Wie weit in die Zukunft Ersatzzeiten angeboten werden. */
const WOCHEN_VORAUS = 6;

export async function TerminSeite({ sprache, token }: { sprache: Sprache; token: string }) {
  const en = sprache === "en";

  const buchung = await prisma.booking.findUnique({
    where: { manageToken: token },
    include: { slot: { include: { studio: true } }, studio: true },
  });

  // Bewusst dieselbe Antwort wie für eine Adresse, die es nie gab: Wer
  // einen Schlüssel durchprobiert, soll nicht erkennen können, ob er
  // knapp danebenlag.
  if (!buchung) return notFound();

  const heute = new Date();
  heute.setHours(0, 0, 0, 0);
  const vorbei = buchung.slot ? buchung.slot.date < heute : false;
  const abgesagt = buchung.status === "CANCELLED";
  const aenderbar = !vorbei && !abgesagt;

  // Ersatzzeiten: nur im selben Studio, nur freie, nur in den nächsten
  // Wochen. Ein Wechsel des Standorts wäre etwas anderes als ein
  // Verschieben - dafür gibt es die Terminbuchung.
  let freieZeiten: FreieZeit[] = [];
  if (aenderbar && buchung.slot) {
    const bis = new Date(heute);
    bis.setDate(bis.getDate() + WOCHEN_VORAUS * 7);

    const slots = await prisma.availabilitySlot.findMany({
      where: {
        studioId: buchung.slot.studioId,
        date: { gte: heute, lt: bis },
        id: { not: buchung.slot.id },
      },
      include: { bookings: { where: { status: { not: "CANCELLED" } } } },
      orderBy: [{ date: "asc" }, { startTime: "asc" }, { id: "asc" }],
    });

    // Wer zu zweit kommt, braucht auch nach dem Verschieben zwei Plätze -
    // sonst stünden hier Zeiten zur Auswahl, die die Aktion anschließend
    // ablehnt.
    freieZeiten = slots
      .filter((slot) => passtNoch(slot.capacity, slot.bookings, buchung.zuZweit))
      .slice(0, 60)
      .map((slot) => ({
        id: slot.id,
        label: `${formatDate(slot.date, sprache)}, ${spanne(sprache, slot.startTime, slot.endTime)}`,
      }));
  }

  return (
    <>
      <PageHeader
        // Die persönliche Terminseite eines Gastes ist kein Ort für
        // Zierde - hier steht eine Verabredung.
        ohneMotiv
        kicker={en ? "Your appointment" : "Dein Termin"}
        title={
          <>
            {en ? "Hello" : "Hallo"} <span className="text-accent">{buchung.name.split(" ")[0]}</span>
          </>
        }
        intro={
          en
            ? abgesagt
              ? "This appointment is cancelled."
              : vorbei
                ? "This appointment is already behind you."
                : "Here you can see your trial session and cancel or move it."
            : abgesagt
              ? "Dieser Termin ist abgesagt."
              : vorbei
                ? "Dieser Termin liegt bereits hinter dir."
                : "Hier siehst du deinen Probetermin und kannst ihn absagen oder verlegen."
        }
      />

      <Container className="pb-24">
        <div className="card max-w-2xl p-6">
          <p className="flex flex-wrap items-center gap-2 font-semibold">
            {abgesagt ? (
              <>
                <CalendarX size={18} className="text-danger" /> {en ? "Cancelled" : "Abgesagt"}
              </>
            ) : buchung.status === "CONFIRMED" ? (
              <>
                <CalendarCheck size={18} className="text-accent" /> {en ? "Confirmed" : "Bestätigt"}
              </>
            ) : (
              <>
                <Clock size={18} className="text-accent" /> {en ? "Request received" : "Anfrage eingegangen"}
              </>
            )}
          </p>

          {buchung.status === "PENDING" && !abgesagt && (
            <p className="mt-2 text-sm text-muted">
              {en
                ? "We have your request and will be in touch to confirm. You can still cancel it at any time."
                : "Wir haben deine Anfrage und melden uns zur Bestätigung. Absagen kannst du sie trotzdem jederzeit."}
            </p>
          )}

          <ul className="mt-5 space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <Clock size={17} className="mt-0.5 shrink-0 text-accent" />
              <span>
                {buchung.slot ? (
                  <>
                    {formatDate(buchung.slot.date, sprache)}
                    <br />
                    {spanne(sprache, buchung.slot.startTime, buchung.slot.endTime)}
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
                  en
                    ? "No fixed appointment yet - we will agree the time with you personally."
                    : "Noch kein fester Termin - wir stimmen die Zeit mit dir persönlich ab."
                )}
              </span>
            </li>
            {buchung.slot && (
              <li className="flex items-start gap-3">
                <MapPin size={17} className="mt-0.5 shrink-0 text-accent" />
                <span>
                  {buchung.slot.studio.name}
                  <br />
                  {buchung.slot.studio.street}, {buchung.slot.studio.postalCode}{" "}
                  {buchung.slot.studio.city}
                </span>
              </li>
            )}
          </ul>
        </div>

        <div className="max-w-2xl">
          {aenderbar ? (
            <TerminVerwaltung token={token} freieZeiten={freieZeiten} />
          ) : (
            <p className="mt-8 text-sm text-muted">
              {abgesagt ? (
                <>
                  {en ? "If you would like a new appointment," : "Wenn du einen neuen Termin möchtest,"}{" "}
                  <Link sprache={sprache} href="/probetermin" className="text-accent underline underline-offset-2">
                    {en ? "you will find all free times here" : "findest du hier alle freien Zeiten"}
                  </Link>
                  .
                </>
              ) : (
                <>
                  {en ? "Past appointments can no longer be changed." : "Vergangene Termine lassen sich nicht mehr ändern."}{" "}
                  <Link sprache={sprache} href="/probetermin" className="text-accent underline underline-offset-2">
                    {en ? "Book a new appointment" : "Neuen Termin buchen"}
                  </Link>
                </>
              )}
            </p>
          )}

          {/* Der Weg zu allen Terminen. Steht hier und nicht oben: Wer
              diesen Link geöffnet hat, wollte diesen einen Termin - die
              Übersicht ist das, was er danach vielleicht noch sucht. */}
          <p className="mt-8 text-sm text-muted">
            {en ? "You have several appointments with us?" : "Du hast mehrere Termine bei uns?"}{" "}
            <Link
              sprache={sprache}
              href="/meine-termine"
              className="text-accent underline underline-offset-2"
            >
              {en ? "See them all at once here" : "Hier siehst du alle auf einmal"}
            </Link>
            .
          </p>

          {aenderbar && buchung.slot && freieZeiten.length === 0 && (
            <p className="mt-4 text-sm text-muted">
              {en
                ? `There is no other free time at this studio in the next ${WOCHEN_VORAUS} weeks. Give us a call and we will find one together.`
                : `In den nächsten ${WOCHEN_VORAUS} Wochen ist in diesem Studio gerade keine andere Zeit frei. Ruf uns an, dann finden wir zusammen eine.`}
            </p>
          )}
        </div>
      </Container>
    </>
  );
}
