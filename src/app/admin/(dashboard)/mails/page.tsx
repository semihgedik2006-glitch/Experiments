import { AlertTriangle, CheckCircle2, Mail, XCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { verlangeLeitung } from "@/lib/admin-rechte";
import { TEAM_EMAIL, versandAbsender, versandBereit } from "@/lib/email";
import { AdminPage, AdminSection, EmptyState, Panel, StatusBadge } from "@/components/admin/ui";
import type { MailArt } from "@/generated/prisma/enums";

/**
 * Was automatisch rausgeht - und ob es rausgeht.
 *
 * Der Anlass: Solange kein Schlüssel für den Mailanbieter hinterlegt ist,
 * verschickt die Website gar nichts. Sichtbar war das nirgends - im
 * Adminbereich sah eine bestätigte Buchung genauso aus wie eine, deren
 * Bestätigung tatsächlich angekommen ist. Die Frage "hat der Kunde die
 * Mail bekommen?" war schlicht nicht zu beantworten.
 *
 * Diese Seite beantwortet sie: oben der Zustand des Versands, darunter
 * die Abläufe, die von allein laufen, und ganz unten die letzten
 * tatsächlichen Versuche mit Empfänger, Zeitpunkt und Ergebnis.
 */

const PRO_SEITE = 60;

const artText: Record<MailArt, string> = {
  ANFRAGE_EINGANG: "Eingangsbestätigung an den Interessenten",
  ANFRAGE_INTERN: "Neue Anfrage ans Studio",
  NACHFASS_INTERN: "Erinnerung an offene Anfragen",
  KONTAKT_INTERN: "Neue Kontaktnachricht ans Team",
  BESTAETIGUNG: "Terminbestätigung",
  ERINNERUNG: "Erinnerung am Vortag",
  ABSAGE_GAST: "Absage durch den Gast",
  VERSCHOBEN_GAST: "Verlegung durch den Gast",
  BEWERTUNG: "Bitte um eine Bewertung",
  WARTELISTE_FREI: "Platz frei geworden - an die Warteliste",
  WARTELISTE_INTERN: "Neuer Wartelisteneintrag ans Studio",
  NEWSLETTER: "Newsletter-Ausgabe an einen Abonnenten",
  NEWSLETTER_TEST: "Newsletter-Probeversand an den eigenen Zugang",
  KUNDENBEREICH: "Zugangslink zu den eigenen Terminen",
};

const ablaeufe: { titel: string; wann: string; an: string }[] = [
  {
    titel: "Eingangsbestätigung",
    wann: "sofort nach dem Absenden des Anfrageformulars",
    an: "an den Interessenten",
  },
  {
    titel: "Neue Anfrage",
    wann: "sofort nach dem Absenden des Anfrageformulars",
    an: "an die E-Mail-Adresse des gewählten Studios, sonst an die Sammeladresse",
  },
  {
    titel: "Neue Kontaktnachricht",
    wann: "sofort nach dem Absenden des Kontaktformulars",
    an: "an die Sammeladresse",
  },
  {
    titel: "Terminbestätigung",
    wann: "wenn ihr im Adminbereich auf „Bestätigen“ drückt",
    an: "an den Gast, mit Termindatei für den Kalender",
  },
  {
    titel: "Erinnerung am Vortag",
    wann: "täglich, für alle bestätigten Termine des Folgetags",
    an: "an den Gast",
  },
  {
    titel: "Erinnerung an offene Anfragen",
    wann: "täglich, für Anfragen, die länger als drei Tage unbeantwortet sind",
    an: "an das Studio - nie an den Interessenten",
  },
  {
    titel: "Absage und Verlegung",
    wann: "sobald ein Gast seinen Termin selbst ändert",
    an: "an den Gast, mit aktualisierter Termindatei",
  },
  {
    titel: "Bitte um eine Bewertung",
    wann: "täglich, einen Tag nach einem stattgefundenen Termin - und nur einmal",
    an: "an den Gast, aber nur wenn beim Studio ein Bewertungslink hinterlegt ist",
  },
  {
    titel: "Neuer Wartelisteneintrag",
    wann: "sofort, wenn sich jemand auf eine belegte Zeit setzt",
    an: "an das Studio - nicht an den Wartenden",
  },
  {
    titel: "Platz frei geworden",
    wann: "sobald ein Platz frei wird - durch Stornieren, Absagen oder Verschieben",
    an: "an den Ersten auf der Warteliste dieses Termins, der noch hineinpasst",
  },
  {
    // Als Einziger in dieser Liste kein Ablauf, der von allein anspringt -
    // er steht hier trotzdem, weil sonst der Eindruck entsteht, der
    // Newsletter ginge automatisch raus.
    titel: "Newsletter",
    wann: "nie von allein - nur wenn ihr unter Newsletter auf Senden drückt",
    an: "an alle Abonnenten, mit Abmeldelink in jeder einzelnen Mail",
  },
  {
    titel: "Zugangslink zu den eigenen Terminen",
    wann: "wenn jemand auf „Meine Termine“ seine Adresse einträgt - und nur, wenn es zu dieser Adresse tatsächlich Termine gibt",
    an: "an den Gast. Der Link gilt 30 Minuten",
  },
];

function zeitpunkt(datum: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
  }).format(datum);
}

