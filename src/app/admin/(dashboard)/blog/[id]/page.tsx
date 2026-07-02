import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BlogForm } from "@/components/admin/blog-form";
import { updatePost } from "@/lib/actions/admin-blog";

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) return notFound();

  const boundUpdatePost = updatePost.bind(null, id);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Artikel bearbeiten</h1>
      <div className="mt-8">
        <BlogForm action={boundUpdatePost} post={post} submitLabel="Änderungen speichern" />
      </div>
    </div>
  );
}
