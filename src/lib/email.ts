import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { terminDatei } from "@/lib/ics";
import { siteConfig } from "@/lib/site-config";
import type { MailArt } from "@/generated/prisma/enums";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM = process.env.BOOKING_EMAIL_FROM ?? "Körperformen <onboarding@resend.dev>";

/**
 * Adresse für alles, was nicht an einen einzelnen Standort geht -
 * Kontaktnachrichten und Anfragen ohne Standort. Fehlt sie, unterbleibt
 * die Benachrichtigung; eine Mail an eine geratene Adresse wäre schlimmer
 * als keine.
 */
export const TEAM_EMAIL = process.env.TEAM_EMAIL?.trim() || null;

/** Ist der Versand überhaupt scharf? Wird im Adminbereich angezeigt. */
export function versandBereit(): boolean {
  return resend !== null;
}

export function versandAbsender(): string {
  return FROM;
}

/**
 * Ein Versand, eine Stelle.
 *
 * Vorher rief jede Funktion resend selbst auf, und wenn nichts ankam, gab
 * es nichts nachzusehen: keine Spur in der Datenbank, nur eine Zeile im
 * Serverprotokoll, an die im Studio niemand herankommt. Die häufigste
 * Frage ist aber genau die - "hat der Kunde die Bestätigung bekommen?".
 *
 * Deshalb läuft jeder Versand hier durch und hinterlässt eine Spur, auch
 * der gescheiterte. Und: Diese Funktion wirft nicht. Eine hakelnde
 * Mailzustellung darf keine Buchung verhindern, die schon in der
 * Datenbank steht.
 */
