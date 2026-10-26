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
 * Läuft der Versand noch über die Testadresse von Resend?
 *
 * Ohne BOOKING_EMAIL_FROM greift der Notnagel onboarding@resend.dev. Der
 * Schlüssel ist dann hinterlegt, der Versand gilt als eingerichtet - und
 * trotzdem kommt bei keinem einzigen Kunden etwas an: Über diese Adresse
 * nimmt Resend nur Mails an das eigene Konto an, alles andere weist es
 * ab.
 *
 * Das ist die unangenehmste Art von Fehler, weil alles funktioniert
 * aussieht. Deshalb wird er im Adminbereich benannt.
 */
export function versandNurTestadresse(): boolean {
  return resend !== null && FROM.includes("resend.dev");
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
    /**
     * Zusätzliche Kopfzeilen. Bisher nur für List-Unsubscribe am
     * Newsletter - siehe sendNewsletterEmail.
     */
    headers?: Record<string, string>;
    /**
     * Wohin ein Klick auf "Antworten" geht.
     *
     * Der Absender ist eine Versandadresse, in die niemand hineinschaut.
     * Antwortet ein Kunde auf seine Bestätigung ("Ich komme 10 Minuten
     * später"), soll das beim Studio landen - und antwortet das Studio auf
     * eine Anfrage-Mail, beim Kunden. Ohne Angabe: die Sammeladresse.
     */
    replyTo?: string | null;
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
    const { replyTo, ...rest } = nachricht;
    const antwortAn = replyTo?.trim() || TEAM_EMAIL;
    const antwort = await resend.emails.send({
      from: FROM,
      ...rest,
      ...(antwortAn ? { replyTo: antwortAn } : {}),
    });
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
  /** Adresse des Studios - dorthin gehen Antworten des Kunden. */
  antwortAn?: string | null;
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
    replyTo: angaben.antwortAn,
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
    replyTo: angaben.antwortAn,
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
    replyTo: angaben.antwortAn,
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
    replyTo: angaben.antwortAn,
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
  ziel: string | null;
  nachricht: string | null;
  aktionsCode: string | null;
  herkunft: string | null;
  /** Adresse des Studios - dorthin gehen Antworten des Kunden. */
  antwortAn?: string | null;
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
    replyTo: angaben.antwortAn,
    subject: "Deine Anfrage ist angekommen",
    text: `Hallo ${angaben.name},

danke für deine Anfrage - sie liegt uns vor.

Was jetzt passiert: Wir melden uns telefonisch bei dir, um den Termin
festzumachen. Du hast angegeben, dass wir dich ${angaben.erreichbarkeit.toLowerCase()} am besten
erreichen - daran halten wir uns.

Das haben wir notiert:
- ${angaben.terminZeile}${angaben.studioName ? `\n- Studio: ${angaben.studioName}` : ""}${
      angaben.ziel ? `\n- Dein Ziel: ${angaben.ziel}` : ""
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
    angaben.ziel ? `Ziel:        ${angaben.ziel}` : null,
    angaben.aktionsCode ? `Aktionscode: ${angaben.aktionsCode}` : null,
    angaben.herkunft ? `Kam über:    ${angaben.herkunft}` : null,
  ].filter(Boolean);

  return verschicken("ANFRAGE_INTERN", {
    to: an,
    replyTo: angaben.email,
    subject: `Neue Probetermin-Anfrage: ${angaben.name}${angaben.studioName ? ` (${angaben.studioName})` : ""}`,
    text: `Es ist eine neue Anfrage eingegangen.

${zeilen.join("\n")}${angaben.nachricht ? `\n\nNachricht:\n${angaben.nachricht}` : ""}

Wer auf diese Mail antwortet, schreibt direkt an ${angaben.name}.

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
  offen: {
    name: string;
    phone: string;
    email: string;
    erreichbarkeit: string;
    terminZeile: string;
    studioName: string | null;
    ziel: string | null;
    tage: number;
  }[],
) {
  /*
   * Vorher standen hier nur Name, Telefon, Erreichbarkeit und die Zahl der
   * Tage. Wer die Mail bekam, konnte anrufen - mehr nicht. Für eine
   * schriftliche Antwort, für "worum ging es nochmal" oder für einen
   * Terminvorschlag musste er doch wieder in den Adminbereich.
   *
   * Jetzt steht alles in der Mail, was der Interessent angegeben hat. Der
   * Adminbereich ist dafür da, den Vorgang abzuschließen - nicht dafür,
   * die Telefonnummer nachzuschlagen.
   */
  const liste = offen
    .map((a) =>
      [
        `• ${a.name} - seit ${a.tage} ${a.tage === 1 ? "Tag" : "Tagen"} offen`,
        `  Telefon:    ${a.phone}`,
        `  E-Mail:     ${a.email}`,
        `  Erreichbar: ${a.erreichbarkeit}`,
        `  Termin:     ${a.terminZeile}`,
        a.studioName ? `  Studio:     ${a.studioName}` : null,
        a.ziel ? `  Ziel:       ${a.ziel}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n\n");

  return verschicken("NACHFASS_INTERN", {
    to: an,
    replyTo: offen.length === 1 ? offen[0].email : null,
    subject:
      offen.length === 1
        ? "Eine Probetermin-Anfrage wartet noch auf Antwort"
        : `${offen.length} Probetermin-Anfragen warten noch auf Antwort`,
    text: `Diese Anfragen sind noch offen. Alle Angaben stehen hier -
für den Anruf oder die Antwort per Mail musst du nirgendwo nachsehen.

${liste}

Im Adminbereich abschließen:
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
    replyTo: nachricht.email,
    subject: `Neue Nachricht über das Kontaktformular: ${nachricht.subject}`,
    text: `Name:    ${nachricht.name}
E-Mail:  ${nachricht.email}${nachricht.phone ? `\nTelefon: ${nachricht.phone}` : ""}
Betreff: ${nachricht.subject}

${nachricht.message}

Im Adminbereich:
${siteConfig.url}/admin/nachrichten?gelesen=neu`,
  });
}

