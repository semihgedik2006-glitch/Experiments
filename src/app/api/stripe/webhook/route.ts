import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { gutscheinAusStripe, stripeClient } from "@/lib/gutschein-online";

/**
 * Meldungen von Stripe - hier: "ein Gutschein ist bezahlt".
 *
 * Die Signatur wird geprüft, bevor irgendetwas passiert. Ohne diese
 * Prüfung könnte jeder eine erfundene Meldung schicken und sich damit
 * einen gültigen Gutschein ausstellen lassen. Geprüft wird gegen den
 * unveränderten Text der Anfrage - deshalb request.text() und nicht json().
 *
 * Bei Stripe einzutragen (Workbench -> Webhooks): diese Adresse und die
 * Ereignisse checkout.session.completed und
 * checkout.session.async_payment_succeeded. Das Geheimnis kommt in
 * STRIPE_WEBHOOK_SECRET.
 */
export async function POST(request: NextRequest) {
  const geheimnis = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  const signatur = request.headers.get("stripe-signature");
  if (!geheimnis || !signatur) {
    return NextResponse.json({ error: "Nicht eingerichtet." }, { status: 400 });
  }

  let ereignis: Stripe.Event;
  try {
    ereignis = stripeClient().webhooks.constructEvent(await request.text(), signatur, geheimnis);
  } catch {
    return NextResponse.json({ error: "Signatur ungültig." }, { status: 400 });
  }

  if (
    ereignis.type === "checkout.session.completed" ||
    ereignis.type === "checkout.session.async_payment_succeeded"
  ) {
    try {
      await gutscheinAusStripe(ereignis.data.object);
    } catch (error) {
      // Mit Fehlercode antworten: Dann versucht Stripe es später erneut.
      console.error("Gutschein aus Stripe-Zahlung fehlgeschlagen:", error);
      return NextResponse.json({ error: "Fehler beim Anlegen." }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
