import Link from "next/link";
import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
import { InstagramIcon } from "@/components/icons/social-icons";
import { AdminPage, AdminSection, EmptyState, Panel, StatusBadge } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/confirm-button";
import {
  InstagramFormular,
  InstagramPruefen,
} from "@/components/admin/instagram-verbindung";
import { instagramTrennen } from "@/lib/actions/admin-instagram";
import { verlangeLeitung } from "@/lib/admin-rechte";
import { getToggles } from "@/lib/site-toggles";
import { letzteBeitraege, zugangsstand } from "@/lib/instagram";
import { formatDate } from "@/lib/format";

/**
 * Der Instagram-Zugang.
 *
 * Warum es diese Seite überhaupt gibt: Der Schlüssel läuft nach 60 Tagen
 * ab. Er wird zwar nachts von selbst verlängert - aber wenn das einmal
 * dauerhaft scheitert, verschwindet die Wand von der Startseite, ohne dass
 * es jemand merkt. Hier steht, woran man ist.
 *
 * Ab wann gewarnt wird: zwei Wochen vor Ablauf. Früher wäre es ein
 * Dauerzustand, den niemand mehr liest; später bliebe zu wenig Zeit, falls
 * ein neuer Schlüssel von Hand erzeugt werden muss.
 */
const WARNEN_AB_TAGEN = 14;

