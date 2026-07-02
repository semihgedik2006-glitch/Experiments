import { BlogForm } from "@/components/admin/blog-form";
import { createPost } from "@/lib/actions/admin-blog";

export default function NewBlogPostPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Neuer Artikel</h1>
      <div className="mt-8">
        <BlogForm action={createPost} submitLabel="Artikel erstellen" />
      </div>
    </div>
  );
}
