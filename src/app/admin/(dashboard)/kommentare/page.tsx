import { prisma } from "@/lib/prisma";
import { approveComment, deleteComment, replyToComment } from "@/lib/actions/admin-comments";
import { formatDate } from "@/lib/format";
import { AdminStagger, AdminStaggerItem } from "@/components/admin/admin-stagger";
import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { AdminPage, EmptyState, StatusBadge, adminInput } from "@/components/admin/ui";
import { MessageSquare } from "lucide-react";

export default async function AdminCommentsPage() {
  const comments = await prisma.comment.findMany({
    where: { parentId: null },
    orderBy: { createdAt: "desc" },
    include: {
      post: { select: { title: true, slug: true } },
      replies: { orderBy: { createdAt: "asc" } },
    },
  });

  const offen = comments.filter((c) => !c.approved).length;

  return (
    <AdminPage
      title="Kommentare"
      description={
        offen > 0
          ? `${offen} ${offen === 1 ? "Kommentar wartet" : "Kommentare warten"} auf Freigabe - erst danach erscheinen sie unter dem Artikel.`
          : "Alle Kommentare sind freigegeben. Neue erscheinen erst nach deiner Freigabe."
      }
    >
      <AdminStagger className="space-y-3">
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

      {comments.length === 0 && (
        <EmptyState icon={MessageSquare} title="Noch keine Kommentare">
          Sobald jemand unter einem Blogartikel schreibt, landet der Kommentar hier und
          wartet auf deine Freigabe. Veröffentlicht wird nichts von allein.
        </EmptyState>
      )}
    </AdminPage>
  );
}
