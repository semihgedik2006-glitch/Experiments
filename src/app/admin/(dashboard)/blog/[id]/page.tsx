import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BlogForm } from "@/components/admin/blog-form";
import { updatePost } from "@/lib/actions/admin-blog";
import { AdminPage } from "@/components/admin/ui";

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) return notFound();

  const boundUpdatePost = updatePost.bind(null, id);

  return (
    <AdminPage title="Artikel bearbeiten" description={post.title}>
      <BlogForm action={boundUpdatePost} post={post} submitLabel="Änderungen speichern" />
    </AdminPage>
  );
}
