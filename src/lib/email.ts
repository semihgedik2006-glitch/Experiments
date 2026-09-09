import { Resend } from "resend";
import { terminDatei } from "@/lib/ics";
import { siteConfig } from "@/lib/site-config";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM = process.env.BOOKING_EMAIL_FROM ?? "Körperformen <onboarding@resend.dev>";

function fehltSchluessel(zweck: string) {
  console.warn(
    `RESEND_API_KEY ist nicht gesetzt - ${zweck} wurde übersprungen. Siehe .env.example.`,
  );
}

export type TerminAngaben = {
  /** Für die Termindatei und den Betreff. */
  bookingId: string;
  /** Empfänger. */
  email: string;
  name: string;
  dateLabel: string | null;
  startTime: string | null;
  endTime: string | null;
  studioName: string | null;
  studioAdresse: string | null;
  /** Rohes Datum für die Termindatei. */
  datum: Date | null;
  /** Schlüssel für den persönlichen Link zum Absagen oder Verschieben. */
  manageToken: string | null;
};

/** Der persönliche Link, über den der Gast selbst absagen kann. */
export function verwaltungsLink(token: string | null): string | null {
  return token ? `${siteConfig.url}/termin/${token}` : null;
}

/**
 * Der Absatz mit dem Selbstbedienungs-Link. Steht in beiden E-Mails, damit
 * eine Absage nicht am Telefon hängen bleibt - und damit eine Zeit, die
 * doch nicht passt, wieder frei wird, statt ungenutzt zu verfallen.
 */
function verwaltungsAbsatz(token: string | null): string {
  const link = verwaltungsLink(token);
  if (!link) return "";
  return `

Passt der Termin doch nicht? Hier kannst du ihn selbst absagen oder auf eine
andere Zeit legen - ohne Anruf, rund um die Uhr:
${link}`;
}

