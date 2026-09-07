import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deletePost } from "@/lib/actions/admin-blog";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { AdminPage, EmptyState, StatusBadge } from "@/components/admin/ui";
import { Newspaper } from "lucide-react";

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <AdminPage
      title="Blog"
      action={
        <Link
          href="/admin/blog/neu"
          className="rounded-full bg-lime px-5 py-2 text-sm font-semibold text-on-lime transition-opacity hover:opacity-90"
        >
          Neuer Artikel
        </Link>
      }
    >
      <div className="space-y-2">
        {posts.map((post) => (
          <div
            key={post.id}
            className="admin-panel flex flex-wrap items-center justify-between gap-3 p-4"
          >
            <div className="min-w-0">
              <p className="truncate font-semibold">{post.title}</p>
              <p className="mt-1">
                <StatusBadge ton={post.published ? "ok" : "idle"}>
                  {post.published ? "Veröffentlicht" : "Entwurf"}
                </StatusBadge>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link href={`/admin/blog/${post.id}`} className="text-sm text-accent hover:underline">
                Bearbeiten
              </Link>
              <form
                action={async () => {
                  "use server";
                  await deletePost(post.id);
                }}
              >
                <ConfirmButton
                  variant="link"
                  question={`„${post.title}“ wirklich löschen?`}
                  confirmLabel="Ja, Artikel löschen"
                />
              </form>
            </div>
          </div>
        ))}
      </div>

      {posts.length === 0 && (
        <EmptyState
          icon={Newspaper}
          title="Noch kein Artikel geschrieben"
          actionHref="/admin/blog/neu"
          actionLabel="Ersten Artikel schreiben"
        >
          Der Blog ist der Grund, aus dem Google die Seite regelmäßig neu ansieht.
          Themen, nach denen tatsächlich gesucht wird: Rückenschmerzen, Abnehmen,
          Training bei wenig Zeit.
        </EmptyState>
      )}
    </AdminPage>
  );
}
