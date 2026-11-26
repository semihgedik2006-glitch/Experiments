import { AlertTriangle, CheckCircle2, Mail, XCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { verlangeLeitung } from "@/lib/admin-rechte";
import {
  kopieEmpfaenger,
  TEAM_EMAIL,
  versandAbsender,
  versandBereit,
  versandNurTestadresse,
} from "@/lib/email";
import { kopieAdresseSpeichern, testAnfrageSenden } from "@/lib/actions/admin-mailkopie";
import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { AdminPage, AdminSection, EmptyState, Panel, StatusBadge, adminInput } from "@/components/admin/ui";
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
  ANFRAGE_KOPIE: "Kopie der Anfrage an die Leitung",
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
  MITGLIED_WILLKOMMEN: "Willkommensmail an ein neues Mitglied",
  MITGLIED_JUBILAEUM: "Glückwunsch zum Jubiläum der Mitgliedschaft",
  MITGLIED_UMFRAGE: "Zufriedenheitsumfrage an ein Mitglied",
  MITGLIEDER_INTERN: "Wochenübersicht Mitgliederpflege ans Studio",
  GUTSCHEIN_EINGANG: "Gutschein nach dem Online-Kauf an den Käufer",
  GUTSCHEIN_INTERN: "Gutschein verkauft - ans Team",
  MONATSBERICHT: "Monatsbericht mit den Zahlen des Vormonats",
  NICHT_ERSCHIENEN: "Nicht erschienen: Weg zu einem neuen Termin",
  TAGESLISTE: "Tagesliste fürs Studio",
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
    titel: "Kopie der Anfrage",
    wann: "sofort nach dem Absenden des Anfrageformulars - mit dem Hinweis, ob die Mail ans Studio angekommen ist",
    an: "an die Adresse(n), die oben unter „Kopie jeder Anfrage“ eingetragen sind",
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
    wann: "täglich, für alle bestätigten Termine des Folgetags - auch für Anfragen mit Wunschzeit, sobald ihr beim Bestätigen Tag und Uhrzeit eingetragen habt",
    an: "an den Gast",
  },
  {
    titel: "Monatsbericht",
    wann: "am 1. jedes Monats mit dem täglichen Lauf, mit den Zahlen des Vormonats",
    an: "an die Sammeladresse",
  },
  {
    titel: "Tagesliste",
    wann: "jeden Morgen gegen 7 Uhr: offene Anfragen (neu oder nicht erreicht) und die Termine des Tages - nur, wenn es etwas gibt",
    an: "an die E-Mail-Adresse jedes Studios",
  },
  {
    titel: "Nicht erschienen",
    wann: "einmal, wenn ihr bei einer Anfrage den Stand „Nicht erschienen“ setzt - freundlich, mit dem Weg zu einem neuen Termin",
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
    wann: "nie von allein - nur wenn ihr bei einer Anfrage auf „Um Google-Bewertung bitten“ drückt",
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
  {
    titel: "Gutschein gekauft (Stripe)",
    wann: "sofort nach der Online-Zahlung - nur wenn als Zahlweg Stripe eingestellt ist",
    an: "an den Käufer (Gutschein mit Code und Karte) und an die Sammeladresse",
  },
  {
    titel: "Mitglieder-Mails",
    wann: "nur wenn unter Sichtbarkeit eingeschaltet: Willkommen in Woche 1, 3 und 6, Umfrage nach vier Wochen, Jubiläum nach 6 und 12 Monaten",
    an: "an Mitglieder mit Vertragsbeginn und E-Mail-Adresse, die nicht abbestellt haben - Umfrage und Jubiläum nur mit Einwilligung in Werbung",
  },
  {
    titel: "Mitgliederpflege",
    wann: "montags, nur wenn es etwas zu tun gibt (ebenfalls über den Schalter Mitglieder-Mails)",
    an: "an die E-Mail-Adresse des Studios",
  },
];

