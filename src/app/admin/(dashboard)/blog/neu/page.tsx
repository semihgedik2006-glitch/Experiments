import { prisma } from "@/lib/prisma";
import { BlogForm } from "@/components/admin/blog-form";
import { createPost } from "@/lib/actions/admin-blog";
import { AdminPage } from "@/components/admin/ui";
import { alleThemen } from "@/lib/blog-themen";

export default async function NewBlogPostPage() {
  // Die bereits vergebenen Themen als Vorschlag. Ohne sie entstehen
  // zwangsläufig "Rücken", "Rueckenschmerzen" und "Rückenschmerzen"
  // nebeneinander - und der Filter in der Übersicht zerfällt in
  // Einzelstücke, die jeweils auf einen Beitrag zeigen.
  const beitraege = await prisma.blogPost.findMany({ select: { themen: true } });

  return (
    <AdminPage title="Neuer Artikel">
      <BlogForm
        action={createPost}
        bekannteThemen={alleThemen(beitraege).map((thema) => thema.name)}
        submitLabel="Artikel erstellen"
      />
    </AdminPage>
  );
}
