import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deletePost } from "@/lib/actions/admin-blog";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { AdminPage, EmptyState, StatusBadge } from "@/components/admin/ui";
import { Newspaper, SearchX } from "lucide-react";
import { SearchBox } from "@/components/admin/search-box";
import { FilterChips, Pagination } from "@/components/admin/list-nav";
import { PRO_SEITE, param, seitenZahl, suchFilter, type SuchParams } from "@/lib/admin-list";
import type { Prisma } from "@/generated/prisma/client";

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<SuchParams>;
}) {
  const params = await searchParams;
  const begriff = param(params, "q");
  const zustand = param(params, "zustand"); // "" | "online" | "entwurf"
  const seite = seitenZahl(params);

  const where: Prisma.BlogPostWhereInput = {
    ...(zustand === "online" ? { published: true } : {}),
    ...(zustand === "entwurf" ? { published: false } : {}),
    ...(suchFilter(begriff, ["title", "excerpt", "content"]) ?? {}),
  };
  const ohneZustand: Prisma.BlogPostWhereInput = { ...where };
  delete ohneZustand.published;

  const [gesamt, posts, online, alle] = await Promise.all([
    prisma.blogPost.count({ where }),
    prisma.blogPost.findMany({
      where,
      // Zweites Sortierkriterium: Ohne eindeutiges Merkmal darf die
      // Datenbank Einträge mit gleichem Zeitstempel zwischen zwei Abfragen
      // unterschiedlich anordnen. Beim Blättern kann dann ein Eintrag auf
      // beiden Seiten stehen und ein anderer gar nicht.
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: PRO_SEITE,
      skip: (seite - 1) * PRO_SEITE,
    }),
    prisma.blogPost.count({ where: { ...ohneZustand, published: true } }),
    prisma.blogPost.count({ where: ohneZustand }),
  ]);

  const gefiltert = Boolean(begriff || zustand);

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
      <div className="space-y-3">
        <SearchBox platzhalter="Titel, Anrisstext oder Inhalt" klasse="max-w-md" />

        <FilterChips
          basis="/admin/blog"
          params={params}
          name="zustand"
          optionen={[
            { wert: "", label: "Alle", anzahl: alle },
            { wert: "online", label: "Veröffentlicht", anzahl: online },
            { wert: "entwurf", label: "Entwurf", anzahl: alle - online },
          ]}
        />
      </div>

      <div className="mt-6 space-y-2">
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

      {posts.length > 0 && (
        <Pagination
          basis="/admin/blog"
          params={params}
          seite={seite}
          proSeite={PRO_SEITE}
          gesamt={gesamt}
          einheit="Artikel"
        />
      )}

      {posts.length === 0 && gefiltert && (
        <EmptyState icon={SearchX} title="Kein Artikel passt zu dieser Auswahl">
          {begriff
            ? `Zu „${begriff}“ wurde nichts gefunden. Gesucht wird in Titel, Anrisstext und Inhalt.`
            : "Für den gewählten Filter liegt nichts vor."}
        </EmptyState>
      )}

      {posts.length === 0 && !gefiltert && (
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
