"use server";

import { redirect } from "next/navigation";
import { siteConfig } from "@/lib/site-config";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { WEIHNACHTSAKTION, WEIHNACHTSAKTION_EN, stripeEingerichtet } from "@/lib/gutschein";
import { stripeClient } from "@/lib/gutschein-online";
import { sichtbarkeit } from "@/lib/vorschau";

/**
 * Zur Bezahlseite von Stripe.
 *
 * Der Preis kommt hier aus dem Code und nicht aus dem Formular - sonst
 * könnte jemand seinen eigenen Preis mitschicken.
 *
 * Verkäufer ist bei Stripe das Studio selbst. Deshalb steht auf der
 * Bezahlseite über dem Knopf der Hinweis auf AGB und Widerrufsbelehrung;
 * der Knopf selbst heißt "Bezahlen" (Stripe, submit_type "pay").
 */
export async function gutscheinBeiStripeKaufen(formData: FormData) {
  // Wie die Seite: live für alle, als Vorschau nur für angemeldete Admins.
  if ((await sichtbarkeit("gutschein")) === "aus" || !stripeEingerichtet()) {
    redirect("/gutschein");
  }

  const ip = await getClientIp();
  if (!checkRateLimit(`gutschein-kauf:${ip}`, 10, 60 * 60 * 1000).allowed) {
    redirect("/gutschein#aktion");
  }

  const en = formData.get("sprache") === "en";
  const aktion = en ? WEIHNACHTSAKTION_EN : WEIHNACHTSAKTION;
  const basis = en ? `${siteConfig.url}/en` : siteConfig.url;

  const session = await stripeClient().checkout.sessions.create({
    mode: "payment",
    submit_type: "pay",
    locale: en ? "en" : "de",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: aktion.betrag * 100,
          product_data: {
            name: en ? `Voucher: ${aktion.titel}` : `Gutschein: ${aktion.titel}`,
            description: aktion.text,
          },
        },
      },
    ],
    custom_fields: [
      {
        key: "fuer",
        label: {
          type: "custom",
          custom: en ? "Who is it for? (optional)" : "Für wen ist der Gutschein? (freiwillig)",
        },
        type: "text",
        optional: true,
        text: { maximum_length: 60 },
      },
    ],
    custom_text: {
      submit: {
        message: en
          ? `By paying you accept our terms (${siteConfig.url}/agb). Right of withdrawal: ${siteConfig.url}/widerruf`
          : `Mit dem Bezahlen gelten unsere AGB (${siteConfig.url}/agb). Widerrufsbelehrung: ${siteConfig.url}/widerruf`,
      },
    },
    metadata: { zweck: "gutschein", art: "weihnachten" },
    success_url: `${siteConfig.url}/gutschein/danke?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${basis}/gutschein#aktion`,
  });

  if (!session.url) redirect("/gutschein#aktion");
  redirect(session.url);
}
