"use client";

import { useState } from "react";
import { CommentForm } from "@/components/comment-form";

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
      Antworten
    </button>
  );
}