/**
 * Die Bitte um eine Bewertung, einen Tag nach dem Termin.
 *
 * Drei Entscheidungen, die hier bewusst so getroffen sind:
 *
 * Einmal fragen. Eine zweite Bitte ist eine Belästigung, und wer beim
 * ersten Mal nicht wollte, will beim zweiten erst recht nicht.
 *
 * Alle fragen, nicht nur die Zufriedenen. Vorher abzuklopfen, wie jemand
 * das Training fand, und nur die Guten weiterzuschicken, ist verbotene
 * Rosinenpickerei - und man sieht es einem Profil an, in dem ausschließlich
 * fünf Sterne stehen.
 *
 * Ohne Gegenleistung. Eine Bewertung gegen einen Rabatt ist erkauft und
 * verstößt gegen die Richtlinien von Google.
 */
export async function sendBewertungEmail(
  angaben: TerminAngaben & { bewertungsLink: string },
) {
  return verschicken("BEWERTUNG", {
    to: angaben.email,
    replyTo: angaben.antwortAn,
    subject: "Wie war dein Probetraining?",
    text: `Hallo ${angaben.name},

gestern warst du bei uns${angaben.studioName ? ` in ${angaben.studioName.replace(/^Körperformen\s+/i, "")}` : ""} zum Probetraining.

Falls du dir zwei Minuten nehmen magst: Eine kurze Bewertung bei Google
hilft uns mehr als jede Anzeige - und sie hilft dem Nächsten, der überlegt,
ob EMS etwas für ihn ist.

${angaben.bewertungsLink}

Ehrlich ist uns dabei lieber als nett. Wenn etwas nicht gepasst hat,
schreib es gern auch einfach uns - dann können wir es ändern.

Viele Grüße
Dein Körperformen-Team`,
  });
}

/**
 * Ein Platz ist frei geworden.
 *
 * Bewusst ohne Reservierung: Der Platz wird nicht festgehalten, während
 * jemand überlegt. Wer zuerst bucht, bekommt ihn - und genau das steht
 * auch in der Mail. Alles andere wäre ein Versprechen, das eine
 * Terminliste nicht halten kann, sobald zwei Leute gleichzeitig klicken.
 */
export async function sendWartelisteFreiEmail(angaben: {
  email: string;
  name: string;
  terminZeile: string;
  studioName: string | null;
  studioAdresse: string | null;
  link: string;
  antwortAn?: string | null;
}) {
  return verschicken("WARTELISTE_FREI", {
    to: angaben.email,
    replyTo: angaben.antwortAn,
    subject: `Ein Platz ist frei: ${angaben.terminZeile}`,
    text: `Hallo ${angaben.name},

du wolltest Bescheid, wenn bei ${angaben.terminZeile} etwas frei wird - jetzt ist es so weit.${
      angaben.studioAdresse ? `\n\n${angaben.studioName}\n${angaben.studioAdresse}` : ""
    }

Hier kannst du die Zeit buchen:
${angaben.link}

Ehrlich gesagt: Wir halten den Platz nicht für dich fest. Wer zuerst bucht,
bekommt ihn - also lieber gleich als später.

Viele Grüße
Dein Körperformen-Team`,
  });
}

