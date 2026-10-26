import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarClock,
  Gift,
  MailCheck,
  MapPin,
  Phone,
  Smartphone,
  Sparkles,
  Users,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { WhatsappKnopf } from "@/components/whatsapp-knopf";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { isVisible } from "@/lib/site-toggles";
import { giltAn } from "@/lib/zusatzangebote";
import {
  JUBILAEEN,
  TERMINBUCHUNG_URL,
  jubilaeumText,
  plusMonate,
} from "@/lib/mitglieder";
import { mailsUmschalten, werbungUmschalten } from "@/lib/actions/mitglied";

export const metadata: Metadata = {
  title: "Mein Körperformen",
  // Gehört genau einem Menschen - weder in eine Suchmaschine noch als
  // Verweis an die nächste Seite.
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

/**
 * Der Mitgliederbereich - erreichbar über den Link in jeder Mitglieder-Mail.
 *
 * Anders als "Meine Termine" läuft dieser Link nicht nach 30 Minuten ab.
 * Er soll sich auf den Startbildschirm legen lassen wie eine App, und
 * dafür muss er bleiben. Vertretbar ist das, weil hier wenig steht: Name,
 * Studio, Mitglied seit. Keine Termine, keine Vertragsdaten, keine
 * Gesundheitsangaben. Was jemand hier tun kann, ist ebenso begrenzt -
 * Mails abbestellen und Werbung erlauben oder untersagen.
 *
 * Ein unbekannter Schlüssel ergibt 404, ohne zu verraten, ob es ihn je gab.
 */
export default async function MitgliederbereichSeite({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!/^[a-f0-9]{64}$/.test(token)) return notFound();

  const mitglied = await prisma.mitglied.findUnique({
    where: { token },
    include: {
      studio: {
        select: {
          id: true,
          name: true,
          street: true,
          postalCode: true,
          city: true,
          phone: true,
          whatsapp: true,
          openingHours: true,
        },
      },
    },
  });
  if (!mitglied) return notFound();

  const [empfehlung, angebote, gutscheineAn] = await Promise.all([
    mitglied.email
      ? prisma.empfehlung.findFirst({
          where: { email: { equals: mitglied.email, mode: "insensitive" }, aktiv: true },
          select: { code: true, praemie: true },
        })
      : null,
    prisma.zusatzangebot.findMany({
      where: { aktiv: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, text: true, preis: true, nurStudios: true },
    }),
    isVisible("gutscheine"),
  ]);

  const heute = new Date();
  const naechstesJubilaeum = mitglied.vertragsbeginn
    ? JUBILAEEN.map((monate) => ({ monate, am: plusMonate(mitglied.vertragsbeginn as Date, monate) })).find(
        (j) => j.am >= heute,
      )
    : undefined;

  const studio = mitglied.studio;
  const hierBuchbar = studio ? angebote.filter((a) => giltAn(a, studio.id)) : angebote;

  async function mailsAus() {
    "use server";
    await mailsUmschalten(token, true);
  }
  async function mailsAn() {
    "use server";
    await mailsUmschalten(token, false);
  }
  async function werbungAn() {
    "use server";
    await werbungUmschalten(token, true);
  }
  async function werbungAus() {
    "use server";
    await werbungUmschalten(token, false);
  }

  return (
    <>
      <PageHeader
        ohneMotiv
        kicker="Mein Körperformen"
        title={
          <>
            Hallo <span className="text-accent">{mitglied.vorname}</span>
          </>
        }
        intro={
          mitglied.vertragsbeginn
            ? `Mitglied seit ${formatDate(mitglied.vertragsbeginn)}${studio ? ` in ${studio.name}` : ""}.`
            : studio
              ? `Dein Studio: ${studio.name}.`
              : "Schön, dass du dabei bist."
        }
      />

      <Container className="space-y-10 pb-24">
        <div className="grid gap-6 md:grid-cols-2">
          {studio && (
            <section className="rounded-2xl border border-border bg-surface p-6">
              <h2 className="flex items-center gap-2 font-semibold">
                <MapPin size={18} className="text-accent" aria-hidden /> Dein Studio
              </h2>
              <p className="mt-3 text-sm">
                {studio.name}
                <br />
                {studio.street}, {studio.postalCode} {studio.city}
              </p>
              <p className="mt-3 flex items-center gap-2 text-sm">
                <Phone size={15} className="text-muted" aria-hidden />
                <a href={`tel:${studio.phone.replace(/\s/g, "")}`} className="underline underline-offset-2">
                  {studio.phone}
                </a>
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {studio.whatsapp && (
                  <WhatsappKnopf
                    nummer={studio.whatsapp}
                    text={`Hallo, hier ist ${mitglied.vorname} ${mitglied.nachname}. Ich habe eine Frage an meinen Trainer: `}
                    variante="schlicht"
                  />
                )}
              </div>
              <p className="mt-3 text-xs text-muted">
                Fragen zum Training? Schreib deinem Studio - ein Mensch antwortet, keine Maschine.
              </p>
            </section>
          )}

          <section className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="flex items-center gap-2 font-semibold">
              <CalendarClock size={18} className="text-accent" aria-hidden /> Termine
            </h2>
            <p className="mt-3 text-sm text-muted">
              Termine buchst und verschiebst du in der Online-Terminbuchung - dort siehst du
              freie Zeiten und deine nächsten Trainings.
            </p>
            <a
              href={TERMINBUCHUNG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-lime px-6 py-2.5 text-sm font-semibold text-on-lime"
            >
              Zur Terminbuchung
            </a>
            {naechstesJubilaeum && (
              <p className="mt-5 flex items-center gap-2 text-sm">
                <Sparkles size={15} className="text-accent" aria-hidden />
                {jubilaeumText(naechstesJubilaeum.monate)} dabei am {formatDate(naechstesJubilaeum.am)}
              </p>
            )}
          </section>
        </div>

        <section className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="flex items-center gap-2 font-semibold">
            <Users size={18} className="text-accent" aria-hidden /> Bring jemanden mit
          </h2>
          {empfehlung ? (
            <>
              <p className="mt-3 text-sm text-muted">
                Dein persönlicher Code. Wer ihn beim Anfragen eines Probetrainings eingibt, landet
                bei uns mit deinem Namen - und wir wissen, bei wem wir uns bedanken dürfen.
              </p>
              <p className="mt-4">
                <code className="rounded-lg bg-lime/12 px-3 py-1.5 text-lg font-semibold tracking-wide text-accent">
                  {empfehlung.code}
                </code>
              </p>
              {empfehlung.praemie && (
                <p className="mt-3 text-sm">Dein Dankeschön: {empfehlung.praemie}</p>
              )}
            </>
          ) : (
            <p className="mt-3 text-sm text-muted">
              Frag im Studio nach deinem persönlichen Empfehlungscode. Wer ihn beim Anfragen eines
              Probetrainings eingibt, landet bei uns mit deinem Namen.
            </p>
          )}
          {gutscheineAn && (
            <p className="mt-5 text-sm">
              <Gift size={15} className="mr-1.5 inline text-accent" aria-hidden />
              Lieber etwas verschenken?{" "}
              <Link href="/gutschein" className="text-accent underline underline-offset-2">
                Gutschein anfragen
              </Link>
            </p>
          )}
        </section>

        {hierBuchbar.length > 0 && (
          <section>
            <h2 className="font-semibold">Dazu buchbar in deinem Studio</h2>
            <p className="mt-1 text-sm text-muted">
              Alles freiwillig. Sprich dein Studio an, wenn dich etwas interessiert - gebucht wird
              direkt auf deinen Vertrag.
            </p>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {hierBuchbar.map((angebot) => (
                <li key={angebot.id} className="rounded-2xl border border-border bg-surface p-5">
                  <p className="font-semibold">{angebot.name}</p>
                  {angebot.text && <p className="mt-1 text-sm text-muted">{angebot.text}</p>}
                  {angebot.preis && <p className="mt-2 text-sm font-medium">{angebot.preis}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="flex items-center gap-2 font-semibold">
            <MailCheck size={18} className="text-accent" aria-hidden /> Deine Einstellungen
          </h2>

          <div className="mt-4 space-y-5 text-sm">
            <div>
              <p className="font-medium">Mails rund um deine Mitgliedschaft</p>
              <p className="mt-1 text-muted">
                Begrüßung und Hinweise zu deinen Terminen - ein paar Mails im Jahr, keine Werbung.
              </p>
              <form action={mitglied.mailsAbbestellt ? mailsAn : mailsAus} className="mt-2">
                <span className="mr-3">
                  {mitglied.mailsAbbestellt ? "Abbestellt." : "Bekommst du."}
                </span>
                <button type="submit" className="text-accent underline underline-offset-2">
                  {mitglied.mailsAbbestellt ? "Wieder bekommen" : "Abbestellen"}
                </button>
              </form>
            </div>

            <div>
              <p className="font-medium">Angebote, Neuigkeiten und Feedback per E-Mail</p>
              <p className="mt-1 text-muted">
                Ab und zu eine Mail von deinem Studio - Aktionen wie Gutscheine zu Weihnachten,
                neue Zusatzangebote, ein Glückwunsch zum Jubiläum oder die Frage, wie zufrieden du
                bist. Freiwillig und jederzeit hier wieder abzuschalten.
              </p>
              <form action={mitglied.werbungErlaubt ? werbungAus : werbungAn} className="mt-2">
                <span className="mr-3">
                  {mitglied.werbungErlaubt
                    ? `Erlaubt${mitglied.werbungErlaubtAm ? ` seit ${formatDate(mitglied.werbungErlaubtAm)}` : ""}.`
                    : "Nicht erlaubt."}
                </span>
                <button type="submit" className="text-accent underline underline-offset-2">
                  {mitglied.werbungErlaubt ? "Nicht mehr erlauben" : "Ja, gern"}
                </button>
              </form>
            </div>
          </div>
        </section>

        <p className="flex items-start gap-2 border-t border-border pt-6 text-xs text-muted">
          <Smartphone size={14} className="mt-0.5 shrink-0" aria-hidden />
          <span>
            Tipp: Leg dir diese Seite auf den Startbildschirm - im Browser auf „Teilen“ und dann
            „Zum Home-Bildschirm“. Der Link ist persönlich; bitte nicht weitergeben.
          </span>
        </p>
      </Container>
    </>
  );
}
