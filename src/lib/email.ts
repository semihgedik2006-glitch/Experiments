import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM = process.env.BOOKING_EMAIL_FROM ?? "Körperformen <onboarding@resend.dev>";

export async function sendBookingConfirmedEmail(params: {
  to: string;
  name: string;
  dateLabel: string | null;
  startTime: string | null;
  studioName: string | null;
}) {
  if (!resend) {
    console.warn(
      "RESEND_API_KEY ist nicht gesetzt - Bestätigungs-E-Mail wurde übersprungen. Siehe .env.example.",
    );
    return;
  }

  const { to, name, dateLabel, startTime, studioName } = params;

  const appointmentLine =
    dateLabel && startTime
      ? `dein Probetermin am ${dateLabel} um ${startTime} Uhr${studioName ? ` im Studio ${studioName}` : ""} wurde bestätigt.`
      : "dein Probetermin wurde bestätigt.";

  await resend.emails.send({
    from: FROM,
    to,
    subject: "Dein Probetermin bei Körperformen ist bestätigt",
    text: `Hallo ${name},

${appointmentLine}

Wir melden uns in Kürze bei dir, um alle weiteren Details persönlich zu besprechen.

Bis bald!
Dein Körperformen-Team`,
  });
}
