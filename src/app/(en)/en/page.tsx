import type { Metadata } from "next";
import Link from "next/link";
import { Check, Clock, MapPin, Phone, Zap } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ImpulsMotiv } from "@/components/ui/impuls-motiv";
import { ImpulsTrenner } from "@/components/ui/impuls-trenner";
import { BookingFlow } from "@/components/booking/booking-flow";
import { getStudios, getSlotsMitBelegung } from "@/lib/data";
import { tageJeStudio } from "@/lib/termin-tage";
import { legalConfig } from "@/lib/legal-config";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "EMS training in Cologne - in English",
  description:
    "One 20-minute session a week, guided one to one. Fourteen studios around Cologne. Book a free trial session in English - no contract, no pressure.",
  alternates: {
    canonical: "/en",
    // Beide Fassungen zeigen aufeinander. Ohne diese Angabe hält Google
    // sie für zwei Seiten über dasselbe Thema und wertet eine davon ab.
    languages: { de: "/", en: "/en" },
  },
};

/**
 * Die englische Einstiegsseite.
 *
 * Eine Seite, nicht eine ganze übersetzte Website - und das ist Absicht.
 * Wer "EMS training Cologne English" sucht, hat genau zwei Fragen: Was
 * ist das, und wie komme ich zu einem Termin? Beide werden hier
 * beantwortet, und das Formular steht auf derselben Seite. Eine
 * vollständige Übersetzung aller vierzehn Unterseiten wäre mehr Text, aber
 * kein besserer Weg zum Termin.
 *
 * Warum keine Preise: Dieselbe Haltung wie auf der deutschen Seite - das
 * Angebot entsteht im Gespräch. Hier steht nur, WIE sich der Preis
 * zusammensetzt, damit niemand mit der Erwartung einer Zahl kommt.
 */

const schritte = [
  {
    titel: "Come in for a free trial",
    text: "No contract, no obligation. You get proper training gear on site - just bring yourself.",
  },
  {
    titel: "20 minutes, one to one",
    text: "A trainer stays with you the whole time, adjusts the intensity and watches your form. You are never left alone on the floor.",
  },
  {
    titel: "Once a week is enough",
    text: "That is the whole point. The session is short because the stimulus is strong - and because your week is already full.",
  },
];

const argumente = [
  "One session a week, 20 minutes on the floor",
  "Always guided - never a machine you figure out alone",
  "Trainers speak English at most of our locations",
  "No joining fee, no hidden extras",
];

