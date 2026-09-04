import { prisma } from "@/lib/prisma";
import { createFaqItem, updateFaqItem, deleteFaqItem } from "@/lib/actions/admin-faq";

export default async function AdminFaqPage() {
  const items = await prisma.faqItem.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Häufige Fragen</h1>
      <p className="mt-2 text-sm text-muted">
        Diese Einträge erscheinen auf der Startseite, der Preise-Seite und der
        EMS-Training-Seite. Kleinere Zahl bei &bdquo;Position&ldquo; = weiter oben.
      </p>

      {/* Neue Frage anlegen */}
      <form
        action={createFaqItem}
        className="mt-8 rounded-2xl border border-lime/40 bg-surface p-6"
      >
        <h2 className="font-semibold">Neue Frage hinzufügen</h2>
        <div className="mt-4 space-y-3">
          <input
            type="text"
            name="question"
            required
            maxLength={200}
            placeholder="Frage"
            className="w-full rounded-lg border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-lime"
          />
          <textarea
            name="answer"
            required
            rows={3}
            maxLength={2000}
            placeholder="Antwort"
            className="w-full rounded-lg border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-lime"
          />
        </div>
        <button className="mt-4 rounded-full bg-lime px-6 py-2.5 text-sm font-semibold text-on-lime transition-opacity hover:opacity-90">
          Frage anlegen
        </button>
      </form>

      {/* Bestehende Fragen bearbeiten */}
      <div className="mt-8 space-y-4">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-border bg-surface p-6">
            <form action={updateFaqItem} className="space-y-3">
              <input type="hidden" name="id" value={item.id} />
              <div className="flex flex-wrap items-center gap-3">
                <label className="text-xs text-muted">
                  Position{" "}
                  <input
                    type="number"
                    name="sortOrder"
                    defaultValue={item.sortOrder}
                    className="ml-1 w-20 rounded-lg border border-border bg-transparent px-2 py-1 text-sm outline-none focus:border-lime"
                  />
                </label>
              </div>
              <input
                type="text"
                name="question"
                required
                maxLength={200}
                defaultValue={item.question}
                className="w-full rounded-lg border border-border bg-transparent px-4 py-3 text-sm font-medium outline-none focus:border-lime"
              />
              <textarea
                name="answer"
                required
                rows={3}
                maxLength={2000}
                defaultValue={item.answer}
                className="w-full rounded-lg border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-lime"
              />
              <div className="flex gap-2">
                <button className="rounded-full border border-border px-4 py-2 text-xs font-semibold hover:border-lime">
                  Speichern
                </button>
              </div>
            </form>
            <form
              action={async () => {
                "use server";
                await deleteFaqItem(item.id);
              }}
              className="mt-2"
            >
              <button className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-red-500 hover:border-red-500">
                Löschen
              </button>
            </form>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-muted">Noch keine Fragen vorhanden - lege oben die erste an.</p>
        )}
      </div>
    </div>
  );
}
