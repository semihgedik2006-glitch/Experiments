"use client";

import { useActionState } from "react";
import { submitComment } from "@/lib/actions/comments";
import type { ActionResult } from "@/lib/actions/newsletter";

const initialState: ActionResult = { ok: false, message: "" };

export function CommentForm({ postId, slug }: { postId: string; slug: string }) {
  const [state, formAction, pending] = useActionState(submitComment, initialState);

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-lime bg-surface p-6 text-center">
        <p className="font-semibold text-lime">Danke für deinen Kommentar!</p>
        <p className="mt-2 text-sm text-muted">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="postId" value={postId} />
      <input type="hidden" name="slug" value={slug} />

      {/* Honeypot - hidden from real users, catches simple bots */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
        aria-hidden="true"
      />

      <input
        type="text"
        name="authorName"
        required
        maxLength={80}
        placeholder="Dein Name"
        className="w-full rounded-lg border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-lime"
      />
      <textarea
        name="content"
        required
        maxLength={2000}
        rows={4}
        placeholder="Dein Kommentar"
        className="w-full rounded-lg border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-lime"
      />

      {state.message && !state.ok && <p className="text-sm text-red-500">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-lime px-6 py-2.5 text-sm font-semibold text-[#0d0d0f] transition-opacity disabled:opacity-50"
      >
        {pending ? "Wird gesendet..." : "Kommentar absenden"}
      </button>
    </form>
  );
}
