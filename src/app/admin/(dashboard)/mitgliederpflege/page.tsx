import Link from "next/link";
import { CalendarHeart, Info, PhoneCall, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminPage, AdminSection, EmptyState, Panel, StatusBadge } from "@/components/admin/ui";
import { AngerufenKnopf, GespraechKnopf } from "@/components/admin/pflege-knoepfe";
import { formatDate } from "@/lib/format";
import { studioEinschraenkung, verlangeAdmin } from "@/lib/admin-rechte";
import { isVisible } from "@/lib/site-toggles";
import {
  GESPRAECH_VORLAUF_TAGE,
  NACHHAKEN_BIS_NOTE,
  faelligeMail,
  laufzeitstand,
  notenText,
} from "@/lib/mitglieder";

const ROUTINE = [
  {
    wann: "Montag",
    was: "LogX → Aktionen/Aufgaben → Nichtanwesenheit: mehr als 14, aber nicht länger als 60 Tage. Jede Person kurz anrufen oder schreiben: „Wir vermissen dich - sollen wir einen Termin finden?“",
    zeit: "20-30 Min.",
  },
  {
    wann: "Montag",
    was: "Hier oben: „Bitte anrufen“ abarbeiten. Zuhören, nicht verteidigen. Ergebnis als Kontakt in LogX notieren, dann „Angerufen“ klicken.",
    zeit: "10 Min.",
  },
  {
    wann: "Mittwoch",
    was: "„Gespräch vereinbaren“: Termin für das Zwischengespräch ausmachen - am besten direkt an ein Training hängen.",
    zeit: "15 Min.",
  },
  {
    wann: "laufend",
    was: "Gespräche führen (Leitfaden unten), danach „Gespräch geführt“ klicken.",
    zeit: "je 10 Min.",
  },
  {
    wann: "Freitag",
    was: "Strichliste: Anrufe, Gespräche, Pausen statt Kündigung, Zusatzverkäufe. Am Monatsende unter Kennzahlen eintragen.",
    zeit: "5 Min.",
  },
];

/**
 * Mitgliederpflege - die Arbeitsliste für die Woche.
 *
 * Drei Quellen, ein Blatt: Unzufriedene aus der Umfrage, Verträge kurz vor
 * dem Ende der Erstlaufzeit (beides hier) und Mitglieder, die länger nicht
 * da waren (in LogX, weil nur LogX die Trainings kennt). Darunter die
 * Routine und die Leitfäden, damit niemand suchen muss, wie es gemeint war.
 *
 * Warum gerade diese Liste: Die meisten kündigen zum Ende der
 * Erstlaufzeit, als Gründe werden Unzufriedenheit und Preis genannt. Beides
 * lässt sich nur vorher im Gespräch ändern, nicht nachher per Mail.
 */
