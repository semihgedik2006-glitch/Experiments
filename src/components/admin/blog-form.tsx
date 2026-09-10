"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { themenSchreiben } from "@/lib/blog-themen";
import type { ActionResult } from "@/lib/actions/newsletter";

const initialState: ActionResult = { ok: false, message: "" };

type Post = {
  title: string;
  excerpt: string;
  content: string;
  themen: string[];
  published: boolean;
};

export function BlogForm({
  action,
  post,
  /** Themen, die es an anderen Beiträgen schon gibt - als Vorschlag. */
  bekannteThemen = [],
  submitLabel,
}: {
  action: (prevState: ActionResult | undefined, formData: FormData) => Promise<ActionResult>;
  post?: Post;
  bekannteThemen?: string[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="max-w-2xl space-y-4">
      <div>
        <label className="mb-1 block text-xs text-muted">Titel</label>
        <input
          type="text"
          name="title"
          required
          defaultValue={post?.title}
          className="w-full rounded-lg border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-lime"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-muted">Kurzbeschreibung</label>
        <textarea
          name="excerpt"
          required
          rows={2}
          defaultValue={post?.excerpt}
          className="w-full rounded-lg border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-lime"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-muted">Inhalt</label>
        <textarea
          name="content"
          required
          rows={12}
          defaultValue={post?.content}
          className="w-full rounded-lg border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-lime"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-muted">Themen</label>
        <input
          type="text"
          name="themen"
          defaultValue={themenSchreiben(post?.themen ?? [])}
          placeholder="Rücken, Gesundheit"
          className="w-full rounded-lg border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-lime"
        />
        <p className="mt-1.5 text-xs text-muted">
          Mit Komma trennen. Die Themen erscheinen unter dem Beitrag, sind als
          Filter in der Übersicht anklickbar und bestimmen, welche Beiträge am
          Ende als „Passt dazu“ vorgeschlagen werden.
        </p>
        {/* Bereits vergebene Themen als Vorschlag: Ohne sie entstehen
            zwangsläufig "Rücken", "Rueckenschmerzen" und "Rückenschmerzen"
            nebeneinander, und der Filter zerfällt in Einzelstücke. */}
        {bekannteThemen.length > 0 && (
          <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted">
            Schon vergeben:
            {bekannteThemen.map((thema) => (
              <span key={thema} className="rounded-full bg-lime/12 px-2 py-0.5 text-accent">
                {thema}
              </span>
            ))}
          </p>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="published" defaultChecked={post?.published} className="accent-lime" />
        Veröffentlicht
      </label>

      {state?.message && (
        <p className={`text-sm ${state.ok ? "text-accent" : "text-danger"}`}>{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="inline-flex items-center gap-2 rounded-full bg-lime px-6 py-3 text-sm font-semibold text-on-lime disabled:cursor-progress disabled:opacity-60"
      >
        {pending && <Loader2 size={15} className="animate-spin" aria-hidden />}
        {pending ? "Wird gespeichert..." : submitLabel}
      </button>
    </form>
  );
}
