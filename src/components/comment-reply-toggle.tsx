"use client";

import { useState } from "react";
import { CommentForm } from "@/components/comment-form";
import { useSprache } from "@/lib/i18n/use-sprache";

export function CommentReplyToggle({
  postId,
  slug,
  parentId,
}: {
  postId: string;
  slug: string;
  parentId: string;
}) {
  const [open, setOpen] = useState(false);
  const en = useSprache() === "en";

  if (open) {
    return (
      <div className="mt-3">
        <CommentForm postId={postId} slug={slug} parentId={parentId} compact />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="mt-3 text-xs font-semibold text-accent hover:underline"
    >
      {en ? "Reply" : "Antworten"}
    </button>
  );
}
