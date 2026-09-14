import { AlertTriangle, CheckCircle2, Globe, Search, XCircle } from "lucide-react";
import { verlangeLeitung } from "@/lib/admin-rechte";
import { AdminPage, AdminSection, Panel } from "@/components/admin/ui";
import { AdressePruefen } from "@/components/admin/adresse-pruefen";
import {
  VORGESEHENE_ADRESSE,
  basisadresseErmitteln,
  istProduktion,
} from "@/lib/basisadresse";

/**
 * Unter welcher Adresse hält sich die Website selbst für erreichbar?
 *
 * Das klingt nach einer Nebensächlichkeit und ist keine. Diese eine
 * Adresse steht in jeder kanonischen Angabe, in der Sitemap, im
 * Vorschaubild beim Teilen und in den strukturierten Daten. Überall dort
 * bedeutet sie: "Das hier ist das Original."
 *
 * Steht dort eine Adresse, die woanders hin weiterleitet, schreibt die
 * Seite ihre eigenen Inhalte dem Ziel der Weiterleitung zu. Genau das
 * droht hier: ems-training.koeln leitet derzeit auf die
 * Körperformen-Zentrale weiter.
 *
 * Von innen ist davon nichts zu sehen - die Seite sieht in jedem Fall
 * richtig aus. Deshalb diese Seite: Sie sagt, welche Adresse gilt, woher
 * sie kommt, was daran gerade nicht stimmt, und sie ruft die Adresse auf
 * Knopfdruck von außen auf.
 */

export const metadata = { title: "Adresse & Auffindbarkeit" };

// Nicht zwischenspeichern: Der Wert kommt aus der Umgebung, nicht aus der
// Datenbank. Eine zwischengespeicherte Fassung würde nach einer Änderung
// in Vercel weiter den alten Zustand anzeigen - und damit genau die Frage
// falsch beantworten, für die es diese Seite gibt.
export const dynamic = "force-dynamic";

