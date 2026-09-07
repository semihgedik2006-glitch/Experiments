import { prisma } from "@/lib/prisma";
import { markMessageRead } from "@/lib/actions/admin-messages";
import { formatDate } from "@/lib/format";
import { AdminStagger, AdminStaggerItem } from "@/components/admin/admin-stagger";
import { SubmitButton } from "@/components/admin/admin-form";
import { AdminPage, EmptyState, StatusBadge } from "@/components/admin/ui";
import { Mail } from "lucide-react";

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });

  const ungelesen = messages.filter((msg) => !msg.read).length;

  return (
    <AdminPage
      title="Kontaktnachrichten"
      description={
        ungelesen > 0
          ? `${ungelesen} ${ungelesen === 1 ? "Nachricht ist" : "Nachrichten sind"} noch ungelesen.`
          : "Alles gelesen."
      }
    >
      <AdminStagger className="space-y-3">
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
          </AdminStaggerItem>
        ))}
      </AdminStagger>

      {messages.length === 0 && (
        <EmptyState icon={Mail} title="Noch keine Nachrichten">
          Was über das Kontaktformular der Website geschickt wird, erscheint hier - mit
          Name, E-Mail und Telefonnummer zum direkten Zurückrufen.
        </EmptyState>
      )}
    </AdminPage>
  );
}
