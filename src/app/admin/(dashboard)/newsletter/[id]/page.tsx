import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { AdminPage, AdminSection, Panel, StatusBadge } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { NewsletterForm } from "@/components/admin/newsletter-form";
import { NewsletterVersand } from "@/components/admin/newsletter-versand";
import { newsletterLoeschen, newsletterSpeichern } from "@/lib/actions/admin-newsletter";
import { verlangeLeitung } from "@/lib/admin-rechte";
import { BEISPIEL_SCHLUESSEL, newsletterFuss, newsletterText } from "@/lib/newsletter";

/**
 * Eine Ausgabe.
 *
 * Ein Entwurf ist bearbeitbar und hat die Versandknöpfe darüber. Eine
 * versendete Ausgabe zeigt stattdessen den Wortlaut, wie er rausging, und
 * wer ihn bekommen hat.
 *
 * Der Wortlaut wird bewusst aufbewahrt und angezeigt: Bei einer Nachfrage
 * ist die Frage nicht "was stand ungefähr drin", sondern "was genau haben
 * die Leute gelesen".
 */
export default async function AusgabePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verlangeLeitung();
  const { id } = await params;

  const ausgabe = await prisma.newsletter.findUnique({ where: { id } });
  if (!ausgabe) return notFound();

  const [erledigt, letzte] = await Promise.all([
    prisma.newsletterEmpfang.count({ where: { newsletterId: id } }),
    prisma.newsletterEmpfang.findMany({
      where: { newsletterId: id },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 25,
    }),
  ]);

  // Wie viele Adressen noch offen sind. Nicht "alle minus erledigte":
  // Zwischen zwei Abschnitten können sich Leute an- und abgemeldet haben.
  const offen = await prisma.newsletterSubscriber.count({
    where: {
      email: {
        notIn: (
          await prisma.newsletterEmpfang.findMany({
            where: { newsletterId: id },
            select: { empfaenger: true },
          })
        ).map((e) => e.empfaenger),
      },
    },
  });

  const versendet = ausgabe.status === "VERSENDET";

  return (
    <AdminPage
      title={versendet ? "Versendete Ausgabe" : "Entwurf"}
      description={
        versendet && ausgabe.versendetAm
          ? `Rausgegangen am ${formatDate(ausgabe.versendetAm)}${ausgabe.versendetVon ? ` durch ${ausgabe.versendetVon}` : ""}.`
          : "Solange hier „Entwurf“ steht, hat niemand außer dir etwas davon gesehen."
      }
      action={
        !versendet ? (
          <form
            action={async () => {
              "use server";
              await newsletterLoeschen(id);
            }}
          >
            <ConfirmButton question="Diesen Entwurf löschen?" />
          </form>
        ) : undefined
      }
    >
      <Link
        href="/admin/newsletter"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-accent"
      >
        <ArrowLeft size={14} aria-hidden />
        Alle Ausgaben
      </Link>

      {!versendet && (
        <Panel highlight className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold">Versand</p>
              <p className="mt-1 text-sm text-muted">
                {offen === 0
                  ? "Alle Adressen haben diese Ausgabe bereits bekommen."
                  : ausgabe.status === "LAEUFT"
                    ? `${ausgabe.zugestellt} von ${erledigt + offen} verschickt, ${offen} noch offen. Der Versand läuft in Abschnitten - falls er stehen bleibt, hier fortsetzen.`
                    : `Geht an ${offen} ${offen === 1 ? "Adresse" : "Adressen"}.`}
              </p>
            </div>
            {ausgabe.status === "LAEUFT" && (
              <StatusBadge ton="open">Versand läuft</StatusBadge>
            )}
          </div>

          <div className="mt-4">
            <NewsletterVersand
              id={id}
              anzahl={offen}
              fortsetzen={ausgabe.status === "LAEUFT"}
            />
          </div>

          <p className="mt-4 text-xs text-muted">
            Schick dir erst einen Probeversand und lies ihn im eigenen Postfach.
            Ein Tippfehler im Betreff lässt sich danach nicht mehr einfangen.
          </p>
        </Panel>
      )}

      {versendet ? (
        <AdminSection title="Wortlaut">
          <Panel>
            <p className="text-xs text-muted">Betreff</p>
            <p className="font-semibold">{ausgabe.betreff}</p>
            <p className="mt-4 text-xs text-muted">Text</p>
            <pre className="mt-1 overflow-x-auto whitespace-pre-wrap font-mono text-[13px] leading-relaxed">
              {newsletterText(ausgabe.text, BEISPIEL_SCHLUESSEL)}
            </pre>
          </Panel>
        </AdminSection>
      ) : (
        <AdminSection title="Bearbeiten">
          <NewsletterForm
            action={newsletterSpeichern}
            entwurf={{ id, betreff: ausgabe.betreff, text: ausgabe.text }}
            submitLabel="Entwurf speichern"
            fussVorschau={newsletterFuss(BEISPIEL_SCHLUESSEL)}
          />
        </AdminSection>
      )}

      {erledigt > 0 && (
        <AdminSection title="Empfänger" className="mt-10">
          {/* Gezählt wird gegen die Empfänger DIESER Ausgabe, nicht gegen
              den heutigen Verteiler. Wer sich nach dem Versand abmeldet,
              fällt aus dem Verteiler heraus - hätte hier "7 zugestellt von
              7 Adressen im Verteiler" gestanden, während acht rausgingen,
              sähe das nach einem Rechenfehler aus. */}
          <p className="mb-3 text-sm text-muted">
            An {erledigt} {erledigt === 1 ? "Adresse" : "Adressen"} verschickt:{" "}
            {ausgabe.zugestellt} zugestellt
            {ausgabe.gescheitert > 0 && `, ${ausgabe.gescheitert} nicht zugestellt`}.
            {letzte.length < erledigt && ` Die letzten ${letzte.length} stehen hier.`}
          </p>
          <Panel className="overflow-x-auto">
            <table className="w-full min-w-[22rem] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="py-2 pr-4">Adresse</th>
                  <th className="py-2 pr-4">Ergebnis</th>
                </tr>
              </thead>
              <tbody>
                {letzte.map((eintrag) => (
                  <tr key={eintrag.id} className="border-b border-border/60">
                    <td className="py-2.5 pr-4">{eintrag.empfaenger}</td>
                    <td className="py-2.5 pr-4">
                      {eintrag.ok ? (
                        <span className="inline-flex items-center gap-1.5 text-accent">
                          <CheckCircle2 size={14} aria-hidden />
                          angenommen
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-danger">
                          <XCircle size={14} aria-hidden />
                          gescheitert
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
          <p className="mt-3 text-xs text-muted">
            „Angenommen“ heißt: Der Anbieter hat die Nachricht entgegengenommen.
            Ob sie im Posteingang oder im Spam landet, weiß von hier aus niemand.
          </p>
        </AdminSection>
      )}
    </AdminPage>
  );
}