/**
 * Neuer Eintrag auf der Warteliste - ans Studio.
 *
 * Ohne diese Mail erfährt das Studio von jemandem, der sich eingetragen
 * hat, erst dann, wenn zufällig jemand in die Warteliste schaut. Dabei
 * ist das ein Interessent wie jeder andere: Er hat seine Daten
 * hinterlassen und weiß genau, wann er kann. Der einzige Unterschied ist,
 * dass seine Wunschzeit gerade belegt ist - und häufig lässt sich das mit
 * einem Anruf und einer anderen Zeit lösen, lange bevor jemand storniert.
 */
/**
 * Eine Newsletter-Ausgabe an einen Abonnenten.
 *
 * Der Abmeldelink wird hier angehängt und nicht dem Text überlassen, den
 * jemand im Adminbereich getippt hat - siehe src/lib/newsletter.ts. Wer
 * eine Ausgabe verschickt, kann ihn also nicht vergessen.
 *
 * Dazu die Kopfzeilen List-Unsubscribe und List-Unsubscribe-Post: Damit
 * blenden Gmail, Outlook und Apple Mail neben dem Absender einen eigenen
 * Abmelden-Knopf ein. Das ist kein Beiwerk - wer den nicht findet, drückt
 * stattdessen auf "Spam", und das trifft dann auch die Terminbestätigungen
 * an alle anderen.
 */