export default async function MitgliederpflegePage() {
  const admin = await verlangeAdmin();
  const eingeschraenkt = studioEinschraenkung(admin);
  const heute = new Date();

  const [mitglieder, mailsAn] = await Promise.all([
    prisma.mitglied.findMany({
      where: { aktiv: true, ...(eingeschraenkt ? { studioId: eingeschraenkt } : {}) },
      orderBy: [{ nachname: "asc" }, { vorname: "asc" }],
      include: { studio: { select: { name: true } } },
    }),
    isVisible("mitglieder-mails"),
  ]);

  const anrufen = mitglieder
    .filter((m) => m.umfrageNote !== null && m.umfrageNote <= NACHHAKEN_BIS_NOTE && !m.nachgehaktAm)
    .sort((a, b) => (a.umfrageNote ?? 0) - (b.umfrageNote ?? 0));

  const gespraeche = mitglieder
    .map((m) => ({ m, stand: laufzeitstand(m.vertragsbeginn, m.laufzeitMonate, heute) }))
    .filter(
      (x): x is { m: (typeof mitglieder)[number]; stand: { art: "gespraech-faellig"; ende: Date; tageBisEnde: number } } =>
        x.stand.art === "gespraech-faellig",
    )
    .sort((a, b) => a.stand.tageBisEnde - b.stand.tageBisEnde);

  const offeneGespraeche = gespraeche.filter((g) => !g.m.gespraechAm).length;

  const heuteFaellig = mitglieder.filter(
    (m) =>
      m.email &&
      !m.mailsAbbestellt &&
      faelligeMail(m.vertragsbeginn, m.mailsVersandt, heute, m.werbungErlaubt),
  ).length;
  const ohneBeginn = mitglieder.filter((m) => !m.vertragsbeginn).length;

  return (
    <AdminPage
      title="Mitgliederpflege"
      description={`Diese Woche: ${anrufen.length} ${anrufen.length === 1 ? "Anruf" : "Anrufe"} nach der Umfrage, ${offeneGespraeche} ${offeneGespraeche === 1 ? "Gespräch" : "Gespräche"} vor Laufzeitende.`}
    >
      <Panel className="mb-6">
        <p className="flex items-start gap-2.5 text-sm">
          <Info size={17} className="mt-0.5 shrink-0 text-accent" aria-hidden />
          <span>
            Mitglieder-Mails sind{" "}
            {mailsAn ? (
              <strong>eingeschaltet</strong>
            ) : (
              <>
                <strong>ausgeschaltet</strong> - es geht nichts raus
              </>
            )}
            . {mailsAn ? `Heute fällig: ${heuteFaellig}.` : `Wären heute fällig: ${heuteFaellig}.`}{" "}
            {ohneBeginn > 0 && (
              <>
                Bei {ohneBeginn} Mitgliedern fehlt der Vertragsbeginn - die bekommen keine Mails
                und tauchen unten nicht auf.{" "}
                <Link href="/admin/mitglieder?ansicht=ohne-beginn" className="text-accent underline">
                  Nachtragen
                </Link>
                .{" "}
              </>
            )}
            Schalter unter{" "}
            <Link href="/admin/sichtbarkeit" className="text-accent underline">
              Sichtbarkeit
            </Link>
            .
          </span>
        </p>
      </Panel>

      <AdminSection
        title="Bitte anrufen"
        description={`Wer in der Umfrage ${NACHHAKEN_BIS_NOTE} oder weniger von 5 gegeben hat. Je früher, desto eher lässt sich etwas ändern.`}
      >
        {anrufen.length === 0 ? (
          <EmptyState icon={PhoneCall} title="Niemand wartet auf einen Anruf">
            Sobald jemand in der Umfrage eine schlechte Note gibt, steht er hier - und in der
            Montagsmail an das Studio.
          </EmptyState>
        ) : (
          <div className="space-y-2">
            {anrufen.map((m) => (
              <Panel key={m.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {m.vorname} {m.nachname}{" "}
                      <span className="text-sm font-normal text-muted">{m.studio?.name}</span>
                    </p>
                    <p className="mt-1 text-sm">
                      <StatusBadge ton="open">
                        {m.umfrageNote}/5 - {notenText(m.umfrageNote ?? 0)}
                      </StatusBadge>{" "}
                      <span className="text-muted">am {m.umfrageAm ? formatDate(m.umfrageAm) : "-"}</span>
                    </p>
                    {m.umfrageKommentar && (
                      <p className="mt-2 max-w-2xl text-sm italic">„{m.umfrageKommentar}“</p>
                    )}
                  </div>
                  <AngerufenKnopf id={m.id} />
                </div>
              </Panel>
            ))}
          </div>
        )}
      </AdminSection>

      <AdminSection
        title="Gespräch vereinbaren"
        description={`Erstlaufzeit endet in den nächsten ${GESPRAECH_VORLAUF_TAGE} Tagen. Kündigungsfrist sind vier Wochen - das Gespräch muss vorher stattfinden.`}
        className="mt-8"
      >
        {gespraeche.length === 0 ? (
          <EmptyState icon={CalendarHeart} title="Kein Vertrag in den nächsten drei Monaten am Ende der Erstlaufzeit">
            Erscheint, sobald bei Mitgliedern Vertragsbeginn und Laufzeit eingetragen sind.
          </EmptyState>
        ) : (
          <div className="space-y-2">
            {gespraeche.map(({ m, stand }) => (
              <Panel key={m.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p>
                    <span className="font-semibold">
                      {m.vorname} {m.nachname}
                    </span>{" "}
                    <span className="text-sm text-muted">{m.studio?.name}</span>
                    <span className="mt-1 block text-sm">
                      {m.laufzeitMonate} Monate, endet am {formatDate(stand.ende)}{" "}
                      <span className="text-muted">(in {stand.tageBisEnde} Tagen)</span>
                    </span>
                  </p>
                  <span className="flex items-center gap-3">
                    {m.gespraechAm && (
                      <StatusBadge ton="ok">geführt am {formatDate(m.gespraechAm)}</StatusBadge>
                    )}
                    <GespraechKnopf id={m.id} gefuehrt={!!m.gespraechAm} />
                  </span>
                </div>
              </Panel>
            ))}
          </div>
        )}
      </AdminSection>

      <AdminSection title="In LogX nachsehen" className="mt-8">
        <Panel>
          <p className="flex items-start gap-2.5 text-sm">
            <Search size={17} className="mt-0.5 shrink-0 text-accent" aria-hidden />
            <span>
              Wer lange nicht da war, weiß nur LogX - dort werden die Trainings über die Chipkarte
              gezählt. <strong>Aktionen/Aufgaben → Nichtanwesenheit</strong>: „mehr als 14 Tage,
              aber nicht länger als 60 Tage“. Die Obergrenze empfiehlt die LogX-Anleitung selbst:
              Wer ein halbes Jahr weg ist, ist mit einem Anruf meist nicht mehr zu erreichen.
              Im selben Menü stehen auch die <strong>Geburtstage</strong> der Woche.
            </span>
          </p>
        </Panel>
      </AdminSection>

      <AdminSection title="Wochenroutine (ca. 1-2 Stunden)" className="mt-8">
        <Panel>
          <table className="w-full text-left text-sm">
            <tbody>
              {ROUTINE.map((zeile, i) => (
                <tr key={i} className="border-b border-border/60 last:border-0">
                  <td className="py-2 pr-4 align-top font-medium">{zeile.wann}</td>
                  <td className="py-2 pr-4 align-top">{zeile.was}</td>
                  <td className="whitespace-nowrap py-2 align-top text-muted">{zeile.zeit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </AdminSection>

      <AdminSection title="Leitfäden" className="mt-8">
        <div className="space-y-2">
          <Panel>
            <details>
              <summary className="cursor-pointer font-semibold">Zwischengespräch vor Ende der Erstlaufzeit</summary>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm">
                <li>
                  <strong>Rückblick:</strong> „Was hat sich seit deinem Start verändert?“ - das
                  Trainingsziel aus LogX dazunehmen.
                </li>
                <li>
                  <strong>Zufriedenheit:</strong> „Was gefällt dir, was sollen wir besser machen?“ -
                  zuhören, notieren.
                </li>
                <li>
                  <strong>Nächstes Ziel:</strong> gemeinsam eins für die nächsten Monate festlegen.
                </li>
                <li>
                  <strong>Passt das Paket?</strong> Zu teuer: kleinere Variante zeigen. Fehlt etwas:
                  Extra-Einheiten, zweites Outfit, Partner-Zusatz.
                </li>
                <li>
                  <strong>Zeitmangel?</strong> Pausieren (Ruhezeit in LogX) als Möglichkeit nennen.
                </li>
              </ul>
            </details>
          </Panel>
          <Panel>
            <details>
              <summary className="cursor-pointer font-semibold">Jemand will kündigen</summary>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm">
                <li>
                  Die Kündigung wird <strong>immer angenommen und bestätigt</strong>. Das Gespräch ist
                  ein Angebot, keine Hürde.
                </li>
                <li>„Darf ich fragen, woran es liegt?“ - Grund in LogX notieren.</li>
                <li>Je nach Grund: Pause, kleineres Paket, andere Uhrzeit oder anderer Trainer.</li>
                <li>
                  Kein Druck, keine Tricks. Wer im Guten geht, kommt eher wieder - oder empfiehlt
                  euch weiter.
                </li>
              </ul>
            </details>
          </Panel>
        </div>
      </AdminSection>
    </AdminPage>
  );
}