/** Baut die Termindatei, sofern Datum und Uhrzeit vorliegen. */
function termindateiFuer(
  angaben: TerminAngaben,
  optionen: { abgesagt?: boolean; fassung?: number } = {},
) {
  if (!angaben.datum || !angaben.startTime) return null;

  const ort = [angaben.studioName, angaben.studioAdresse].filter(Boolean).join(", ");
  const link = verwaltungsLink(angaben.manageToken);

  const inhalt = terminDatei({
    id: angaben.bookingId,
    // Der Studioname trägt die Marke bereits ("Körperformen Hürth") -
    // ohne diese Fallunterscheidung stünde sie doppelt im Kalender.
    titel: angaben.studioName
      ? `Probetraining bei ${angaben.studioName}`
      : "Probetraining bei Körperformen",
    beschreibung: [
      "Dein kostenloses EMS-Probetraining.",
      "Komm bitte ein paar Minuten früher - Trainingskleidung stellen wir.",
      link ? `Absagen oder verschieben: ${link}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    ort: ort || "Körperformen",
    datum: angaben.datum,
    von: angaben.startTime,
    // Ohne Endzeit eine Stunde annehmen - ein Termin ohne Ende belegt in
    // manchen Kalendern den ganzen Tag.
    bis: angaben.endTime ?? plusEineStunde(angaben.startTime),
    abgesagt: optionen.abgesagt,
    fassung: optionen.fassung,
  });

  return {
    filename: "probetermin.ics",
    content: Buffer.from(inhalt, "utf8"),
    contentType: "text/calendar; charset=utf-8; method=PUBLISH",
  };
}

function plusEineStunde(zeit: string): string {
  const [stunde, minute] = zeit.split(":").map(Number);
  return `${String((stunde + 1) % 24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function terminZeile(angaben: TerminAngaben): string {
  if (!angaben.dateLabel || !angaben.startTime) return "dein Probetermin";
  return `dein Probetermin am ${angaben.dateLabel} um ${angaben.startTime} Uhr${
    angaben.studioName ? ` im Studio ${angaben.studioName}` : ""
  }`;
}

export async function sendBookingConfirmedEmail(angaben: TerminAngaben) {
  if (!resend) return fehltSchluessel("Bestätigungs-E-Mail");

  const datei = termindateiFuer(angaben);

  await resend.emails.send({
    from: FROM,
    to: angaben.email,
    subject: "Dein Probetermin bei Körperformen ist bestätigt",
    text: `Hallo ${angaben.name},

${terminZeile(angaben)} wurde bestätigt.${
      angaben.studioAdresse ? `\n\nAdresse: ${angaben.studioAdresse}` : ""
    }

${datei ? "Im Anhang findest du eine Termindatei - ein Tippen darauf legt den Termin in deinen Kalender.\n" : ""}Bring bitte etwas Zeit mit und komm ein paar Minuten früher. Trainingskleidung stellen wir.${verwaltungsAbsatz(angaben.manageToken)}

Bis bald!
Dein Körperformen-Team`,
    ...(datei ? { attachments: [datei] } : {}),
  });
}

/**
 * Erinnerung am Vortag.
 *
 * Bewusst knapp: Wer sie liest, weiß schon, worum es geht - sie soll an den
 * Termin erinnern und den Weg zum Absagen zeigen, nicht noch einmal werben.
 */
export async function sendReminderEmail(angaben: TerminAngaben) {
  if (!resend) return fehltSchluessel("Erinnerungs-E-Mail");

  await resend.emails.send({
    from: FROM,
    to: angaben.email,
    subject: `Erinnerung: ${angaben.dateLabel ? `dein Probetermin am ${angaben.dateLabel}` : "dein Probetermin"}`,
    text: `Hallo ${angaben.name},

kurze Erinnerung: ${terminZeile(angaben)} steht an - also morgen.${
      angaben.studioAdresse ? `\n\nAdresse: ${angaben.studioAdresse}` : ""
    }

Komm bitte ein paar Minuten früher. Trainingskleidung stellen wir.${verwaltungsAbsatz(angaben.manageToken)}

Bis morgen!
Dein Körperformen-Team`,
  });
}

/** Bestätigung an den Gast, nachdem er selbst abgesagt hat. */
export async function sendCancelledByGuestEmail(angaben: TerminAngaben) {
  if (!resend) return fehltSchluessel("Absage-Bestätigung");

  const datei = termindateiFuer(angaben, { abgesagt: true, fassung: 1 });

  await resend.emails.send({
    from: FROM,
    to: angaben.email,
    subject: "Dein Probetermin wurde abgesagt",
    text: `Hallo ${angaben.name},

${terminZeile(angaben)} ist abgesagt. Es ist nichts weiter zu tun.

Wenn du einen neuen Termin möchtest, findest du alle freien Zeiten hier:
${siteConfig.url}/probetermin

Viele Grüße
Dein Körperformen-Team`,
    ...(datei ? { attachments: [datei] } : {}),
  });
}

/** Bestätigung an den Gast, nachdem er den Termin selbst verlegt hat. */
export async function sendMovedByGuestEmail(angaben: TerminAngaben) {
  if (!resend) return fehltSchluessel("Bestätigung der Verlegung");

  const datei = termindateiFuer(angaben, { fassung: 2 });

  await resend.emails.send({
    from: FROM,
    to: angaben.email,
    subject: "Dein Probetermin wurde verschoben",
    text: `Hallo ${angaben.name},

alles klar - ${terminZeile(angaben)}.${
      angaben.studioAdresse ? `\n\nAdresse: ${angaben.studioAdresse}` : ""
    }

${datei ? "Die Termindatei im Anhang aktualisiert den Eintrag in deinem Kalender.\n" : ""}${verwaltungsAbsatz(angaben.manageToken).trimStart()}

Bis bald!
Dein Körperformen-Team`,
    ...(datei ? { attachments: [datei] } : {}),
  });
}
