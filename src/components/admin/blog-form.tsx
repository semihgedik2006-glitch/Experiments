"use client";

import { useActionState } from "react";
import type { ActionResult } from "@/lib/actions/newsletter";

const initialState: ActionResult = { ok: false, message: "" };

type Post = {
  title: string;
  excerpt: string;
  content: string;
  published: boolean;
};

export function BlogForm({
  action,
  post,
  submitLabel,
}: {
  action: (prevState: ActionResult | undefined, formData: FormData) => Promise<ActionResult>;
  post?: Post;
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

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="published" defaultChecked={post?.published} className="accent-lime" />
        Veröffentlicht
      </label>

      {state?.message && (
        <p className={`text-sm ${state.ok ? "text-lime" : "text-red-500"}`}>{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-lime px-6 py-3 text-sm font-semibold text-[#0d0d0f] disabled:opacity-50"
      >
        {pending ? "Speichern..." : submitLabel}
      </button>
    </form>
  );
}
