import { KeyRound, ShieldCheck } from "lucide-react";
import { verlangeAdmin } from "@/lib/admin-rechte";
import { AdminPage, AdminSection, Panel } from "@/components/admin/ui";
import { NameFormular, PasswortFormular } from "@/components/admin/konto-formulare";

/**
 * Der eigene Zugang.
 *
 * Bewusst für alle Rollen erreichbar - das ist der Unterschied zu
 * "Zugänge", wo die Leitung fremde Zugänge verwaltet. Wer sein eigenes
 * Passwort nicht selbst ändern kann, ändert es nie.
 */
export default async function AdminKontoPage() {
  const admin = await verlangeAdmin();

  return (
    <AdminPage
      title="Mein Zugang"
      description="Dein Name und dein Passwort. Was du hier änderst, gilt nur für dich."
    >
      <Panel>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted">E-Mail (Anmeldename)</dt>
            {/* Die E-Mail-Adresse ist der Anmeldename und lässt sich hier
                nicht ändern - das kann die Leitung unter "Zugänge". Ein
                Feld, das man ausfüllen kann und das dann doch nichts tut,
                wäre schlimmer als keins. */}
            <dd className="mt-0.5 font-medium break-all">{admin.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Rolle</dt>
            <dd className="mt-0.5 flex items-center gap-1.5 font-medium">
              <ShieldCheck size={15} className="shrink-0 text-accent" aria-hidden />
              {admin.istLeitung
                ? "Leitung - alle Standorte"
                : `Studioleitung${admin.studioName ? ` ${admin.studioName}` : " - ohne Standort"}`}
            </dd>
          </div>
        </dl>
      </Panel>

      <AdminSection
        title="Name"
        description="Steht unten im Menü und macht bei mehreren Zugängen erkennbar, wer gerade angemeldet ist."
        className="mt-8"
      >
        <Panel>
          <NameFormular name={admin.name} />
        </Panel>
      </AdminSection>

      <AdminSection
        title="Passwort ändern"
        description="Nach der Änderung bleibst du angemeldet. Auf anderen Geräten gilt beim nächsten Anmelden das neue Passwort."
        className="mt-8"
      >
        <Panel>
          <PasswortFormular email={admin.email} />

          <p className="mt-5 flex items-start gap-2 border-t border-border pt-4 text-xs text-muted">
            <KeyRound size={14} className="mt-0.5 shrink-0" aria-hidden />
            Nimm ein Passwort, das du nirgendwo sonst benutzt. Am einfachsten
            sind drei bis vier zusammenhanglose Wörter hintereinander - die
            sind länger und leichter zu merken als ein kurzes mit Sonderzeichen.
          </p>
        </Panel>
      </AdminSection>
    </AdminPage>
  );
}