function vorTagen(tage: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - tage);
  return d;
}

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
  const nurTestadresse = versandNurTestadresse();

  const seitSiebenTagen = vorTagen(7);
  const [eintraege, gescheitert, gesamt, kopieAn, neueFehler] = await Promise.all([
    prisma.mailLog.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: PRO_SEITE,
    }),
    prisma.mailLog.count({ where: { ok: false } }),
    prisma.mailLog.count(),
    kopieEmpfaenger(),
    prisma.mailLog.findMany({
      where: { ok: false, createdAt: { gte: seitSiebenTagen } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
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
        <div
          className={`rounded-xl border p-4 sm:p-5 ${
            nurTestadresse
              ? "border-amber-500/50 bg-amber-500/10"
              : "border-lime/50 bg-lime/10"
          }`}
        >
          <p className="flex items-center gap-2 font-semibold">
            {nurTestadresse ? (
              <AlertTriangle size={17} className="shrink-0 text-amber-600" aria-hidden />
            ) : (
              <CheckCircle2 size={17} className="shrink-0 text-accent" aria-hidden />
            )}
            {nurTestadresse
              ? "Der Schlüssel ist da - der Absender fehlt noch"
              : "Der Versand ist eingerichtet"}
          </p>

          {/* Die unangenehmste Art von Fehler: Alles sieht eingerichtet
              aus, und trotzdem bekommt kein einziger Kunde etwas. Über die
              Testadresse von Resend gehen Mails nur an das eigene Konto,
              alles andere weist der Anbieter ab. Ohne diesen Hinweis
              stünde hier grün "eingerichtet". */}
          {nurTestadresse && (
            <p className="lesebreite mt-2 rounded-lg bg-background/60 p-3 text-sm">
              Es läuft noch über die Testadresse von Resend. Darüber nimmt der
              Anbieter <strong className="text-foreground">nur Mails an euer eigenes
              Konto</strong> an &ndash; an Kunden geht nichts raus. Sobald eure Domain
              bei Resend bestätigt ist, tragt in Vercel{" "}
              <span className="font-mono">BOOKING_EMAIL_FROM</span> ein, zum Beispiel{" "}
              <span className="font-mono">Körperformen &lt;termine@eure-domain.de&gt;</span>.
            </p>
          )}
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

      {/* Gescheiterte Mails der letzten Woche ganz oben - die Frage
          "ist etwas nicht angekommen?" soll man nicht im Protokoll suchen
          müssen. Für eine Anfrage ans Studio: unter Anfragen auf
          "Jetzt ans Studio senden" drücken. */}
      {neueFehler.length > 0 && (
        <div className="mt-6 rounded-xl border border-red-500/50 bg-red-500/10 p-4 sm:p-5">
          <p className="flex items-center gap-2 font-semibold">
            <XCircle size={17} className="shrink-0 text-red-600" aria-hidden />
            {neueFehler.length === 1
              ? "1 Mail ist in den letzten 7 Tagen nicht rausgegangen"
              : `${neueFehler.length}${neueFehler.length === 10 ? "+" : ""} Mails sind in den letzten 7 Tagen nicht rausgegangen`}
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {neueFehler.map((f) => (
              <li key={f.id}>
                <span className="tabular-nums text-muted">{zeitpunkt(f.createdAt)}</span> &middot;{" "}
                {artText[f.art] ?? f.art} an <strong>{f.empfaenger}</strong>
                <span className="block text-xs text-muted">{f.betreff}{f.fehler ? ` - ${f.fehler}` : ""}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-sm text-muted">
            Eine Anfrage, die nicht beim Studio ankam, unter <strong>Anfragen</strong> mit
            „Jetzt ans Studio senden“ nachschicken.
          </p>
        </div>
      )}

      <AdminSection
        title="Kopie jeder Anfrage"
        description="Für den Notfall: Diese Adresse(n) bekommen jede neue Anfrage zusätzlich - mit dem Hinweis, ob die Mail ans Studio angekommen ist. So könnt ihr sie notfalls selbst weiterleiten."
        className="mt-8"
      >
        <Panel>
          <AdminForm action={kopieAdresseSpeichern} className="flex flex-wrap items-end gap-2">
            <label className="min-w-64 flex-1 text-sm">
              <span className="block text-muted">E-Mail-Adresse(n), mehrere mit Komma trennen</span>
              <input
                name="adressen"
                type="text"
                defaultValue={kopieAn.join(", ")}
                placeholder="name@beispiel.de"
                className={`${adminInput} mt-1 w-full`}
              />
            </label>
            <SubmitButton variant="primary">Speichern</SubmitButton>
          </AdminForm>
          <p className="mt-2 text-xs text-muted">
            {kopieAn.length
              ? `Aktuell geht eine Kopie an: ${kopieAn.join(", ")}`
              : "Aktuell geht keine Kopie raus."}
          </p>
          {kopieAn.length > 0 && (
            <AdminForm action={testAnfrageSenden} className="mt-3 border-t border-border pt-3">
              <SubmitButton pendingLabel="Wird gesendet …" savedLabel="Gesendet - bitte Postfach prüfen">
                Test-Anfrage an diese Adresse(n) senden
              </SubmitButton>
              <p className="mt-1.5 text-xs text-muted">
                Schickt eine erfundene Anfrage nur an die Kopie-Adresse(n): einmal so, wie sie im
                Studio ankommt, und einmal als Kopie. Kein Studio und kein Kunde bekommt etwas.
              </p>
            </AdminForm>
          )}
        </Panel>
      </AdminSection>

      <AdminSection
        title="Was von allein läuft"
        description="Diese Abläufe brauchen keinen Klick - außer der Terminbestätigung, der Bitte um eine Bewertung und dem Newsletter."
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
                    <td className="py-2 pr-4 break-all">
                      {eintrag.empfaenger}
                      <span className="block text-xs text-muted">{eintrag.betreff}</span>
                    </td>
                    <td className="py-2">
                      {eintrag.ok ? (
                        <span className="block">
                          <StatusBadge ton="ok" icon={CheckCircle2}>
                            verschickt
                          </StatusBadge>
                          {eintrag.fehler && (
                            <span className="mt-1 block text-xs text-muted">{eintrag.fehler}</span>
                          )}
                        </span>
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
