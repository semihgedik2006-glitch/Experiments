import { prisma } from "@/lib/prisma";
import { approveComment, deleteComment } from "@/lib/actions/admin-comments";
import { formatDate } from "@/lib/format";

export default async function AdminCommentsPage() {
  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    include: { post: { select: { title: true, slug: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Kommentare</h1>

      <div className="mt-8 space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className={`rounded-2xl border p-6 ${
              comment.approved ? "border-border bg-surface" : "border-lime bg-surface"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-semibold">
                  {comment.authorName}{" "}
                  {!comment.approved && (
                    <span className="ml-2 rounded-full bg-lime px-2 py-0.5 text-[10px] font-semibold text-[#0d0d0f]">
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

              <div className="flex shrink-0 gap-2">
                {!comment.approved && (
                  <form
                    action={async () => {
                      "use server";
                      await approveComment(comment.id);
                    }}
                  >
                    <button className="rounded-full border border-border px-4 py-2 text-xs font-semibold hover:border-lime">
                      Freischalten
                    </button>
                  </form>
                )}
                <form
                  action={async () => {
                    "use server";
                    await deleteComment(comment.id);
                  }}
                >
                  <button className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-red-500 hover:border-red-500">
                    Löschen
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
        {comments.length === 0 && <p className="text-muted">Noch keine Kommentare vorhanden.</p>}
      </div>
    </div>
  );
}