export async function sendNewsletterEmail(angaben: {
  empfaenger: string;
  betreff: string;
  /** Der fertige Text einschließlich Fuß (newsletterText). */
  text: string;
  abmeldeAdresse: string;
  /** Probeversand an die eigene Adresse - eigene Art im Protokoll. */
  test?: boolean;
}) {
  return verschicken(angaben.test ? "NEWSLETTER_TEST" : "NEWSLETTER", {
    to: angaben.empfaenger,
    subject: angaben.test ? `[Test] ${angaben.betreff}` : angaben.betreff,
    text: angaben.text,
    headers: {
      "List-Unsubscribe": `<${angaben.abmeldeAdresse}>`,
      // Sagt dem Postfach: Der Knopf darf ohne Rückfrage gedrückt werden.
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });
}

export async function sendWartelisteInternEmail(
  an: string,
  angaben: {
    name: string;
    email: string;
    phone: string;
    erreichbarkeit: string;
    terminZeile: string;
    studioName: string | null;
    zuZweit: boolean;
  },
) {
  const zeilen = [
    `Name:        ${angaben.name}`,
    `Telefon:     ${angaben.phone}`,
    `E-Mail:      ${angaben.email}`,
    `Erreichbar:  ${angaben.erreichbarkeit}`,
    `Wunschzeit:  ${angaben.terminZeile} (belegt)`,
    angaben.studioName ? `Studio:      ${angaben.studioName}` : null,
    angaben.zuZweit ? "Personen:    2 (kommt zu zweit)" : null,
  ].filter(Boolean);

  return verschicken("WARTELISTE_INTERN", {
    to: an,
    replyTo: angaben.email,
    subject: `Warteliste: ${angaben.name} für ${angaben.terminZeile}`,
    text: `Jemand hat sich auf eine belegte Zeit gesetzt.

${zeilen.join("\n")}

Wird der Platz frei, geht die Benachrichtigung automatisch raus. Bis dahin
lohnt oft ein Anruf mit einer anderen Zeit - warten muss niemand.

In der Warteliste ansehen:
${siteConfig.url}/admin/warteliste`,
  });
}

/**
 * Der Zugangslink zum eigenen Terminbereich.
 *
 * Bewusst nüchtern und kurz: Diese Mail wird im Postfach gesucht,
 * überflogen und angeklickt - alles innerhalb einer halben Minute, denn
 * jemand steht gerade vor dem Formular und wartet darauf. Alles, was den
 * Link umstellt, verlängert diese halbe Minute.
 *
 * Die Gültigkeitsdauer steht im Text, nicht nur im Kleingedruckten: Wer
 * die Mail morgen findet und der Link tut nichts mehr, soll den Grund
 * lesen können statt an einen Fehler zu glauben.
 *
 * Und der letzte Absatz gehört dazu: Diesen Link kann jeder anfordern,
 * der die Adresse kennt. Wer ihn ungefragt bekommt, soll wissen, dass
 * nichts passiert ist und nichts zu tun ist.
 */
export async function sendKundenbereichEmail(angaben: {
  email: string;
  /** Der Vorname, falls wir ihn aus einer Anfrage kennen. */
  name: string | null;
  link: string;
  gueltigMinuten: number;
}) {
  const anrede = angaben.name ? `Hallo ${angaben.name},` : "Hallo,";

  return verschicken("KUNDENBEREICH", {
    to: angaben.email,
    subject: "Deine Termine bei Körperformen",
    text: `${anrede}

hier ist dein Link zu deinen Terminen:

${angaben.link}

Er gilt ${angaben.gueltigMinuten} Minuten. Danach forderst du dir einfach
einen neuen an - das geht beliebig oft.

Du hast diesen Link nicht angefordert? Dann hat jemand deine Adresse in
unser Formular getippt. Passiert ist nichts: Ohne den Link oben kommt
niemand an deine Termine. Du kannst diese Mail einfach löschen.

Viele Grüße
Dein Körperformen-Team`,
  });
}

/* ------------------------------------------------------------------ */
/* Mitglieder                                                          */
/* ------------------------------------------------------------------ */

/**
 * Der Fuß unter jeder Mitglieder-Mail.
 *
 * Unter jeder Mitglieder-Mail steht, warum sie kommt und wie man sie
 * abbestellt. Wer das nicht findet,
 * drückt auf "Spam", und das trifft dann auch die Terminbestätigungen.
 */
function mitgliedFuss(bereichLink: string): string {
  return `--
Du bekommst diese Mail als Mitglied bei Körperformen.
Dein Mitgliederbereich (dort kannst du diese Mails auch abbestellen):
${bereichLink}`;
}

function studioKurz(studioName: string | null): string {
  return studioName ? studioName.replace(/^Körperformen\s+/i, "") : "";
}

export type MitgliedMailAngaben = {
  email: string;
  vorname: string;
  studioName: string | null;
  /** Antworten gehen ans Studio, nicht an die Versandadresse. */
  antwortAn: string | null;
  bereichLink: string;
};

/**
 * Die Mails in den ersten Wochen.
 *
 * Kein Verkauf, keine Angebote, keine Versprechen über Ergebnisse: Die
 * ersten Wochen entscheiden, ob jemand eine Gewohnheit aufbaut. Diese
 * Mails sollen dabei helfen und zeigen, dass jemand an ihn denkt - nicht
 * die nächste Rechnung vorbereiten.
 */
export async function sendMitgliedWillkommenEmail(
  woche: 1 | 3 | 6,
  angaben: MitgliedMailAngaben,
) {
  const ort = studioKurz(angaben.studioName);
  const texte = {
    1: {
      betreff: `Willkommen bei Körperformen${ort ? ` ${ort}` : ""}!`,
      text: `schön, dass du dabei bist!

Damit deine ersten Wochen rund laufen, drei Dinge, die oft gefragt werden:

- Komm ein paar Minuten vor deinem Termin. Dann bleibt Zeit zum Umziehen,
  und die 20 Minuten Training gehören ganz dir.
- Dein Trainer stellt die Intensität jedes Mal neu mit dir ein. Sag ruhig,
  wenn es sich zu viel oder zu wenig anfühlt - genau dafür ist er da.
- Passt ein Termin nicht? Verschieben geht über die Online-Terminbuchung
  oder einen kurzen Anruf im Studio.

Fragen? Antworte einfach auf diese Mail - sie landet direkt bei uns im Studio.`,
    },
    3: {
      betreff: "Drei Wochen dabei - wie läuft's?",
      text: `drei Wochen bist du jetzt bei uns. Zeit für eine kurze Zwischenfrage:
Hast du deinen festen Trainingstag gefunden?

Was vielen hilft: immer derselbe Wochentag, dieselbe Uhrzeit. Dann wird aus
dem Termin eine Gewohnheit, über die man nicht mehr nachdenken muss.

Und falls mal etwas dazwischenkommt: Ausgefallene Einheiten kannst du
nachholen - frag einfach im Studio, wann es passt.

Wenn dir etwas auffällt, das wir besser machen können, schreib uns.
Antworten auf diese Mail gehen direkt ans Studio.`,
    },
    6: {
      betreff: "Sechs Wochen - Zeit für einen kurzen Blick zurück",
      text: `sechs Wochen Training liegen hinter dir. Ein guter Moment, um mit deinem
Trainer kurz auf dein Ziel zu schauen: Was hat sich verändert, was soll
als Nächstes kommen?

Sprich ihn beim nächsten Termin einfach darauf an - fünf Minuten reichen.`,
    },
  }[woche];

  return verschicken("MITGLIED_WILLKOMMEN", {
    to: angaben.email,
    replyTo: angaben.antwortAn,
    subject: texte.betreff,
    text: `Hallo ${angaben.vorname},

${texte.text}

Viele Grüße
Dein Körperformen-Team${ort ? ` ${ort}` : ""}

${mitgliedFuss(angaben.bereichLink)}`,
  });
}

/**
 * Die Frage nach der Zufriedenheit, nach etwa vier Wochen.
 *
 * Ein Klick statt eines Fragebogens: Fünf Links, jeder führt auf eine
 * Seite, auf der die Note schon gewählt ist. Gespeichert wird erst beim
 * Absenden dort - Postfächer rufen Links vorab auf, und eine Note, die
 * niemand vergeben hat, wäre schlimmer als keine.
 *
 * Gefragt werden alle, nicht nur die, von denen man Gutes erwartet. Der
 * Zweck ist, die Unzufriedenen zu finden, solange man noch etwas ändern
 * kann.
 */
export async function sendMitgliedUmfrageEmail(
  angaben: MitgliedMailAngaben & { notenLinks: { note: number; text: string; link: string }[] },
) {
  const ort = studioKurz(angaben.studioName);
  return verschicken("MITGLIED_UMFRAGE", {
    to: angaben.email,
    replyTo: angaben.antwortAn,
    subject: "Eine Frage, ein Klick: Wie zufrieden bist du?",
    text: `Hallo ${angaben.vorname},

seit ein paar Wochen trainierst du bei uns${ort ? ` in ${ort}` : ""}. Wie zufrieden bist du bisher?
Ein Klick genügt:

${angaben.notenLinks.map((n) => `${n.text}:\n${n.link}`).join("\n\n")}

Ehrlich ist uns lieber als nett. Wenn etwas nicht passt, wollen wir es
wissen, solange wir es noch ändern können.

Viele Grüße
Dein Körperformen-Team${ort ? ` ${ort}` : ""}

${mitgliedFuss(angaben.bereichLink)}`,
  });
}

/** Glückwunsch zum Jubiläum. Ohne Angebot - ein Dank ist ein Dank. */
export async function sendMitgliedJubilaeumEmail(
  angaben: MitgliedMailAngaben & { dauer: string },
) {
  const ort = studioKurz(angaben.studioName);
  return verschicken("MITGLIED_JUBILAEUM", {
    to: angaben.email,
    replyTo: angaben.antwortAn,
    subject: `${angaben.dauer} bei Körperformen - danke!`,
    text: `Hallo ${angaben.vorname},

heute vor ${angaben.dauer.replace(/^1 Jahr$/, "einem Jahr").replace(/Monate$/, "Monaten").replace(/Jahre$/, "Jahren")} hast du bei uns angefangen. Danke, dass du dabei bist!

Wenn du magst, schau beim nächsten Termin mit deinem Trainer zurück: Was
hat sich seit dem Start verändert - und was ist dein nächstes Ziel?

Viele Grüße
Dein Körperformen-Team${ort ? ` ${ort}` : ""}

${mitgliedFuss(angaben.bereichLink)}`,
  });
}

/**
 * Die Wochenübersicht "Mitgliederpflege" an ein Studio.
 *
 * Montags, und nur wenn es etwas zu tun gibt. Eine Liste, die jede Woche
 * kommt, auch wenn sie leer ist, liest nach drei Wochen niemand mehr.
 */
export async function sendMitgliederInternEmail(
  an: string,
  angaben: {
    studioName: string;
    anrufen: { name: string; note: number; kommentar: string | null }[];
    gespraeche: { name: string; ende: string }[];
  },
) {
  const teile: string[] = [];
  if (angaben.anrufen.length > 0) {
    teile.push(`BITTE ANRUFEN - unzufrieden in der Umfrage (${angaben.anrufen.length})
${angaben.anrufen
  .map((a) => `- ${a.name}: Note ${a.note} von 5${a.kommentar ? ` - „${a.kommentar}“` : ""}`)
  .join("\n")}`);
  }
  if (angaben.gespraeche.length > 0) {
    teile.push(`GESPRÄCH VEREINBAREN - Erstlaufzeit endet bald (${angaben.gespraeche.length})
${angaben.gespraeche.map((g) => `- ${g.name}: endet am ${g.ende}`).join("\n")}`);
  }

  return verschicken("MITGLIEDER_INTERN", {
    to: an,
    subject: `Mitgliederpflege diese Woche - ${angaben.studioName}`,
    text: `Guten Morgen,

das steht diese Woche in ${angaben.studioName} an:

${teile.join("\n\n")}

Und wie jeden Montag: In LogX unter Aktionen/Aufgaben die Nichtanwesenheit
abrufen (mehr als 14, weniger als 60 Tage) und kurz durchtelefonieren.

Alles im Überblick:
${siteConfig.url}/admin/mitgliederpflege`,
  });
}

/* ------------------------------------------------------------------ */
/* Gutscheine                                                          */
/* ------------------------------------------------------------------ */

export type GutscheinAngaben = {
  kaeuferName: string;
  kaeuferEmail: string | null;
  kaeuferTelefon: string | null;
  bezeichnung: string;
  fuer: string | null;
  widmung: string | null;
  studioName: string | null;
  studioAdresse: string | null;
  studioTelefon: string | null;
  antwortAn: string | null;
};

/**
 * Eingangsbestätigung an den, der einen Gutschein angefragt hat.
 *
 * Steht ausdrücklich drin, dass noch nichts bezahlt ist und wie es
 * weitergeht - sonst wartet jemand auf eine Rechnung, die nie kommt.
 */
export async function sendGutscheinEingangEmail(angaben: GutscheinAngaben) {
  if (!angaben.kaeuferEmail) return false;
  return verschicken("GUTSCHEIN_EINGANG", {
    to: angaben.kaeuferEmail,
    replyTo: angaben.antwortAn,
    subject: "Deine Gutscheinanfrage ist angekommen",
    text: `Hallo ${angaben.kaeuferName},

danke für deine Anfrage! Das haben wir notiert:

${angaben.bezeichnung}${angaben.fuer ? `\nFür: ${angaben.fuer}` : ""}${angaben.widmung ? `\nWidmung: „${angaben.widmung}“` : ""}
${angaben.studioName ? `Studio: ${angaben.studioName}` : ""}

So geht es weiter: Das Studio meldet sich bei dir. Bezahlt und abgeholt
wird vor Ort - online zahlst du nichts. Der Gutschein gilt erst, wenn er
bezahlt ist.${
      angaben.studioAdresse
        ? `\n\n${angaben.studioName}\n${angaben.studioAdresse}${angaben.studioTelefon ? `\nTelefon ${angaben.studioTelefon}` : ""}`
        : ""
    }

Viele Grüße
Dein Körperformen-Team`,
  });
}

/** Neue Gutscheinanfrage - ans Studio. */
export async function sendGutscheinInternEmail(an: string, angaben: GutscheinAngaben) {
  const zeilen = [
    `Gutschein:   ${angaben.bezeichnung}`,
    angaben.fuer ? `Für:         ${angaben.fuer}` : null,
    angaben.widmung ? `Widmung:     „${angaben.widmung}“` : null,
    `Käufer:      ${angaben.kaeuferName}`,
    angaben.kaeuferTelefon ? `Telefon:     ${angaben.kaeuferTelefon}` : null,
    angaben.kaeuferEmail ? `E-Mail:      ${angaben.kaeuferEmail}` : null,
  ].filter(Boolean);

  return verschicken("GUTSCHEIN_INTERN", {
    to: an,
    replyTo: angaben.kaeuferEmail,
    subject: `Gutscheinanfrage: ${angaben.bezeichnung} für ${angaben.kaeuferName}`,
    text: `Jemand möchte einen Gutschein kaufen.

${zeilen.join("\n")}

Bitte melden, Termin zum Bezahlen und Abholen ausmachen. Nach dem Bezahlen
im Adminbereich auf „Bezahlt - ausstellen“ klicken; dann gilt der Code und
der Gutschein kann gedruckt werden:
${siteConfig.url}/admin/gutscheine`,
  });
}
