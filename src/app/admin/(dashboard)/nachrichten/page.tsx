import { prisma } from "@/lib/prisma";
import { markMessageRead } from "@/lib/actions/admin-messages";
import { formatDate } from "@/lib/format";
import { AdminStagger, AdminStaggerItem } from "@/components/admin/admin-stagger";
import { SubmitButton } from "@/components/admin/admin-form";
import { AdminPage, EmptyState, StatusBadge } from "@/components/admin/ui";
import { Mail, SearchX } from "lucide-react";
import { SearchBox } from "@/components/admin/search-box";
import { FilterChips, Pagination } from "@/components/admin/list-nav";
import { PRO_SEITE, param, seitenZahl, suchFilter, type SuchParams } from "@/lib/admin-list";
import type { Prisma } from "@/generated/prisma/client";
import { verlangeLeitung } from "@/lib/admin-rechte";
import { AntwortKnopf } from "@/components/admin/antwort-knopf";

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<SuchParams>;
}) {
  // Diese Bereiche gelten für die ganze Marke, nicht für einen
  // Standort - eine Studioleitung landet hier auf der Übersicht.
  await verlangeLeitung();
  const params = await searchParams;
  const begriff = param(params, "q");
  const gelesen = param(params, "gelesen"); // "" | "neu" | "erledigt"
  const seite = seitenZahl(params);

  const where: Prisma.ContactMessageWhereInput = {
    ...(gelesen === "neu" ? { read: false } : {}),
    ...(gelesen === "erledigt" ? { read: true } : {}),
    ...(suchFilter(begriff, ["name", "email", "subject", "message"]) ?? {}),
  };

  // Zählt innerhalb der Suche, damit die Zahlen zu dem passen, was man sieht.
  const ohneStatus: Prisma.ContactMessageWhereInput = {
    ...(suchFilter(begriff, ["name", "email", "subject", "message"]) ?? {}),
  };

  const [gesamt, messages, ungelesen, alle, vorlagen] = await Promise.all([
    prisma.contactMessage.count({ where }),
    prisma.contactMessage.findMany({
      where,
      // Zweites Sortierkriterium: Ohne eindeutiges Merkmal darf die
      // Datenbank Einträge mit gleichem Zeitstempel zwischen zwei Abfragen
      // unterschiedlich anordnen. Beim Blättern kann dann ein Eintrag auf
      // beiden Seiten stehen und ein anderer gar nicht.
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: PRO_SEITE,
      skip: (seite - 1) * PRO_SEITE,
    }),
    prisma.contactMessage.count({ where: { ...ohneStatus, read: false } }),
    prisma.contactMessage.count({ where: ohneStatus }),
    // Nur die eingeschalteten, und nur die Felder, die der Knopf braucht.
    prisma.antwortvorlage.findMany({
      where: { aktiv: true },
      select: { id: true, titel: true, betreff: true, text: true },
      orderBy: [{ sortOrder: "asc" }, { titel: "asc" }],
    }),
  ]);

  const gefiltert = Boolean(begriff || gelesen);

  return (
    <AdminPage
      title="Kontaktnachrichten"
      description={
        ungelesen > 0
          ? `${ungelesen} ${ungelesen === 1 ? "Nachricht ist" : "Nachrichten sind"} noch ungelesen.`
          : "Alles gelesen."
      }
    >
      <div className="space-y-3">
        <SearchBox platzhalter="Name, E-Mail, Betreff oder Text" klasse="max-w-md" />

        <FilterChips
          basis="/admin/nachrichten"
          params={params}
          name="gelesen"
          optionen={[
            { wert: "", label: "Alle", anzahl: alle },
            { wert: "neu", label: "Ungelesen", anzahl: ungelesen },
            { wert: "erledigt", label: "Gelesen", anzahl: alle - ungelesen },
          ]}
        />
      </div>

      <AdminStagger className="mt-6 space-y-3">
        {messages.map((msg) => (
          <AdminStaggerItem key={msg.id}>
          <div
            className={`admin-panel p-4 transition-colors sm:p-5 ${msg.read ? "hover:border-lime/40" : "border-lime"}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="flex flex-wrap items-center gap-2 font-semibold">
                  {msg.subject}
                  {!msg.read && <StatusBadge ton="open">Neu</StatusBadge>}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {msg.name} &middot; {msg.email}
                  {msg.phone ? ` · ${msg.phone}` : ""}
                </p>
                <p className="mt-3 text-sm">{msg.message}</p>
                <p className="mt-3 text-xs text-muted">{formatDate(msg.createdAt)}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Antworten steht vor "als gelesen": In dieser Reihenfolge
                    wird auch gearbeitet. */}
                <AntwortKnopf
                  email={msg.email}
                  vorlagen={vorlagen}
                  werte={{ name: msg.name }}
                />
                {!msg.read && (
                  <form
                    action={async () => {
                      "use server";
                      await markMessageRead(msg.id);
                    }}
                  >
                    <SubmitButton pendingLabel="Wird gespeichert...">
                      Als gelesen markieren
                    </SubmitButton>
                  </form>
                )}
              </div>
            </div>
          </div>
          </AdminStaggerItem>
        ))}
      </AdminStagger>

      {messages.length > 0 && (
        <Pagination
          basis="/admin/nachrichten"
          params={params}
          seite={seite}
          proSeite={PRO_SEITE}
          gesamt={gesamt}
          einheit="Nachrichten"
        />
      )}

      {messages.length === 0 && (
        gefiltert ? (
          <EmptyState icon={SearchX} title="Keine Nachricht passt zu dieser Auswahl">
            {begriff
              ? `Zu „${begriff}“ wurde nichts gefunden. Gesucht wird in Name, E-Mail, Betreff und Text.`
              : "Für den gewählten Filter liegt nichts vor - über „Alle“ siehst du wieder alles."}
          </EmptyState>
        ) : (
          <EmptyState icon={Mail} title="Noch keine Nachrichten">
            Was über das Kontaktformular der Website geschickt wird, erscheint hier - mit
            Name, E-Mail und Telefonnummer zum direkten Zurückrufen.
          </EmptyState>
        )
      )}
    </AdminPage>
  );
}
