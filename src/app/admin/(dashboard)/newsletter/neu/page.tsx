import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminPage } from "@/components/admin/ui";
import { NewsletterForm } from "@/components/admin/newsletter-form";
import { newsletterSpeichern } from "@/lib/actions/admin-newsletter";
import { verlangeLeitung } from "@/lib/admin-rechte";
import { BEISPIEL_SCHLUESSEL, newsletterFuss } from "@/lib/newsletter";

export default async function NeueAusgabePage() {
  await verlangeLeitung();

  return (
    <AdminPage
      title="Neue Ausgabe"
      description="Erst schreiben, dann als Entwurf speichern. Verschickt wird nichts, bevor du es ausdrücklich auslöst."
    >
      <Link
        href="/admin/newsletter"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-accent"
      >
        <ArrowLeft size={14} aria-hidden />
        Zurück
      </Link>

      <NewsletterForm
        action={newsletterSpeichern}
        submitLabel="Als Entwurf speichern"
        fussVorschau={newsletterFuss(BEISPIEL_SCHLUESSEL)}
      />
    </AdminPage>
  );
}