async function verschicken(
  art: MailArt,
  nachricht: {
    to: string;
    subject: string;
    text: string;
    /** Die Termindatei kommt als Buffer - so verlangt es der Anbieter. */
    attachments?: { filename: string; content: Buffer; contentType?: string }[];
  },
): Promise<boolean> {
  const protokoll = async (ok: boolean, fehler?: string) => {
    try {
      await prisma.mailLog.create({
        data: {
          art,
          empfaenger: nachricht.to,
          betreff: nachricht.subject.slice(0, 300),
          ok,
          fehler: fehler?.slice(0, 500),
        },
      });
    } catch (error) {
      // Auch das Protokoll darf den Ablauf nicht anhalten.
      console.error("Mail-Protokoll konnte nicht geschrieben werden:", error);
    }
  };

  if (!resend) {
    console.warn(
      `RESEND_API_KEY ist nicht gesetzt - "${nachricht.subject}" wurde nicht verschickt. Siehe .env.example.`,
    );
    await protokoll(false, "RESEND_API_KEY ist nicht gesetzt");
    return false;
  }

  try {
    const antwort = await resend.emails.send({ from: FROM, ...nachricht });
    // Resend meldet Fehler nicht immer als Ausnahme, sondern im Ergebnis.
    // Ohne diese Prüfung stünde im Protokoll "verschickt", obwohl der
    // Anbieter abgelehnt hat.
    if (antwort.error) {
      console.error("E-Mail abgelehnt:", antwort.error);
      await protokoll(false, antwort.error.message ?? String(antwort.error));
      return false;
    }
    await protokoll(true);
    return true;
  } catch (error) {
    console.error("E-Mail konnte nicht gesendet werden:", error);
    await protokoll(false, error instanceof Error ? error.message : String(error));
    return false;
  }
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
  const datei = termindateiFuer(angaben);

  return verschicken("BESTAETIGUNG", {
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
  return verschicken("ERINNERUNG", {
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
  const datei = termindateiFuer(angaben, { abgesagt: true, fassung: 1 });

  return verschicken("ABSAGE_GAST", {
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
  const datei = termindateiFuer(angaben, { fassung: 2 });

  return verschicken("VERSCHOBEN_GAST", {
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

/* ===========================================================================
   Neue Abläufe: Eingangsbestätigung, Benachrichtigung, Nachfassen.

   Die vier Mails oben setzen alle voraus, dass jemand im Adminbereich auf
   einen Knopf gedrückt hat oder ein Termin feststeht. Zwischen "Anfrage
   abgeschickt" und "Anfrage bestätigt" passierte dagegen nichts: Der
   Interessent bekam nur eine Meldung auf dem Bildschirm, und im Studio
   erfuhr niemand von der Anfrage, außer er sah nach.

   Genau dort brechen Anfragen weg - nicht am Formular.
=========================================================================== */

/** Die Angaben, die eine Anfrage für den Rückruf brauchbar machen. */
export type AnfrageAngaben = {
  id: string;
  name: string;
  email: string;
  phone: string;
  erreichbarkeit: string;
  studioName: string | null;
  terminZeile: string;
  terminWunsch: string | null;
  nachricht: string | null;
  aktionsCode: string | null;
  herkunft: string | null;
};

/**
 * Eingangsbestätigung an den Interessenten.
 *
 * Ausdrücklich KEINE Terminbestätigung - der Termin steht ja noch nicht.
 * Sie sagt drei Dinge: die Anfrage ist da, wir rufen an, und zwar zu der
 * Zeit, die du angegeben hast. Wer nach dem Absenden nichts hört, hält die
 * Sache für nicht angekommen und fragt beim nächsten Studio an.
 */
export async function sendAnfrageEingangEmail(angaben: AnfrageAngaben) {
  return verschicken("ANFRAGE_EINGANG", {
    to: angaben.email,
    subject: "Deine Anfrage ist angekommen",
    text: `Hallo ${angaben.name},

danke für deine Anfrage - sie liegt uns vor.

Was jetzt passiert: Wir melden uns telefonisch bei dir, um den Termin
festzumachen. Du hast angegeben, dass wir dich ${angaben.erreichbarkeit.toLowerCase()} am besten
erreichen - daran halten wir uns.

Das haben wir notiert:
- ${angaben.terminZeile}${angaben.studioName ? `\n- Studio: ${angaben.studioName}` : ""}${
      angaben.terminWunsch ? `\n- Dein Wunsch: ${angaben.terminWunsch}` : ""
    }
- Telefon: ${angaben.phone}

Stimmt etwas davon nicht, antworte einfach auf diese E-Mail.

Bis bald!
Dein Körperformen-Team`,
  });
}

/**
 * Benachrichtigung ans Studio.
 *
 * Enthält alles, was für den Rückruf nötig ist, damit niemand erst den
 * Adminbereich öffnen muss - der Anruf soll aus dem Postfach heraus
 * möglich sein. Die Adresse des Studios steht in den Studiodaten; fehlt
 * sie, geht die Mail an TEAM_EMAIL, und fehlt auch die, unterbleibt sie.
 */
export async function sendAnfrageInternEmail(an: string, angaben: AnfrageAngaben) {
  const zeilen = [
    `Name:        ${angaben.name}`,
    `Telefon:     ${angaben.phone}`,
    `E-Mail:      ${angaben.email}`,
    `Erreichbar:  ${angaben.erreichbarkeit}`,
    `Termin:      ${angaben.terminZeile}`,
    angaben.studioName ? `Studio:      ${angaben.studioName}` : null,
    angaben.terminWunsch ? `Wunschzeit:  ${angaben.terminWunsch}` : null,
    angaben.aktionsCode ? `Aktionscode: ${angaben.aktionsCode}` : null,
    angaben.herkunft ? `Kam über:    ${angaben.herkunft}` : null,
  ].filter(Boolean);

  return verschicken("ANFRAGE_INTERN", {
    to: an,
    subject: `Neue Probetermin-Anfrage: ${angaben.name}${angaben.studioName ? ` (${angaben.studioName})` : ""}`,
    text: `Es ist eine neue Anfrage eingegangen.

${zeilen.join("\n")}${angaben.nachricht ? `\n\nNachricht:\n${angaben.nachricht}` : ""}

Im Adminbereich bearbeiten:
${siteConfig.url}/admin/bookings?status=PENDING`,
  });
}

/**
 * Erinnerung an eine Anfrage, die zu lange offen liegt.
 *
 * Geht an das Studio, nie an den Interessenten: Ihn zu erinnern, dass wir
 * uns nicht gemeldet haben, macht die Sache nicht besser.
 */
export async function sendNachfassInternEmail(
  an: string,
  offen: { name: string; phone: string; erreichbarkeit: string; tage: number }[],
) {
  const liste = offen
    .map((a) => `- ${a.name}, ${a.phone} (erreichbar: ${a.erreichbarkeit}) - seit ${a.tage} Tagen offen`)
    .join("\n");

  return verschicken("NACHFASS_INTERN", {
    to: an,
    subject:
      offen.length === 1
        ? "Eine Probetermin-Anfrage wartet noch auf Antwort"
        : `${offen.length} Probetermin-Anfragen warten noch auf Antwort`,
    text: `Diese Anfragen sind noch offen:

${liste}

Im Adminbereich bearbeiten:
${siteConfig.url}/admin/bookings?status=PENDING`,
  });
}

/** Benachrichtigung über eine neue Kontaktnachricht. */
export async function sendKontaktInternEmail(
  an: string,
  nachricht: {
    name: string;
    email: string;
    phone: string | null;
    subject: string;
    message: string;
  },
) {
  return verschicken("KONTAKT_INTERN", {
    to: an,
    subject: `Neue Nachricht über das Kontaktformular: ${nachricht.subject}`,
    text: `Name:    ${nachricht.name}
E-Mail:  ${nachricht.email}${nachricht.phone ? `\nTelefon: ${nachricht.phone}` : ""}
Betreff: ${nachricht.subject}

${nachricht.message}

Im Adminbereich:
${siteConfig.url}/admin/nachrichten?gelesen=neu`,
  });
}
