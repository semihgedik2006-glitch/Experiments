import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";

export default async function AdminNewsletterPage() {
  const subscribers = await prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Newsletter-Abonnenten</h1>
      <p className="mt-2 text-sm text-muted">{subscribers.length} Abonnenten insgesamt.</p>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-left text-sm">
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
        {subscribers.length === 0 && <p className="mt-4 text-muted">Noch keine Abonnenten.</p>}
      </div>
    </div>
  );
}