export default async function EnglishPage() {
  const [studios, slots] = await Promise.all([getStudios(), getSlotsMitBelegung()]);
  // Die Sprache auch hier: Ohne sie stünden auf der englischen Seite
  // deutsche Tagesabkürzungen ("Fr., 12.09.") - gemessen als einziger
  // deutscher Rest im Formular.
  const slotsByStudio = tageJeStudio(slots, "en");

  return (
    <>
      <section className="relative overflow-hidden border-b border-border py-16 md:py-24">
        <div
          aria-hidden
          className="zierde-ruht pointer-events-none absolute -right-24 top-1/2 hidden w-[420px] -translate-y-1/2 opacity-50 lg:block"
        >
          <ImpulsMotiv className="w-full" />
        </div>

        <Container className="relative max-w-4xl">
          <span
            className="hero-anim flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent"
            style={{ "--hero-delay": "0.05s" } as React.CSSProperties}
          >
            <span
              aria-hidden
              className="strich-waechst h-px w-8 bg-accent/50"
              style={{ "--hero-delay": "0.18s" } as React.CSSProperties}
            />
            EMS training · Cologne
          </span>

          <h1
            className="hero-anim mt-4 text-balance hyphens-auto text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl md:text-6xl"
            style={{ "--hero-delay": "0.14s" } as React.CSSProperties}
          >
            Twenty minutes a week.{" "}
            <span className="text-accent-strong">That is the whole plan.</span>
          </h1>

          <p
            className="hero-anim mt-6 max-w-xl text-lg leading-relaxed text-muted"
            style={{ "--hero-delay": "0.26s" } as React.CSSProperties}
          >
            EMS is strength training with electrical impulses. One short session a
            week, guided one to one, at {studios.length > 1 ? `${studios.length} studios` : "our studio"}{" "}
            around Cologne. New here? The first session is free - and we will happily
            run it in English.
          </p>

          <ul className="mt-10 space-y-4">
            {argumente.map((punkt, i) => (
              <li
                key={punkt}
                className="hero-anim flex items-start gap-3 text-sm sm:text-base"
                style={{ "--hero-delay": `${0.36 + i * 0.08}s` } as React.CSSProperties}
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime/15 text-accent">
                  <Check size={13} strokeWidth={3} />
                </span>
                {punkt}
              </li>
            ))}
          </ul>

          <p
            className="hero-anim mt-10 flex flex-wrap items-center gap-4 text-sm"
            style={{ "--hero-delay": "0.7s" } as React.CSSProperties}
          >
            <a
              href="#book"
              className="inline-flex items-center gap-2 rounded-full bg-lime px-7 py-3 font-semibold text-on-lime transition-opacity hover:opacity-90"
            >
              Book a free trial
            </a>
            <a
              href={`tel:${legalConfig.contact.phoneHref}`}
              className="inline-flex items-center gap-2 text-muted transition-colors hover:text-accent"
            >
              <Phone size={15} aria-hidden />
              Or just call: {legalConfig.contact.phone}
            </a>
          </p>
        </Container>
      </section>

      <ImpulsTrenner variante="a" className="mx-auto max-w-4xl px-6" />

      <section className="py-16 md:py-20">
        <Container className="max-w-4xl">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            What actually happens
          </h2>

          <ol className="mt-10 grid gap-6 sm:grid-cols-3">
            {schritte.map((schritt, i) => (
              <li
                key={schritt.titel}
                className="karte-hebt rounded-2xl border border-border bg-surface-raised p-6"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lime/12 text-sm font-bold text-accent">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-semibold">{schritt.titel}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{schritt.text}</p>
              </li>
            ))}
          </ol>

          {/* Dieselbe Haltung wie auf der deutschen Preisseite: Was es
              kostet, entsteht im Gespräch. Hier steht nur, wovon es
              abhängt - sonst kommt jemand mit der Erwartung einer Zahl. */}
          <div className="mt-12 rounded-2xl border border-border bg-surface p-7">
            <h3 className="flex items-center gap-2 font-semibold">
              <Zap size={17} className="text-accent" aria-hidden />
              What does it cost?
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              We do not publish a price list, and that is on purpose: a number
              without context says very little. What you pay depends on how often
              you train, what you want to get out of it and how long you commit
              for. You get a concrete written offer at the trial session - to take
              home and think about. No decision on the spot.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-t border-border bg-surface py-16 md:py-20">
        <Container className="max-w-4xl">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Where to find us
          </h2>
          <p className="mt-3 text-muted">
            {studios.length > 1
              ? `${studios.length} studios in and around Cologne. Pick the one nearest to you in the form below.`
              : "Our studio in and around Cologne."}
          </p>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {studios.map((studio) => (
              <li
                key={studio.id}
                className="rounded-xl border border-border bg-surface-raised p-4 text-sm"
              >
                <span className="flex items-start gap-2 font-medium">
                  <MapPin size={15} className="mt-0.5 shrink-0 text-accent" aria-hidden />
                  {/* Die Standortnamen bleiben, wie sie sind - sie sind
                      Eigennamen und stehen so auch auf der Tür. */}
                  {studio.name}
                </span>
                <span className="mt-1 block pl-[23px] text-xs text-muted">
                  {studio.street}, {studio.postalCode} {studio.city}
                </span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <ImpulsTrenner variante="c" className="mx-auto max-w-4xl px-6" />

      <section id="book" className="scroll-mt-16 py-16 md:py-20">
        <Container className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Book your free trial
          </h2>
          <p className="mt-3 flex items-center gap-2 text-muted">
            <Clock size={16} className="shrink-0 text-accent" aria-hidden />
            Takes about two minutes. We call you back to confirm.
          </p>

          <div className="mt-10">
            {/* Dasselbe Formular wie auf der deutschen Seite, nur auf
                Englisch - samt der Meldungen, die vom Server kommen. Zwei
                getrennte Formulare wären zwei Stellen, an denen eine
                Änderung vergessen wird. */}
            <BookingFlow studios={studios} slotsByStudio={slotsByStudio} sprache="en" />
          </div>

          <p className="mt-10 border-t border-border pt-6 text-sm text-muted">
            Prefer German? The full website is at{" "}
            <Link href="/" hrefLang="de" className="text-accent underline underline-offset-2">
              {siteConfig.url.replace(/^https?:\/\//, "")}
            </Link>{" "}
            - with all locations, opening hours, articles and answers to common
            questions.
          </p>
        </Container>
      </section>
    </>
  );
}
