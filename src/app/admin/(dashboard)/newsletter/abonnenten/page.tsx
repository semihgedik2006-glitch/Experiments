import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { AdminPage, EmptyState, Panel } from "@/components/admin/ui";
import { ArrowLeft, Send, SearchX, Download } from "lucide-react";
import { SearchBox } from "@/components/admin/search-box";
import { Pagination } from "@/components/admin/list-nav";
import { PRO_SEITE, param, seitenZahl, suchFilter, type SuchParams } from "@/lib/admin-list";
import { verlangeLeitung } from "@/lib/admin-rechte";

/**
 * Die Abonnentenliste.
 *
 * Lag bis hierher unter /admin/newsletter und war damit das Erste, was man
 * sah - eine Liste von Adressen, mit der man nichts anfangen konnte. Seit
 * es Ausgaben gibt, steht sie eine Ebene tiefer.
 *
 * Es gibt hier bewusst kein Löschen von Hand: Abgemeldet wird über den
 * Link in der Mail, und dabei verschwindet der Eintrag von selbst. Ein
 * Löschknopf im Adminbereich wäre ein zweiter Weg für dieselbe Sache - mit
 * dem Unterschied, dass niemand nachvollziehen könnte, wer ihn gedrückt hat.
 */
export default async function AdminAbonnentenPage({
  searchParams,
}: {
  searchParams: Promise<SuchParams>;
}) {
  await verlangeLeitung();
  const params = await searchParams;
  const begriff = param(params, "q");
  const seite = seitenZahl(params);

  const where = suchFilter(begriff, ["email"]);

  const [gesamt, alle, subscribers] = await Promise.all([
    prisma.newsletterSubscriber.count({ where }),
    prisma.newsletterSubscriber.count(),
    prisma.newsletterSubscriber.findMany({
      where,
      // Zweites Sortierkriterium: Ohne eindeutiges Merkmal darf die
      // Datenbank Einträge mit gleichem Zeitstempel zwischen zwei Abfragen
      // unterschiedlich anordnen. Beim Blättern kann dann ein Eintrag auf
      // beiden Seiten stehen und ein anderer gar nicht.
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: PRO_SEITE,
      skip: (seite - 1) * PRO_SEITE,
    }),
  ]);

  return (
    <AdminPage
      title="Abonnenten"
      description={`${alle} ${alle === 1 ? "Adresse" : "Adressen"} im Verteiler.`}
      action={
        alle > 0 ? (
          <a
            href="/api/admin/tabelle/newsletter"
            download
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold transition-colors hover:border-lime"
          >
            <Download size={14} aria-hidden />
            Als Tabelle
          </a>
        ) : undefined
      }
    >
      <Link
        href="/admin/newsletter"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-accent"
      >
        <ArrowLeft size={14} aria-hidden />
        Zu den Ausgaben
      </Link>

      {alle > 0 && <SearchBox platzhalter="E-Mail-Adresse" klasse="mb-4 max-w-md" />}

      {subscribers.length > 0 && (
        <Panel className="overflow-x-auto">
          <table className="w-full min-w-[24rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="py-2 pr-4">E-Mail</th>
                <th className="py-2 pr-4">Angemeldet am</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub) => (
                <tr key={sub.id} className="border-b border-border/60">
                  <td className="py-3 pr-4">{sub.email}</td>
                  <td className="py-3 pr-4">{formatDate(sub.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}

      {subscribers.length > 0 && (
        <Pagination
          basis="/admin/newsletter/abonnenten"
          params={params}
          seite={seite}
          proSeite={PRO_SEITE}
          gesamt={gesamt}
          einheit="Abonnenten"
        />
      )}

      {subscribers.length === 0 && begriff && (
        <EmptyState icon={SearchX} title="Keine Adresse passt zur Suche">
          Zu &bdquo;{begriff}&ldquo; wurde nichts gefunden.
        </EmptyState>
      )}

      {subscribers.length === 0 && !begriff && (
        <EmptyState icon={Send} title="Noch keine Anmeldungen">
          Das Anmeldefeld steht im Fußbereich der Website und unter den Blogartikeln.
          Wer sich einträgt, erscheint hier mit E-Mail-Adresse und Datum.
        </EmptyState>
      )}
    </AdminPage>
  );
}
