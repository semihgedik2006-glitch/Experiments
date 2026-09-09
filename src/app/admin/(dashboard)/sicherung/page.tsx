import { AlertTriangle, Download, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminPage, AdminSection, Panel } from "@/components/admin/ui";

export default async function AdminSicherungPage() {
  const [studios, bookings, posts, comments, faq, messages, subscribers, slots] =
    await Promise.all([
      prisma.studioLocation.count(),
      prisma.booking.count(),
      prisma.blogPost.count(),
      prisma.comment.count(),
      prisma.faqItem.count(),
      prisma.contactMessage.count(),
      prisma.newsletterSubscriber.count(),
      prisma.availabilitySlot.count(),
    ]);

  const zeilen = [
    { label: "Studios", wert: studios },
    { label: "Termine", wert: slots },
    { label: "Buchungsanfragen", wert: bookings },
    { label: "Blogartikel", wert: posts },
    { label: "Kommentare", wert: comments },
    { label: "Häufige Fragen", wert: faq },
    { label: "Kontaktnachrichten", wert: messages },
    { label: "Newsletter-Abonnenten", wert: subscribers },
  ];

  return (
    <AdminPage
      title="Datensicherung"
      description="Ein Abzug aller Inhalte als Datei - zum Herunterladen und Weglegen."
    >
      <AdminSection title="Jetzt sichern">
        <Panel>
          <p className="text-sm text-muted">
            Der Export enthält alles, was im Adminbereich verwaltet wird. Nicht
            enthalten sind Bilder und das Administrator-Passwort &ndash; ein neues
            Passwort ist schneller gesetzt, als ein altes wiederhergestellt wäre, und
            eine Datei mit Anmeldedaten auf dem Schreibtischrechner wäre ein Risiko
            ohne Gegenwert.
          </p>

          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
            {zeilen.map((zeile) => (
              <div key={zeile.label}>
                <dt className="text-xs text-muted">{zeile.label}</dt>
                <dd className="font-semibold tabular-nums">{zeile.wert}</dd>
              </div>
            ))}
          </dl>

          {/* Bewusst ein gewöhnlicher Link und kein Formular: Der Browser
              lädt die Datei herunter, ohne dass die Seite neu lädt. */}
          <a
            href="/api/admin/sicherung"
            download
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-lime px-6 py-2.5 text-sm font-semibold text-on-lime transition-opacity hover:opacity-90"
          >
            <Download size={16} aria-hidden />
            Sicherung herunterladen
          </a>

          <p className="mt-3 flex items-start gap-2 text-xs text-muted">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            Die Datei enthält Namen, E-Mail-Adressen und Telefonnummern von
            Interessenten. Sie gehört auf ein Gerät oder Laufwerk, über das ihr selbst
            bestimmt &ndash; nicht in einen beliebigen Cloud-Ordner.
          </p>
        </Panel>
      </AdminSection>

      <AdminSection
        title="Was das hier nicht leistet"
        description="Damit klar ist, worauf ihr euch verlassen könnt und worauf nicht."
        className="mt-8"
      >
        <Panel>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2.5">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-accent" />
              <span>
                <strong>Diese Sicherung läuft nicht von allein.</strong> Sie entsteht
                nur, wenn jemand hier auf den Knopf drückt. Ein guter Rhythmus ist
                einmal im Monat und zusätzlich vor jeder größeren Änderung.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-accent" />
              <span>
                <strong>Die eigentliche Sicherung gehört zur Datenbank.</strong> Der
                Anbieter der Datenbank (Neon) bietet dafür eine Wiederherstellung auf
                einen früheren Zeitpunkt an. Wie weit sie zurückreicht, hängt vom
                gebuchten Tarif ab &ndash; das ist im Neon-Konto unter dem Punkt zur
                Wiederherstellung einzusehen und einzustellen. Diese Einstellung kann
                nur jemand mit Zugang zum Konto vornehmen.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-accent" />
              <span>
                <strong>Automatisch an einen anderen Ort geschickt</strong> wird
                derzeit nichts. Dafür bräuchte es einen Speicherort, an den die
                Website schreiben darf &ndash; den gibt es noch nicht.
              </span>
            </li>
          </ul>
        </Panel>
      </AdminSection>

      <AdminSection title="Wenn doch einmal etwas fehlt" className="mt-8">
        <Panel>
          <p className="text-sm text-muted">
            Die Datei ist reiner Text im JSON-Format und lässt sich in jedem
            Texteditor öffnen. Einzelne Einträge kann man daraus abschreiben und im
            Adminbereich neu anlegen. Für einen vollständigen Rückweg &ndash; alles auf
            einmal zurück in die Datenbank &ndash; gibt es hier noch keinen Knopf; das
            wäre der nächste Schritt, wenn ihr ihn braucht.
          </p>
        </Panel>
      </AdminSection>
    </AdminPage>
  );
}
