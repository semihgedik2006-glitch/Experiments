import Link from "next/link";
import { UserRound, ShieldCheck, FileText, Lock, Star } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { googleReviews, studioFacts, trustPoints } from "@/lib/trust-config";
import { isVisible } from "@/lib/site-toggles";

const icons = {
  user: UserRound,
  shield: ShieldCheck,
  file: FileText,
  lock: Lock,
};

/**
 * Ausführlicher Vertrauensabschnitt für die Startseite.
 *
 * Zeigt nur, was belegbar ist: die Zusagen aus trust-config sowie - sobald
 * hinterlegt - echte Google-Bewertungen und Studiozahlen. Ist nichts
 * hinterlegt, fehlt der jeweilige Teil einfach, statt mit Platzhaltern
 * gefüllt zu werden.
 */
export async function TrustSection() {
  // Zwei Bedingungen: echte Zahlen müssen hinterlegt sein UND der Bereich
  // darf nicht im Adminbereich ausgeblendet sein.
  const showReviews = googleReviews !== null && (await isVisible("google-bewertungen"));

  return (
    <section className="border-t border-border bg-surface py-20 sm:py-24 md:py-32">
      <Container>
        <SectionHeader
          kicker="Ohne Kleingedrucktes"
          title="Worauf du dich verlassen kannst"
          intro="Wir arbeiten mit Menschen, die schon einmal enttäuscht wurden - von Verträgen, die sich nicht kündigen ließen, oder von Studios, in denen niemand hinsah. Deshalb schreiben wir hier auf, was bei uns gilt."
          className="mb-16"
        />

        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {trustPoints.map((point) => {
            const Icon = icons[point.icon];
            return (
              <StaggerItem key={point.title}>
                <div className="h-full card p-7">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-lime/10 text-accent">
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold tracking-tight">{point.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{point.text}</p>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>

        {studioFacts.length > 0 && (
          <Stagger className="mt-12 grid gap-6 text-center sm:grid-cols-2 lg:grid-cols-4">
            {studioFacts.map((fact) => (
              <StaggerItem key={fact.label}>
                <p className="font-display text-3xl font-black text-accent">{fact.value}</p>
                <p className="mt-2 text-sm text-muted">{fact.label}</p>
              </StaggerItem>
            ))}
          </Stagger>
        )}

        {showReviews && (
          <div className="mt-12 flex justify-center">
            <GoogleRatingBadge />
          </div>
        )}

        <p className="mt-12 text-center text-sm text-muted">
          Fragen zum Kleingedruckten?{" "}
          <Link href="/agb" className="text-accent underline underline-offset-2">
            Unsere AGB
          </Link>{" "}
          und die{" "}
          <Link href="/datenschutz" className="text-accent underline underline-offset-2">
            Datenschutzerklärung
          </Link>{" "}
          kannst du jederzeit nachlesen.
        </p>
      </Container>
    </section>
  );
}

/**
 * Bewertungshinweis - erscheint erst, wenn in trust-config echte Zahlen aus
 * dem Google-Unternehmensprofil hinterlegt sind.
 */
export function GoogleRatingBadge({ className = "" }: { className?: string }) {
  if (!googleReviews) return null;

  const { rating, count, url } = googleReviews;
  const full = Math.round(rating);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-3 rounded-full border border-border bg-surface-raised px-5 py-2.5 text-sm transition-colors hover:border-lime ${className}`}
    >
      <span className="flex gap-0.5 text-accent" aria-hidden>
        {Array.from({ length: full }).map((_, i) => (
          <Star key={i} size={14} fill="currentColor" />
        ))}
      </span>
      <span>
        <span className="font-semibold">{rating.toLocaleString("de-DE")}</span>
        <span className="text-muted"> von 5 &middot; {count} Google-Bewertungen</span>
      </span>
    </a>
  );
}
