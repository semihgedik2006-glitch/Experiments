import { prisma } from "@/lib/prisma";
import { markMessageRead } from "@/lib/actions/admin-messages";
import { formatDate } from "@/lib/format";
import { AdminStagger, AdminStaggerItem } from "@/components/admin/admin-stagger";

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Kontaktnachrichten</h1>

      <AdminStagger className="mt-8 space-y-4">
        {messages.map((msg) => (
          <AdminStaggerItem key={msg.id}>
          <div
            className={`rounded-2xl border p-6 transition-colors ${msg.read ? "border-border bg-surface hover:border-lime/40" : "border-lime bg-surface"}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-semibold">
                  {msg.subject}{" "}
                  {!msg.read && (
                    <span className="ml-2 rounded-full bg-lime px-2 py-0.5 text-[10px] font-semibold text-[#0d0d0f]">
                      Neu
                    </span>
                  )}
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
                  <button className="rounded-full border border-border px-4 py-2 text-xs font-semibold hover:border-lime">
                    Als gelesen markieren
                  </button>
                </form>
              )}
            </div>
          </div>
          </AdminStaggerItem>
        ))}
        {messages.length === 0 && <p className="text-muted">Noch keine Nachrichten vorhanden.</p>}
      </AdminStagger>
    </div>
  );
}
