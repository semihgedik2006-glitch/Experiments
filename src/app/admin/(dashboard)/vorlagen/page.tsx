import { AlertTriangle, FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { verlangeLeitung } from "@/lib/admin-rechte";
import {
  vorlageAnlegen,
  vorlageLoeschen,
  vorlageSpeichern,
} from "@/lib/actions/admin-vorlagen";
import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { AdminPage, AdminSection, EmptyState, Panel, adminInput } from "@/components/admin/ui";
import { BEISPIELE, PLATZHALTER } from "@/lib/vorlagen";

/**
 * Vorlagen für Antwort-E-Mails.
 *
 * Der Anlass: Auf die meisten Kontaktanfragen gibt es dieselben drei
 * Antworten - was es kostet, ob EMS für mich geeignet ist, und die
 * Nachfrage zu einem Termin. Jede davon wird jedes Mal neu getippt, und
 * jedes Mal etwas anders. Das kostet Zeit und macht aus einer Marke
 * vierzehn Tonfälle.
 *
 * Die Website VERSCHICKT diese Antworten nicht - sie füllt nur das
 * Mailprogramm vor. Die ausführliche Begründung steht in
 * src/lib/vorlagen.ts; kurz: Eine Antwort auf eine persönliche Anfrage
 * muss aus dem Postfach kommen, in dem auch die Rückantwort landet.
 */
/**
 * Ab hier wird gewarnt.
 *
 * Die Adresszeile, über die der Text an das Mailprogramm geht, ist bei
 * einigen Programmen auf rund 2000 Zeichen begrenzt - und durch die
 * Umwandlung für die Adresse wird der Text dabei länger als er aussieht.
 * 1500 Zeichen im Feld sind auch nach der Umwandlung sicher darunter.
 */
const LANG = 1500;

export default async function AdminVorlagenPage() {
  await verlangeLeitung();
  const vorlagen = await prisma.antwortvorlage.findMany({
    orderBy: [{ sortOrder: "asc" }, { titel: "asc" }],
  });

  return (
    <AdminPage
      title="Antwortvorlagen"
      description={
        <>
          Wiederkehrende Antworten auf Kontaktanfragen. Bei einer Nachricht oder
          Buchungsanfrage steht dann &bdquo;Antworten&ldquo; - ein Klick öffnet dein
          Mailprogramm mit fertigem Text. Abgeschickt wird von Hand.
        </>
      }
    >
      {/* Die Platzhalter stehen ganz oben und nicht in einer Hilfe: Sie
          sind der einzige Teil, den man wissen muss, und eine Hilfe, die
          man aufklappen muss, liest niemand. */}
      <Panel className="border-lime/30">
        <p className="text-sm font-semibold">Platzhalter</p>
        <p className="mt-1 text-sm text-muted">
          Diese Wörter werden beim Antworten durch die Angaben der jeweiligen
          Anfrage ersetzt. Alles andere bleibt so stehen, wie es dasteht.
        </p>
        <ul className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {PLATZHALTER.map((platzhalter) => (
            <li key={platzhalter.name} className="flex flex-wrap items-baseline gap-2 text-sm">
              <code className="rounded bg-lime/12 px-1.5 py-0.5 font-semibold text-accent">
                {platzhalter.name}
              </code>
              <span className="text-muted">{platzhalter.erklaerung}</span>
            </li>
          ))}
        </ul>

        {/* Ein echter Fallstrick, deshalb steht er hier und nicht im
            Kleingedruckten: Der Text wird über die Adresszeile an das
            Mailprogramm übergeben, und manche Programme kürzen lange
            Adressen. Eine abgeschnittene Mail beim Kunden merkt man erst,
            wenn es zu spät ist. */}
        <p className="mt-4 flex items-start gap-2 border-t border-border pt-3 text-sm text-muted">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" aria-hidden />
          <span>
            Haltet die Texte kurz - etwa eine halbe Bildschirmseite. Der Text wird
            an euer Mailprogramm übergeben, und einzelne Programme kürzen sehr
            lange Vorlagen. Bei den Texten unten passiert das nicht; bei einer
            Vorlage über 1.500 Zeichen wird gewarnt.
          </span>
        </p>
      </Panel>

      <AdminSection title="Neue Vorlage" className="mt-8">
        <AdminForm
          action={vorlageAnlegen}
          resetOnSuccess
          className="admin-panel border-lime/40 p-4 sm:p-5"
        >
          <div className="space-y-3">
            <input
              type="text"
              name="titel"
              required
              maxLength={80}
              placeholder="Name der Vorlage, z.B. „Preisanfrage“"
              className={adminInput}
            />
            <input
              type="text"
              name="betreff"
              required
              maxLength={200}
              placeholder="Betreff der E-Mail"
              className={adminInput}
            />
            <textarea
              name="text"
              required
              rows={8}
              maxLength={4000}
              placeholder="Hallo {vorname}, …"
              className={adminInput}
            />
          </div>
          <div className="mt-4">
            <SubmitButton variant="primary" pendingLabel="Wird angelegt..." savedLabel="Angelegt">
              Vorlage anlegen
            </SubmitButton>
          </div>
        </AdminForm>
      </AdminSection>

      {vorlagen.length > 0 ? (
        <AdminSection
          title={`${vorlagen.length} ${vorlagen.length === 1 ? "Vorlage" : "Vorlagen"}`}
          description="Kleinere Zahl bei „Position“ = weiter oben in der Auswahl."
          className="mt-8"
        >
          <div className="space-y-3">
            {vorlagen.map((vorlage) => (
              <div key={vorlage.id} className="admin-panel p-4 sm:p-5">
                <AdminForm action={vorlageSpeichern} className="space-y-3">
                  <input type="hidden" name="id" value={vorlage.id} />
                  <input
                    type="text"
                    name="titel"
                    required
                    maxLength={80}
                    defaultValue={vorlage.titel}
                    className={adminInput}
                  />
                  <input
                    type="text"
                    name="betreff"
                    required
                    maxLength={200}
                    defaultValue={vorlage.betreff}
                    className={adminInput}
                  />
                  <textarea
                    name="text"
                    required
                    rows={8}
                    maxLength={4000}
                    defaultValue={vorlage.text}
                    className={adminInput}
                  />
                  {vorlage.text.length > LANG && (
                    <p className="flex items-start gap-2 rounded-lg border border-amber-500/50 bg-amber-500/10 p-3 text-sm">
                      <AlertTriangle size={15} className="mt-0.5 shrink-0" aria-hidden />
                      <span>
                        Diese Vorlage ist mit {vorlage.text.length} Zeichen recht lang.
                        Einzelne Mailprogramme kürzen dabei den Text. Kürzer als
                        {" "}{LANG} Zeichen ist auf der sicheren Seite - und wird
                        ohnehin eher gelesen.
                      </span>
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      Position
                      <input
                        type="number"
                        name="sortOrder"
                        defaultValue={vorlage.sortOrder}
                        className={`${adminInput} w-24`}
                      />
                    </label>
                    {/* Ausschalten statt löschen: Eine saisonale Vorlage
                        kommt im nächsten Jahr wieder. */}
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        name="aktiv"
                        defaultChecked={vorlage.aktiv}
                        className="h-4 w-4 accent-lime"
                      />
                      In der Auswahl anzeigen
                    </label>
                    <div className="ml-auto flex items-center gap-3">
                      <SubmitButton pendingLabel="Wird gespeichert..." savedLabel="Gespeichert">
                        Speichern
                      </SubmitButton>
                    </div>
                  </div>
                </AdminForm>

                <form
                  action={async () => {
                    "use server";
                    await vorlageLoeschen(vorlage.id);
                  }}
                  className="mt-3 border-t border-border pt-3"
                >
                  <ConfirmButton
                    variant="link"
                    question={`Vorlage „${vorlage.titel}“ löschen?`}
                  />
                </form>
              </div>
            ))}
          </div>
        </AdminSection>
      ) : (
        <AdminSection title="Zum Anfangen" className="mt-8">
          <EmptyState icon={FileText} title="Noch keine Vorlage angelegt">
            Unten stehen drei Vorschläge für die Antworten, die erfahrungsgemäß
            am häufigsten gebraucht werden. Sie werden bewusst nicht automatisch
            angelegt - lies sie durch und übernimm, was zu euch passt.
          </EmptyState>

          {/* Die Vorschläge landen über ein normales Formular in der
              Datenbank, damit sie beim Übernehmen gelesen werden. Ein Knopf
              "alle drei anlegen" führte dazu, dass fremde Texte ungelesen
              an Kunden gehen. */}
          <div className="mt-4 space-y-3">
            {BEISPIELE.map((beispiel) => (
              <AdminForm
                key={beispiel.titel}
                action={vorlageAnlegen}
                className="admin-panel p-4 sm:p-5"
              >
                <input type="hidden" name="titel" value={beispiel.titel} />
                <input type="hidden" name="betreff" value={beispiel.betreff} />
                <input type="hidden" name="text" value={beispiel.text} />
                <p className="font-semibold">{beispiel.titel}</p>
                <p className="mt-1 text-sm text-muted">
                  Betreff: {beispiel.betreff}
                </p>
                <pre className="mt-3 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-lg bg-surface p-3 text-sm text-muted">
                  {beispiel.text}
                </pre>
                <div className="mt-3">
                  <SubmitButton pendingLabel="Wird übernommen..." savedLabel="Übernommen">
                    Als Vorlage übernehmen
                  </SubmitButton>
                </div>
              </AdminForm>
            ))}
          </div>
        </AdminSection>
      )}
    </AdminPage>
  );
}
