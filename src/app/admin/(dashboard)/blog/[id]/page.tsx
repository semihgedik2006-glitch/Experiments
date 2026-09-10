import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BlogForm } from "@/components/admin/blog-form";
import { updatePost } from "@/lib/actions/admin-blog";
import { AdminPage } from "@/components/admin/ui";
import { alleThemen } from "@/lib/blog-themen";

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) return notFound();

  // Themen der anderen Beiträge als Vorschlag - siehe die Begründung auf
  // der Seite für einen neuen Artikel.
  const beitraege = await prisma.blogPost.findMany({
    where: { id: { not: id } },
    select: { themen: true },
  });

  const boundUpdatePost = updatePost.bind(null, id);

  return (
    <AdminPage title="Artikel bearbeiten" description={post.title}>
      <BlogForm
        action={boundUpdatePost}
        post={post}
        bekannteThemen={alleThemen(beitraege).map((thema) => thema.name)}
        submitLabel="Änderungen speichern"
      />
    </AdminPage>
  );
}
