import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, ClipboardCheck } from "lucide-react";
import { verlangeLeitung } from "@/lib/admin-rechte";
import { AdminPage, AdminSection, Panel } from "@/components/admin/ui";
import { startklarPruefen, type Punkt } from "@/lib/startklar";

export const metadata = { title: "Startklar" };

// Jeder Aufruf prüft neu: Umgebungsvariablen, Domain und Postfächer ändern
// sich außerhalb der Datenbank, eine zwischengespeicherte Fassung würde
// nach einer Änderung in Vercel den alten Stand zeigen.
export const dynamic = "force-dynamic";

function Zeile({ punkt }: { punkt: Punkt }) {
  const ok = punkt.stand === "ok";
  const selbst = punkt.stand === "selbst";
  return (
    <li className="flex gap-3.5 py-4 first:pt-0 last:pb-0">
      <span
        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
          ok ? "bg-lime/20 text-accent" : selbst ? "bg-surface text-muted" : "bg-amber-500/15 text-amber-600"
        }`}
        aria-hidden
      >
        {ok ? <CheckCircle2 size={16} /> : selbst ? <ClipboardCheck size={15} /> : <AlertTriangle size={15} />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">
          {punkt.titel}
          <span className={`ml-2 text-xs font-normal ${ok ? "text-accent" : selbst ? "text-muted" : "text-amber-600"}`}>
            {ok ? "erledigt" : selbst ? "selbst prüfen" : "offen"}
          </span>
        </p>
        <p className="lesebreite mt-1 break-words text-sm leading-relaxed text-muted">{punkt.text}</p>
        {punkt.tun && (
          <p className="lesebreite mt-1.5 text-sm leading-relaxed">
            <span className="font-semibold">So geht&apos;s: </span>
            {punkt.tun}
          </p>
        )}
        {punkt.link && (
          <Link
            href={punkt.link.href}
            className="mt-2 inline-flex items-center gap-1 py-1 text-sm font-semibold text-accent underline-offset-4 hover:underline"
          >
            {punkt.link.label}
            <ArrowRight size={14} aria-hidden />
          </Link>
        )}
      </div>
    </li>
  );
}

export default async function StartklarPage() {
  await verlangeLeitung();
  const { pflicht, empfohlen } = await startklarPruefen();

  // Gezählt wird nur, was die Seite selbst prüfen kann. Die Rechtstexte
  // könnten nie grün werden - mitgezählt stünde dort für immer "offen".
  const pruefbar = pflicht.filter((p) => p.stand !== "selbst");
  const offen = pruefbar.filter((p) => p.stand === "offen").length;
  const fertig = pruefbar.length - offen;

  return (
    <AdminPage
      title="Startklar"
      description="Was vor dem Start noch fehlt. Jeder Punkt wird beim Öffnen der Seite neu geprüft."
    >
      <div className="space-y-8">
        <div
          className={`rounded-xl border p-4 sm:p-5 ${
            offen === 0 ? "border-lime/50 bg-lime/10" : "border-amber-500/50 bg-amber-500/10"
          }`}
        >
          <p className="flex items-center gap-2 font-semibold">
            {offen === 0 ? (
              <CheckCircle2 size={17} className="shrink-0 text-accent" aria-hidden />
            ) : (
              <AlertTriangle size={17} className="shrink-0 text-amber-600" aria-hidden />
            )}
            {offen === 0
              ? "Alles, was die Seite prüfen kann, ist erledigt."
              : `${fertig} von ${pruefbar.length} Punkten erledigt`}
          </p>
          {offen > 0 && (
            <p className="mt-1.5 text-sm text-muted">
              {offen === 1 ? "Ein Punkt ist" : `${offen} Punkte sind`} noch offen. Die meisten
              erledigt man in Vercel oder hier im Adminbereich in ein paar Minuten.
            </p>
          )}
        </div>

        <AdminSection title="Vor dem Start" description="Ohne diese Punkte gehen Anfragen verloren oder die Seite ist angreifbar.">
          <Panel>
            <ul className="divide-y divide-border">
              {pflicht.map((p) => (
                <Zeile key={p.id} punkt={p} />
              ))}
            </ul>
          </Panel>
        </AdminSection>

        <AdminSection title="Empfohlen" description="Die Seite läuft auch ohne - mit wirkt sie echter und bringt mehr.">
          <Panel>
            <ul className="divide-y divide-border">
              {empfohlen.map((p) => (
                <Zeile key={p.id} punkt={p} />
              ))}
            </ul>
          </Panel>
        </AdminSection>
      </div>
    </AdminPage>
  );
}
