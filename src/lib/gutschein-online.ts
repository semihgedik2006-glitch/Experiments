import "server-only";
import { randomBytes } from "crypto";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";
import { TEAM_EMAIL, sendGutscheinGekauftEmail, sendGutscheinGekauftInternEmail } from "@/lib/email";
import { WEIHNACHTEN_WERT, artText, gueltigBisAb } from "@/lib/gutschein-verwaltung";
import { freierGutscheinCode } from "@/lib/gutschein-code";

/**
 * Der Online-Kauf über Stripe - vom Bezahlen bis zum fertigen Gutschein.
 *
 * Der Ablauf: Der Knopf auf der Gutscheinseite öffnet die Bezahlseite von
 * Stripe. Nach der Zahlung meldet Stripe das an /api/stripe/webhook, und
 * der Käufer landet auf /gutschein/danke. BEIDE Wege rufen
 * gutscheinAusStripe() auf - wer zuerst kommt, legt den Gutschein an, der
 * zweite findet ihn vor. So entsteht nie ein doppelter Gutschein, und es
 * fehlt auch keiner, wenn einer der beiden Wege ausfällt.
 */

let client: Stripe | null = null;

export function stripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) throw new Error("STRIPE_SECRET_KEY ist nicht gesetzt.");
  client ??= new Stripe(key);
  return client;
}

export function karteLink(token: string): string {
  return `${siteConfig.url}/gutschein/karte/${token}`;
}

/** Der Wert aus dem freiwilligen Feld "Für wen?" der Bezahlseite. */
function fuerAus(session: Stripe.Checkout.Session): string | null {
  const feld = session.custom_fields?.find((f) => f.key === "fuer");
  return feld?.text?.value?.trim().slice(0, 60) || null;
}

/**
 * Den Gutschein zu einer bezahlten Checkout-Sitzung anlegen - oder den
 * schon angelegten zurückgeben.
 *
 * Gibt null zurück, solange nicht bezahlt ist (z. B. Überweisung, die noch
 * aussteht). Dann kommt später ein weiteres Ereignis von Stripe.
 */
export async function gutscheinAusStripe(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") return null;
  if (session.metadata?.zweck !== "gutschein") return null;

  const vorhanden = await prisma.gutschein.findUnique({ where: { stripeSessionId: session.id } });
  if (vorhanden) return vorhanden;

  const jetzt = new Date();
  const kaeuferName = session.customer_details?.name?.trim() || "Online-Kauf";
  const kaeuferEmail = session.customer_details?.email?.trim().toLowerCase() || null;

  let gutschein;
  try {
    gutschein = await prisma.gutschein.create({
      data: {
        code: await freierGutscheinCode(),
        art: "weihnachten",
        betrag: Math.round((session.amount_total ?? WEIHNACHTEN_WERT * 100) / 100),
        status: "AUSGESTELLT",
        kaeuferName,
        kaeuferEmail,
        fuer: fuerAus(session),
        zahlweg: "stripe",
        stripeSessionId: session.id,
        karteToken: randomBytes(24).toString("hex"),
        ausgestelltAm: jetzt,
        gueltigBis: gueltigBisAb(jetzt),
      },
    });
  } catch (error) {
    // Webhook und Dankeseite gleichzeitig: Der andere war schneller.
    const parallel = await prisma.gutschein.findUnique({ where: { stripeSessionId: session.id } });
    if (parallel) return parallel;
    throw error;
  }

  // Die Mails nur beim Anlegen - also genau einmal.
  const angaben = {
    kaeuferName,
    kaeuferEmail: kaeuferEmail ?? "",
    bezeichnung: artText(gutschein.art, gutschein.betrag),
    betrag: `${gutschein.betrag} €`,
    code: gutschein.code,
    fuer: gutschein.fuer,
    gueltigBis: gutschein.gueltigBis ? formatDate(gutschein.gueltigBis) : "-",
    karteLink: karteLink(gutschein.karteToken as string),
  };
  if (kaeuferEmail) await sendGutscheinGekauftEmail(angaben);
  if (TEAM_EMAIL) await sendGutscheinGekauftInternEmail(TEAM_EMAIL, angaben);

  return gutschein;
}
