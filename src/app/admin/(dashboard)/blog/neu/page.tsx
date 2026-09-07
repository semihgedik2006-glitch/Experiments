import { BlogForm } from "@/components/admin/blog-form";
import { createPost } from "@/lib/actions/admin-blog";
import { AdminPage } from "@/components/admin/ui";

export default function NewBlogPostPage() {
  return (
    <AdminPage title="Neuer Artikel">
      <BlogForm action={createPost} submitLabel="Artikel erstellen" />
    </AdminPage>
  );
}
