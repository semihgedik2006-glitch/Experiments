import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deletePost } from "@/lib/actions/admin-blog";
import { ConfirmButton } from "@/components/admin/confirm-button";

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Blog</h1>
        <Link
          href="/admin/blog/neu"
          className="rounded-full bg-lime px-5 py-2 text-sm font-semibold text-on-lime"
        >
          Neuer Artikel
        </Link>
      </div>

      <div className="mt-8 space-y-3">
        {posts.map((post) => (
          <div
            key={post.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-5"
          >
            <div>
              <p className="font-semibold">{post.title}</p>
              <p className="text-sm text-muted">
                {post.published ? "Veröffentlicht" : "Entwurf"}
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
        {posts.length === 0 && <p className="text-muted">Noch keine Artikel vorhanden.</p>}
      </div>
    </div>
  );
}
