import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { AdminPage, EmptyState, StatusBadge } from "@/components/admin/ui";
import { AdminStagger, AdminStaggerItem } from "@/components/admin/admin-stagger";
import { AlertTriangle, Mail, Send, Users } from "lucide-react";
import { Pagination } from "@/components/admin/list-nav";
import { PRO_SEITE, seitenZahl, type SuchParams } from "@/lib/admin-list";
import { verlangeLeitung } from "@/lib/admin-rechte";
import { versandBereit } from "@/lib/email";
import type { NewsletterStatus } from "@/generated/prisma/enums";

/**
 * Die Ausgaben.
 *
 * Bis hierher stand hier die Abonnentenliste - ein Adressbuch ohne
 * Briefkasten. Die Liste gibt es weiter, eine Ebene tiefer; oben steht
 * jetzt das, wofür sie da ist.
 */

const statusText: Record<NewsletterStatus, string> = {
  ENTWURF: "Entwurf",
  LAEUFT: "Versand läuft",
  VERSENDET: "Versendet",
};

const statusTon = {
  ENTWURF: "idle",
  LAEUFT: "open",
  VERSENDET: "ok",
} as const;

export default async function AdminNewsletterPage({
  searchParams,
}: {
  searchParams: Promise<SuchParams>;
}) {
  // Der Newsletter gilt für die ganze Marke, nicht für einen Standort -
  // eine Studioleitung landet hier auf der Übersicht.
  await verlangeLeitung();
  const params = await searchParams;
  const seite = seitenZahl(params);

  const [abonnenten, gesamt, ausgaben] = await Promise.all([
    prisma.newsletterSubscriber.count(),
    prisma.newsletter.count(),
    prisma.newsletter.findMany({
      // Zweites Sortierkriterium: Ohne eindeutiges Merkmal darf die
      // Datenbank Einträge mit gleichem Zeitstempel zwischen zwei Abfragen
      // unterschiedlich anordnen.
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: PRO_SEITE,
      skip: (seite - 1) * PRO_SEITE,
    }),
  ]);

  const bereit = versandBereit();

  return (
    <AdminPage
      title="Newsletter"
      description={
        <>
          {abonnenten} {abonnenten === 1 ? "Abonnent" : "Abonnenten"} im Verteiler.{" "}
          <Link href="/admin/newsletter/abonnenten" className="text-accent underline underline-offset-2">
            Liste ansehen
          </Link>
        </>
      }
      action={
        <Link
          href="/admin/newsletter/neu"
          className="inline-flex items-center gap-2 rounded-full bg-lime px-4 py-2 text-xs font-semibold text-on-lime transition-opacity hover:opacity-90"
        >
          <Send size={14} aria-hidden />
          Ausgabe schreiben
        </Link>
      }
    >
      {/* Der Hinweis steht oben und nicht erst am Versandknopf: Wer eine
          Ausgabe schreibt, soll vorher wissen, dass sie nirgends ankommt -
          und nicht erst, wenn er auf Senden drückt. */}
      {!bereit && (
        <div className="admin-panel mb-5 flex items-start gap-3 border-danger p-4">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-danger" aria-hidden />
          <p className="text-sm">
            <span className="font-semibold">Es geht gerade nichts raus.</span> Solange kein
            Mailanbieter hinterlegt ist, verschickt die Website keine E-Mails - auch keinen
            Newsletter. Schreiben und speichern lässt sich trotzdem alles.{" "}
            <Link href="/admin/mails" className="text-accent underline underline-offset-2">
              Zum E-Mail-Versand
            </Link>
          </p>
        </div>
      )}

      {ausgaben.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="Noch keine Ausgabe"
          actionHref="/admin/newsletter/neu"
          actionLabel="Erste Ausgabe schreiben"
        >
          {abonnenten === 0
            ? "Es ist auch noch niemand im Verteiler. Das Anmeldefeld steht im Fußbereich der Website und unter den Blogartikeln."
            : `${abonnenten} ${abonnenten === 1 ? "Person wartet" : "Menschen warten"} darauf, etwas von euch zu hören.`}
        </EmptyState>
      ) : (
        <AdminStagger className="space-y-3">
          {ausgaben.map((ausgabe) => {
            const versucht = ausgabe.zugestellt + ausgabe.gescheitert;
            return (
              <AdminStaggerItem key={ausgabe.id}>
                <Link
                  href={`/admin/newsletter/${ausgabe.id}`}
                  className="admin-panel block p-4 transition-colors hover:border-lime/40 sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <p className="font-semibold">{ausgabe.betreff}</p>
                    <StatusBadge ton={statusTon[ausgabe.status]}>
                      {statusText[ausgabe.status]}
                    </StatusBadge>
                  </div>

                  <p className="mt-2 line-clamp-2 text-sm text-muted">{ausgabe.text}</p>

                  <p className="mt-3 text-xs text-muted">
                    {ausgabe.status === "ENTWURF" ? (
                      <>Angelegt am {formatDate(ausgabe.createdAt)}</>
                    ) : (
                      <>
                        {ausgabe.versendetAm
                          ? `Versendet am ${formatDate(ausgabe.versendetAm)}`
                          : "Versand begonnen"}{" "}
                        &middot; {ausgabe.zugestellt} zugestellt
                        {ausgabe.gescheitert > 0 && (
                          <span className="text-danger">
                            {" "}
                            &middot; {ausgabe.gescheitert} nicht zugestellt
                          </span>
                        )}
                        {versucht === 0 && " - noch nichts verschickt"}
                      </>
                    )}
                  </p>
                </Link>
              </AdminStaggerItem>
            );
          })}
        </AdminStagger>
      )}

      {ausgaben.length > 0 && (
        <Pagination
          basis="/admin/newsletter"
          params={params}
          seite={seite}
          proSeite={PRO_SEITE}
          gesamt={gesamt}
          einheit="Ausgaben"
        />
      )}

      <p className="mt-8 flex items-center gap-2 text-xs text-muted">
        <Users size={13} aria-hidden />
        Jede Ausgabe trägt automatisch einen Abmeldelink und die
        Absenderangabe - beides ist Pflicht und lässt sich nicht abschalten.
      </p>
    </AdminPage>
  );
}