function Schritt({
  nummer,
  titel,
  children,
  erledigt,
}: {
  nummer: number;
  titel: string;
  children: React.ReactNode;
  erledigt?: boolean;
}) {
  return (
    <li className="flex gap-3.5">
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
          erledigt ? "bg-lime/20 text-accent" : "bg-surface text-muted"
        }`}
        aria-hidden
      >
        {erledigt ? <CheckCircle2 size={15} /> : nummer}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold">
          {titel}
          {erledigt && <span className="ml-2 text-xs font-normal text-accent">erledigt</span>}
        </p>
        <div className="mt-1 space-y-2 text-sm leading-relaxed text-muted">{children}</div>
      </div>
    </li>
  );
}

export default async function AdminAdressePage() {
  await verlangeLeitung();

  const adresse = basisadresseErmitteln();
  const produktion = istProduktion();
  const istVorgesehene = adresse.url === VORGESEHENE_ADRESSE;
  const eigeneDomain = adresse.herkunft === "eingetragen" && !adresse.url.includes(".vercel.app");

  const herkunftText: Record<typeof adresse.herkunft, string> = {
    eingetragen: "aus der Umgebungsvariable NEXT_PUBLIC_SITE_URL",
    vercel: "von Vercel (die Produktionsadresse des Projekts)",
    vorgesehen: "aus dem Quelltext - als Notnagel, weil nichts anderes gesetzt ist",
  };

  return (
    <AdminPage
      title="Adresse & Auffindbarkeit"
      description="Unter welcher Adresse hält sich die Website für erreichbar - und was Google daraus macht."
    >
      <div className="space-y-8">
        {/* Zuerst der Zustand, unübersehbar. Wie beim E-Mail-Versand: Was
            nicht stimmt, darf man nicht erst weiter unten entdecken. */}
        <section>
          <div
            className={`rounded-xl border p-4 sm:p-5 ${
              adresse.verworfen
                ? "border-red-500/50 bg-red-500/10"
                : adresse.herkunft === "vorgesehen" || !eigeneDomain
                  ? "border-amber-500/50 bg-amber-500/10"
                  : "border-lime/50 bg-lime/10"
            }`}
          >
            <p className="flex items-center gap-2 font-semibold">
              {adresse.verworfen ? (
                <XCircle size={17} className="shrink-0 text-red-600" aria-hidden />
              ) : eigeneDomain ? (
                <CheckCircle2 size={17} className="shrink-0 text-accent" aria-hidden />
              ) : (
                <AlertTriangle size={17} className="shrink-0 text-amber-600" aria-hidden />
              )}
              Die Website hält sich für erreichbar unter
            </p>
            <p className="mt-2 break-all font-mono text-sm font-semibold text-foreground">
              {adresse.url}
            </p>
            <p className="mt-2 text-sm text-muted">
              Diese Angabe stammt {herkunftText[adresse.herkunft]}.
            </p>

            {adresse.verworfen && (
              <p className="mt-3 rounded-lg bg-background/60 p-3 text-sm">
                <strong className="text-foreground">
                  Der eingetragene Wert wurde verworfen.
                </strong>{" "}
                In NEXT_PUBLIC_SITE_URL steht{" "}
                <span className="break-all font-mono">
                  „{adresse.verworfen.wert}“
                </span>{" "}
                &ndash; {adresse.verworfen.grund} Die Seite läuft deshalb mit der
                Adresse oben weiter, statt auszufallen. Bitte trag den Wert richtig
                ein.
              </p>
            )}

            {!produktion && (
              <p className="mt-3 text-sm text-muted">
                Diese Bereitstellung ist eine <strong className="text-foreground">Vorschau</strong>,
                keine Veröffentlichung. Sie ist für Suchdienste vollständig gesperrt, damit
                derselbe Text nicht zweimal im Netz steht.
              </p>
            )}
          </div>

          <AdressePruefen label="Diese Adresse jetzt aufrufen" ziel="basis" />
        </section>

        <AdminSection
          title="Warum das mehr ist als eine Einstellung"
          description="Drei Stellen, an denen genau diese Adresse ausgeliefert wird."
        >
          <Panel>
            <ul className="space-y-3 text-sm text-muted">
              <li>
                <strong className="text-foreground">Kanonische Angabe.</strong> Auf jeder
                Seite steht ein Verweis, der sagt: Das Original dieser Seite liegt hier.
                Zeigt er auf eine fremde Adresse, zählt Google die Seite dorthin - der
                Aufwand wirkt für jemand anderen.
              </li>
              <li>
                <strong className="text-foreground">Sitemap.</strong> Die Liste aller
                Seiten, die die Website Google meldet. Sie besteht vollständig aus dieser
                Adresse plus Pfad.
              </li>
              <li>
                <strong className="text-foreground">Vorschau beim Teilen.</strong> Wird ein
                Link bei WhatsApp, Facebook oder Instagram geteilt, holt der Dienst Bild und
                Titel über diese Adresse. Stimmt sie nicht, fehlt das Bild.
              </li>
            </ul>
          </Panel>
        </AdminSection>

        <AdminSection
          title="Was noch zu tun ist"
          description="Diese drei Schritte kann nur jemand mit Zugang zu Domain, Vercel und Google erledigen - sie liegen außerhalb der Website."
        >
          <Panel>
            <ol className="space-y-5">
              <Schritt nummer={1} titel="Domain auf das Projekt zeigen lassen" erledigt={eigeneDomain}>
                <p>
                  {VORGESEHENE_ADRESSE.replace("https://", "")} leitet derzeit auf die
                  Körperformen-Zentrale weiter. Solange das so ist, ist diese Website nur
                  unter ihrer Vercel-Adresse erreichbar.
                </p>
                <p>
                  In Vercel unter <strong className="text-foreground">Settings › Domains</strong> die
                  Domain hinzufügen, dann beim Domainanbieter die dort angezeigten Einträge
                  setzen. Danach entscheiden: Soll die Seite mit oder ohne{" "}
                  <span className="font-mono">www</span> laufen? Eine Fassung ist das
                  Original, die andere leitet dorthin weiter - beide gleichberechtigt zu
                  betreiben wäre derselbe Text unter zwei Adressen.
                </p>
                <AdressePruefen
                  label={`${VORGESEHENE_ADRESSE.replace("https://", "")} jetzt aufrufen`}
                  ziel="vorgesehen"
                />
              </Schritt>

              <Schritt
                nummer={2}
                titel="Basisadresse in Vercel eintragen"
                erledigt={adresse.herkunft === "eingetragen" && !adresse.verworfen}
              >
                <p>
                  In Vercel unter{" "}
                  <strong className="text-foreground">Settings › Environment Variables</strong>{" "}
                  den Namen <span className="font-mono">NEXT_PUBLIC_SITE_URL</span> anlegen.
                  Als Wert die Adresse, unter der die Seite wirklich steht &ndash; mit{" "}
                  <span className="font-mono">https://</span> am Anfang, ohne Schrägstrich am
                  Ende, ohne Pfad.
                </p>
                <p>
                  Solange die Domain noch weiterleitet, gehört dort die
                  <span className="font-mono"> .vercel.app</span>-Adresse hinein. Es ist
                  besser, ehrlich auf die Zwischenadresse zu zeigen als auf eine Domain, die
                  woanders hin führt.
                </p>
                <p>
                  Nach dem Eintragen muss einmal neu veröffentlicht werden &ndash; die
                  Adresse wird beim Bauen eingesetzt, nicht bei jedem Aufruf.
                </p>
              </Schritt>

              <Schritt nummer={3} titel="Google-Unternehmensprofil verknüpfen">
                <p>
                  Im Unternehmensprofil jedes Standorts die Website-Adresse auf die
                  jeweilige Standortseite setzen &ndash; nicht alle vierzehn auf die
                  Startseite. Wer bei Google nach „EMS Hürth“ sucht und auf die Startseite
                  kommt, sucht dort weiter.
                </p>
                <p>
                  Erst danach ergibt es Sinn, echte Bewertungen einzusammeln: Sie hängen am
                  Profil des Standorts, nicht an der Website.
                </p>
              </Schritt>
            </ol>
          </Panel>
        </AdminSection>

        <AdminSection
          title="Was die Website von sich aus richtig macht"
          description="Damit klar ist, wonach ihr nicht suchen müsst."
        >
          <Panel>
            <ul className="space-y-3 text-sm text-muted">
              <li className="flex items-start gap-2.5">
                <Globe size={15} className="mt-0.5 shrink-0 text-accent" aria-hidden />
                <span>
                  Ein unbrauchbarer Wert in NEXT_PUBLIC_SITE_URL schaltet die Seite nicht
                  ab. Er wird verworfen, oben begründet, und die Seite läuft mit der nächsten
                  brauchbaren Adresse weiter.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Search size={15} className="mt-0.5 shrink-0 text-accent" aria-hidden />
                <span>
                  Vorschau-Bereitstellungen sind für Suchdienste gesperrt und melden keine
                  Sitemap. Sonst stünde derselbe Text unter zwei Adressen im Netz.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-accent" aria-hidden />
                <span>
                  Ausgeblendete Bereiche und leere Seiten stehen nicht in der Sitemap, und
                  die persönlichen Terminseiten sind von der Indizierung ausgenommen &ndash;
                  doppelt: über die Seite selbst und über robots.txt.
                </span>
              </li>
            </ul>
          </Panel>
        </AdminSection>

        {istVorgesehene && adresse.herkunft === "vorgesehen" && (
          <p className="text-sm text-muted">
            Hinweis: Gerade greift der Notnagel aus dem Quelltext. Das ist genau die
            Adresse, die noch weiterleitet &ndash; Schritt 2 ist deshalb der dringlichste.
          </p>
        )}
      </div>
    </AdminPage>
  );
}
