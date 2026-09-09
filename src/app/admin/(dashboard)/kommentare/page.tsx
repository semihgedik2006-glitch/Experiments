import { prisma } from "@/lib/prisma";
import { approveComment, deleteComment, replyToComment } from "@/lib/actions/admin-comments";
import { formatDate } from "@/lib/format";
import { AdminStagger, AdminStaggerItem } from "@/components/admin/admin-stagger";
import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { AdminPage, EmptyState, StatusBadge, adminInput } from "@/components/admin/ui";
import { MessageSquare, SearchX } from "lucide-react";
import { SearchBox } from "@/components/admin/search-box";
import { FilterChips, Pagination } from "@/components/admin/list-nav";
import { PRO_SEITE, param, seitenZahl, suchFilter, type SuchParams } from "@/lib/admin-list";
import type { Prisma } from "@/generated/prisma/client";
import { verlangeLeitung } from "@/lib/admin-rechte";

export default async function AdminCommentsPage({
  searchParams,
}: {
  searchParams: Promise<SuchParams>;
}) {
  // Diese Bereiche gelten für die ganze Marke, nicht für einen
  // Standort - eine Studioleitung landet hier auf der Übersicht.
  await verlangeLeitung();
  const params = await searchParams;
  const begriff = param(params, "q");
  const freigabe = param(params, "freigabe"); // "" | "offen" | "frei"
  const seite = seitenZahl(params);

  // Nur Hauptkommentare werden aufgeteilt; die Antworten hängen an ihnen und
  // werden mitgeladen. Gesucht wird auch im Text der Antworten - sonst
  // findet man einen Verlauf nicht wieder, an den man selbst geschrieben hat.
  const suche = suchFilter(begriff, ["authorName", "content"]);
  const where: Prisma.CommentWhereInput = {
    parentId: null,
    ...(freigabe === "offen" ? { approved: false } : {}),
    ...(freigabe === "frei" ? { approved: true } : {}),
    ...(suche
      ? { OR: [...suche.OR, { replies: { some: suche } }, { post: { title: { contains: begriff, mode: "insensitive" } } }] }
      : {}),
  };

  const ohneStatus: Prisma.CommentWhereInput = { ...where };
  delete ohneStatus.approved;

  const [gesamt, comments, offen, alle] = await Promise.all([
    prisma.comment.count({ where }),
    prisma.comment.findMany({
      where,
      // Zweites Sortierkriterium: Ohne eindeutiges Merkmal darf die
      // Datenbank Einträge mit gleichem Zeitstempel zwischen zwei Abfragen
      // unterschiedlich anordnen. Beim Blättern kann dann ein Eintrag auf
      // beiden Seiten stehen und ein anderer gar nicht.
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: PRO_SEITE,
      skip: (seite - 1) * PRO_SEITE,
      include: {
        post: { select: { title: true, slug: true } },
        replies: { orderBy: { createdAt: "asc" } },
      },
    }),
    prisma.comment.count({ where: { ...ohneStatus, approved: false } }),
    prisma.comment.count({ where: ohneStatus }),
  ]);

  const gefiltert = Boolean(begriff || freigabe);

  return (
    <AdminPage
      title="Kommentare"
      description={
        offen > 0
          ? `${offen} ${offen === 1 ? "Kommentar wartet" : "Kommentare warten"} auf Freigabe - erst danach erscheinen sie unter dem Artikel.`
          : "Alle Kommentare sind freigegeben. Neue erscheinen erst nach deiner Freigabe."
      }
    >
      <div className="space-y-3">
        <SearchBox platzhalter="Name, Kommentartext oder Artikel" klasse="max-w-md" />

        <FilterChips
          basis="/admin/kommentare"
          params={params}
          name="freigabe"
          optionen={[
            { wert: "", label: "Alle", anzahl: alle },
            { wert: "offen", label: "Wartet auf Freigabe", anzahl: offen },
            { wert: "frei", label: "Freigegeben", anzahl: alle - offen },
          ]}
        />
      </div>

      <AdminStagger className="mt-6 space-y-3">
        {comments.map((comment) => (
          <AdminStaggerItem key={comment.id}>
          <div
            className={`admin-panel p-4 transition-colors sm:p-5 ${
              comment.approved ? "hover:border-lime/40" : "border-lime"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="flex flex-wrap items-center gap-2 font-semibold">
                  {comment.authorName}
                  {!comment.approved && (
                    <StatusBadge ton="open">Wartet auf Freigabe</StatusBadge>
                  )}
                </p>
                <p className="mt-1 text-sm text-muted">
                  zu &bdquo;{comment.post.title}&ldquo;
                </p>
                <p className="mt-3 text-sm">{comment.content}</p>
                <p className="mt-3 text-xs text-muted">{formatDate(comment.createdAt)}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {!comment.approved && (
                  <form
                    action={async () => {
                      "use server";
                      await approveComment(comment.id);
                    }}
                  >
                    <SubmitButton pendingLabel="Wird freigeschaltet...">Freischalten</SubmitButton>
                  </form>
                )}
                <form
                  action={async () => {
                    "use server";
                    await deleteComment(comment.id);
                  }}
                >
                  <ConfirmButton question="Diesen Kommentar wirklich löschen?" />
                </form>
              </div>
            </div>

            {comment.replies.length > 0 && (
              <div className="mt-4 space-y-3 border-l-2 border-lime/30 pl-4">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                        {reply.authorName}
                        {reply.isTeam && <StatusBadge ton="ok">Team-Antwort</StatusBadge>}
                        {!reply.approved && (
                          <StatusBadge ton="open">Wartet auf Freigabe</StatusBadge>
                        )}
                      </p>
                      <p className="mt-1 text-sm text-muted">{reply.content}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {!reply.approved && (
                        <form
                          action={async () => {
                            "use server";
                            await approveComment(reply.id);
                          }}
                        >
                          <SubmitButton pendingLabel="Wird freigeschaltet...">
                            Freischalten
                          </SubmitButton>
                        </form>
                      )}
                      <form
                        action={async () => {
                          "use server";
                          await deleteComment(reply.id);
                        }}
                      >
                        <ConfirmButton question="Diese Antwort wirklich löschen?" />
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <AdminForm
              action={async (formData: FormData) => {
                "use server";
                await replyToComment(comment.id, formData);
              }}
              resetOnSuccess
              className="mt-4 flex flex-wrap gap-2"
            >
              <input
                type="text"
                name="content"
                required
                placeholder="Als Körperformen Team antworten..."
                className={`${adminInput} min-w-48 flex-1`}
              />
              <SubmitButton
                variant="primary"
                className="shrink-0 !px-4 !py-2 !text-xs"
                pendingLabel="Wird gesendet..."
                savedLabel="Gesendet"
              >
                Antworten
              </SubmitButton>
            </AdminForm>
          </div>
          </AdminStaggerItem>
        ))}
      </AdminStagger>

      {comments.length > 0 && (
        <Pagination
          basis="/admin/kommentare"
          params={params}
          seite={seite}
          proSeite={PRO_SEITE}
          gesamt={gesamt}
          einheit="Kommentare"
        />
      )}

      {comments.length === 0 && (
        gefiltert ? (
          <EmptyState icon={SearchX} title="Kein Kommentar passt zu dieser Auswahl">
            {begriff
              ? `Zu „${begriff}“ wurde nichts gefunden. Gesucht wird in Name, Kommentartext, Antworten und Artikeltitel.`
              : "Für den gewählten Filter liegt nichts vor - über „Alle“ siehst du wieder alles."}
          </EmptyState>
        ) : (
          <EmptyState icon={MessageSquare} title="Noch keine Kommentare">
            Sobald jemand unter einem Blogartikel schreibt, landet der Kommentar hier und
            wartet auf deine Freigabe. Veröffentlicht wird nichts von allein.
          </EmptyState>
        )
      )}
    </AdminPage>
  );
}
