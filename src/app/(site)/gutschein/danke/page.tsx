import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { stripeEingerichtet } from "@/lib/gutschein";
import { gutscheinAusStripe, stripeClient } from "@/lib/gutschein-online";
import { artText } from "@/lib/gutschein-verwaltung";

export const metadata: Metadata = {
  title: "Danke für deinen Kauf",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

/**
 * Hierher schickt Stripe nach der Zahlung.
 *
 * Die Seite fragt bei Stripe nach, ob wirklich bezahlt ist - die Kennung
 * in der Adresse allein beweist nichts. Ist bezahlt, wird der Gutschein
 * angelegt, falls der Webhook noch nicht da war (siehe
 * gutscheinAusStripe: es entsteht trotzdem nur einer).
 */
export default async function GutscheinDankeSeite({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  let gutschein: Awaited<ReturnType<typeof gutscheinAusStripe>> = null;
  if (session_id && /^cs_[A-Za-z0-9_]+$/.test(session_id) && stripeEingerichtet()) {
    try {
      const session = await stripeClient().checkout.sessions.retrieve(session_id);
      gutschein = await gutscheinAusStripe(session);
    } catch (error) {
      console.error("Gutschein-Dankeseite:", error);
    }
  }

  return (
    <>
      <PageHeader
        ohneMotiv
        kicker="Gutschein"
        title={
          gutschein ? (
            <>
              Danke - dein Gutschein ist <span className="text-accent">fertig</span>
            </>
          ) : (
            <>Danke für deinen Kauf</>
          )
        }
        intro={
          gutschein
            ? "Wir haben ihn dir auch per E-Mail geschickt."
            : "Sobald die Zahlung bestätigt ist, kommt dein Gutschein per E-Mail - meist innerhalb weniger Minuten."
        }
      />
      <Container className="max-w-2xl pb-24">
        {gutschein ? (
          <div className="rounded-2xl border border-lime bg-surface p-8">
            <p className="flex items-center gap-2 font-semibold text-accent">
              <CheckCircle2 size={20} aria-hidden /> {artText(gutschein.art, gutschein.betrag)}
            </p>
            <p className="mt-4 text-sm text-muted">Code</p>
            <p className="font-mono text-2xl font-semibold tracking-wider">{gutschein.code}</p>
            {gutschein.karteToken && (
              <Link
                href={`/gutschein/karte/${gutschein.karteToken}`}
                className="mt-6 inline-flex rounded-full bg-lime px-6 py-3 text-sm font-semibold text-on-lime"
              >
                Gutschein ansehen und drucken
              </Link>
            )}
            <p className="mt-6 text-sm text-muted">
              Eingelöst wird im Studio: Die beschenkte Person meldet sich mit dem Code und vereinbart
              ihren ersten Termin.
            </p>
          </div>
        ) : (
          <p className="flex items-start gap-2 text-sm text-muted">
            <Clock size={16} className="mt-0.5 shrink-0" aria-hidden />
            Keine Mail bekommen? Schau bitte im Spam-Ordner nach oder schreib uns über das
            Kontaktformular - wir kümmern uns darum.
          </p>
        )}
      </Container>
    </>
  );
}