export default async function AdminInstagramPage() {
  await verlangeLeitung();

  const [stand, toggles] = await Promise.all([zugangsstand(), getToggles()]);
  const beitraege = stand.verbunden ? await letzteBeitraege() : [];

  const laeuftBald =
    stand.tageBisAblauf !== null && stand.tageBisAblauf <= WARNEN_AB_TAGEN;

  return (
    <AdminPage
      title="Instagram"
      description="Sechs Bilder aus eurem Instagram-Konto auf der Startseite - ohne dass jemand die Website pflegen muss."
    >
      {/* Der Datenschutzhinweis steht ganz oben und nicht im Kleingedruckten:
          Er ist der Grund, warum diese Wand ohne Einwilligungsfenster
          erscheinen darf - und die Frage kommt garantiert. */}
      <Panel className="mb-6">
        <p className="flex items-start gap-2.5 text-sm">
          <ShieldCheck size={17} className="mt-0.5 shrink-0 text-accent" aria-hidden />
          <span>
            Bilder und Beiträge holt <strong>unser Server</strong>, nicht der Browser
            eurer Besucher. Instagram erfährt dadurch nicht, wer eure Website
            besucht - deshalb braucht die Wand keine Einwilligung und erscheint
            sofort. Erst wer ein Bild anklickt, landet bei Instagram.
          </span>
        </p>
      </Panel>

      {!stand.verbunden ? (
        <>
          <EmptyState icon={InstagramIcon} title="Noch nicht verbunden">
            Ohne Zugangsschlüssel bleibt der Abschnitt auf der Startseite
            unsichtbar. Wie du den Schlüssel bekommst, steht unten.
          </EmptyState>

          <AdminSection title="Verbinden" className="mt-8">
            <Panel highlight>
              <InstagramFormular verbunden={false} />
            </Panel>
          </AdminSection>
        </>
      ) : (
        <>
          <AdminSection title="Zustand">
            <Panel>
              <div className="flex flex-wrap items-center gap-3">
                {stand.letzterFehler ? (
                  <StatusBadge ton="off" icon={AlertTriangle}>
                    Es hakt
                  </StatusBadge>
                ) : (
                  <StatusBadge ton="ok" icon={CheckCircle2}>
                    Verbunden
                  </StatusBadge>
                )}
                {laeuftBald && (
                  <StatusBadge ton="open">
                    {stand.tageBisAblauf !== null && stand.tageBisAblauf < 0
                      ? "abgelaufen"
                      : `läuft in ${stand.tageBisAblauf} Tagen ab`}
                  </StatusBadge>
                )}
                {!toggles.instagram && (
                  <StatusBadge ton="idle">auf der Website ausgeblendet</StatusBadge>
                )}
              </div>

              <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                <div className="flex justify-between gap-3 sm:block">
                  <dt className="text-muted">Gültig bis</dt>
                  <dd>
                    {stand.laeuftAb
                      ? formatDate(stand.laeuftAb)
                      : "noch nicht bestätigt"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3 sm:block">
                  <dt className="text-muted">Zuletzt verlängert</dt>
                  <dd>{stand.erneuertAm ? formatDate(stand.erneuertAm) : "noch nie"}</dd>
                </div>
              </dl>

              {stand.letzterFehler && (
                <p className="mt-4 rounded-lg border border-danger/40 bg-danger/5 p-3 text-sm">
                  <span className="font-semibold">Letzte Meldung:</span>{" "}
                  {stand.letzterFehler}
                </p>
              )}

              <p className="mt-4 text-xs text-muted">
                Der Schlüssel wird jede Nacht automatisch verlängert. Falls das
                einmal dauerhaft scheitert, steht es hier - und du erzeugst bei
                Meta einen neuen.
              </p>

              <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
                <InstagramPruefen />
                <form
                  action={async () => {
                    "use server";
                    await instagramTrennen();
                  }}
                >
                  <ConfirmButton
                    label="Verbindung trennen"
                    question="Verbindung zu Instagram trennen? Die Wand verschwindet dann von der Startseite."
                    confirmLabel="Ja, trennen"
                    pendingLabel="Wird getrennt..."
                    icon="keins"
                  />
                </form>
              </div>
            </Panel>
          </AdminSection>

          <AdminSection title="Was gerade auf der Startseite steht" className="mt-8">
            {beitraege.length === 0 ? (
              <p className="text-sm text-muted">
                Es kommen gerade keine Beiträge herein. Der Abschnitt auf der
                Startseite entfällt deshalb - besser als eine leere Fläche.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                {beitraege.map((beitrag) => (
                  <a
                    key={beitrag.id}
                    href={beitrag.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={beitrag.text || "Beitrag bei Instagram öffnen"}
                    title={beitrag.text || "Beitrag bei Instagram öffnen"}
                    className="aspect-square overflow-hidden rounded-lg border border-border bg-surface transition-colors hover:border-lime"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/instagram/${beitrag.id}`}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </a>
                ))}
              </div>
            )}

            <p className="mt-3 text-xs text-muted">
              Die Auswahl sind schlicht die neuesten sechs Beiträge - sie
              aktualisiert sich stündlich von selbst. Ausblenden lässt sich der
              ganze Abschnitt unter{" "}
              <Link href="/admin/sichtbarkeit" className="text-accent underline underline-offset-2">
                Sichtbarkeit
              </Link>
              .
            </p>
          </AdminSection>

          <AdminSection title="Schlüssel ersetzen" className="mt-8">
            <Panel>
              <InstagramFormular verbunden />
            </Panel>
          </AdminSection>
        </>
      )}

      <AdminSection title="Wo bekomme ich den Schlüssel?" className="mt-10">
        <Panel>
          <ol className="space-y-2.5 text-sm text-muted">
            <li>
              <span className="font-medium text-foreground">1.</span> Das
              Instagram-Konto muss ein <strong>Unternehmens- oder Creator-Konto</strong>{" "}
              sein. In der Instagram-App unter Einstellungen umstellen, falls es
              noch ein privates ist.
            </li>
            <li>
              <span className="font-medium text-foreground">2.</span> Auf{" "}
              <a
                href="https://developers.facebook.com/apps"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline underline-offset-2"
              >
                developers.facebook.com/apps
              </a>{" "}
              eine App anlegen und dort das Produkt <strong>Instagram</strong>{" "}
              hinzufügen.
            </li>
            <li>
              <span className="font-medium text-foreground">3.</span> Das Konto
              verknüpfen und einen <strong>langlebigen Zugangsschlüssel</strong>{" "}
              erzeugen lassen.
            </li>
            <li>
              <span className="font-medium text-foreground">4.</span> Den Schlüssel
              vollständig kopieren und oben einfügen. Er ist sehr lang - achte
              darauf, wirklich alles zu erwischen.
            </li>
          </ol>
          <p className="mt-4 text-xs text-muted">
            Das ist einmalige Arbeit von etwa zwanzig Minuten. Danach hält sich
            die Verbindung von selbst am Leben.
          </p>
        </Panel>
      </AdminSection>
    </AdminPage>
  );
}
