import { prisma } from "@/lib/prisma";
import { approveComment, deleteComment, replyToComment } from "@/lib/actions/admin-comments";
import { formatDate } from "@/lib/format";
import { AdminStagger, AdminStaggerItem } from "@/components/admin/admin-stagger";
import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { ConfirmButton } from "@/components/admin/confirm-button";

export default async function AdminCommentsPage() {
  const comments = await prisma.comment.findMany({
    where: { parentId: null },
    orderBy: { createdAt: "desc" },
    include: {
      post: { select: { title: true, slug: true } },
      replies: { orderBy: { createdAt: "asc" } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Kommentare</h1>

      <AdminStagger className="mt-8 space-y-4">
        {comments.map((comment) => (
          <AdminStaggerItem key={comment.id}>
          <div
            className={`rounded-2xl border p-6 transition-colors ${
              comment.approved ? "border-border bg-surface hover:border-lime/40" : "border-lime bg-surface"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-semibold">
                  {comment.authorName}{" "}
                  {!comment.approved && (
                    <span className="ml-2 rounded-full bg-lime px-2 py-0.5 text-[10px] font-semibold text-on-lime">
                      Wartet auf Freigabe
                    </span>
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
                      <p className="text-sm font-semibold">
                        {reply.authorName}
                        {reply.isTeam && (
                          <span className="ml-2 rounded-full bg-lime/15 px-2 py-0.5 text-[10px] font-semibold text-accent">
                            Team-Antwort
                          </span>
                        )}
                        {!reply.approved && (
                          <span className="ml-2 rounded-full bg-lime px-2 py-0.5 text-[10px] font-semibold text-on-lime">
                            Wartet auf Freigabe
                          </span>
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
                className="min-w-48 flex-1 rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-lime"
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
        {comments.length === 0 && <p className="text-muted">Noch keine Kommentare vorhanden.</p>}
      </AdminStagger>
    </div>
  );
}
