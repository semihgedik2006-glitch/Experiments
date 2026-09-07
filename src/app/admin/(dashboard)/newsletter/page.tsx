import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { AdminPage, EmptyState, Panel } from "@/components/admin/ui";
import { Send } from "lucide-react";

export default async function AdminNewsletterPage() {
  const subscribers = await prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <AdminPage
      title="Newsletter-Abonnenten"
      description={`${subscribers.length} ${subscribers.length === 1 ? "Abonnent" : "Abonnenten"} insgesamt.`}
    >
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

      {subscribers.length === 0 && (
        <EmptyState icon={Send} title="Noch keine Anmeldungen">
          Das Anmeldefeld steht im Fußbereich der Website und unter den Blogartikeln.
          Wer sich einträgt, erscheint hier mit E-Mail-Adresse und Datum.
        </EmptyState>
      )}
    </AdminPage>
  );
}