export default async function AdminMailsPage() {
  await verlangeLeitung();

  const bereit = versandBereit();

  const [eintraege, gescheitert, gesamt] = await Promise.all([
    prisma.mailLog.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: PRO_SEITE,
    }),
    prisma.mailLog.count({ where: { ok: false } }),
    prisma.mailLog.count(),
  ]);

  return (
    <AdminPage
      title="E-Mail-Versand"
      description="Was automatisch rausgeht, an wen - und ob es tatsächlich rausgegangen ist."
    >
      {/* Der Zustand zuerst und unübersehbar: Ohne Schlüssel verschickt die
          Website nichts, und das darf man nicht erst unten im Protokoll
          entdecken. */}
      {bereit ? (
        <div className="rounded-xl border border-lime/50 bg-lime/10 p-4 sm:p-5">
          <p className="flex items-center gap-2 font-semibold">
            <CheckCircle2 size={17} className="text-accent" aria-hidden />
            Der Versand ist eingerichtet
          </p>
          <p className="mt-2 text-sm text-muted">
            Absender: <strong className="text-foreground">{versandAbsender()}</strong>
            <br />
            Sammeladresse für Benachrichtigungen:{" "}
            {TEAM_EMAIL ? (
              <strong className="text-foreground">{TEAM_EMAIL}</strong>
            ) : (
              <span className="text-foreground">
                nicht gesetzt &ndash; Kontaktnachrichten und Anfragen ohne Studio
                lösen deshalb keine Benachrichtigung aus (TEAM_EMAIL)
              </span>
            )}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-amber-500/50 bg-amber-500/10 p-4 sm:p-5">
          <p className="flex items-center gap-2 font-semibold">
            <AlertTriangle size={17} aria-hidden />
            Es geht derzeit keine einzige E-Mail raus
          </p>
          <p className="mt-2 text-sm">
            Der Zugang zum Mailanbieter fehlt (<code>RESEND_API_KEY</code>). Alles
            unten läuft, aber der letzte Schritt endet ins Leere: Bestätigungen,
            Erinnerungen und Benachrichtigungen werden erzeugt und dann verworfen.
          </p>
          <p className="mt-2 text-sm text-muted">
            Zum Einrichten braucht es ein Konto bei Resend, eine dort bestätigte
            eigene Domain und drei Einträge in den Umgebungsvariablen bei Vercel:
            <code className="mx-1">RESEND_API_KEY</code>,
            <code className="mx-1">BOOKING_EMAIL_FROM</code> und
            <code className="mx-1">TEAM_EMAIL</code>. Solange die Domain nicht
            bestätigt ist, nimmt der Anbieter nur Mails an die eigene Adresse an.
          </p>
        </div>
      )}

      <AdminSection
        title="Was von allein läuft"
        description="Diese Abläufe brauchen keinen Klick - außer der Terminbestätigung."
        className="mt-8"
      >
        <Panel>
          <ul className="divide-y divide-border">
            {ablaeufe.map((ablauf) => (
              <li key={ablauf.titel} className="flex flex-wrap gap-x-4 gap-y-1 py-3 first:pt-0 last:pb-0">
                <span className="min-w-48 flex-1 font-medium">{ablauf.titel}</span>
                <span className="min-w-48 flex-[2] text-sm text-muted">
                  {ablauf.wann}
                  <br />
                  {ablauf.an}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </AdminSection>

      <AdminSection
        title="Zuletzt verschickt"
        description={
          gesamt > 0
            ? `${gesamt} Versuche protokolliert, davon ${gescheitert} ohne Erfolg. Das Protokoll wird nach 90 Tagen automatisch geleert.`
            : "Sobald etwas verschickt wird, steht hier, an wen und mit welchem Ergebnis."
        }
        className="mt-8"
      >
        {eintraege.length === 0 ? (
          <EmptyState icon={Mail} title="Noch nichts verschickt">
            Hier steht jeder Versuch mit Zeitpunkt, Empfänger und Ergebnis -
            auch der gescheiterte. Das ist die Antwort auf die Frage, ob eine
            Bestätigung tatsächlich angekommen ist.
          </EmptyState>
        ) : (
          <Panel className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted">
                  <th scope="col" className="py-2 pr-4 font-medium">Wann</th>
                  <th scope="col" className="py-2 pr-4 font-medium">Art</th>
                  <th scope="col" className="py-2 pr-4 font-medium">An</th>
                  <th scope="col" className="py-2 font-medium">Ergebnis</th>
                </tr>
              </thead>
              <tbody>
                {eintraege.map((eintrag) => (
                  <tr key={eintrag.id} className="border-b border-border/50 align-top">
                    <td className="py-2 pr-4 whitespace-nowrap tabular-nums text-muted">
                      {zeitpunkt(eintrag.createdAt)}
                    </td>
                    <td className="py-2 pr-4">{artText[eintrag.art] ?? eintrag.art}</td>
                    <td className="py-2 pr-4 break-all">{eintrag.empfaenger}</td>
                    <td className="py-2">
                      {eintrag.ok ? (
                        <StatusBadge ton="ok" icon={CheckCircle2}>
                          verschickt
                        </StatusBadge>
                      ) : (
                        <span className="block">
                          <StatusBadge ton="off" icon={XCircle}>
                            fehlgeschlagen
                          </StatusBadge>
                          {eintrag.fehler && (
                            <span className="mt-1 block text-xs text-muted">
                              {eintrag.fehler}
                            </span>
                          )}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        )}
      </AdminSection>
    </AdminPage>
  );
}
