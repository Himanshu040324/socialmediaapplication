"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/utils/supabase/client";

// layout="vertical"   → original post sidebar style (default)
// layout="horizontal" → compact inline style for comments
export default function VoteButtons({
  postId,
  commentId,
  userId,
  initialScore,
  initialVote,
  layout = "vertical",
}) {
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState(initialVote);
  const [isPending, startTransition] = useTransition();
  const supabase = createClient();

  // Route to correct table + id field based on what was passed
  const table = commentId ? "comment_votes" : "votes";
  const idField = commentId ? "comment_id" : "post_id";
  const idValue = commentId ?? postId;

  async function handleVote(value) {
    const prevVote = userVote;
    const newValue = prevVote === value ? 0 : value;

    // Optimistic update
    setScore((s) => s - prevVote + newValue);
    setUserVote(newValue);

    startTransition(async () => {
      if (newValue === 0) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq(idField, idValue)
          .eq("user_id", userId);

        if (error) {
          setScore((s) => s - newValue + prevVote);
          setUserVote(prevVote);
          console.error("delete vote error:", error);
        }
      } else {
        const { error } = await supabase
          .from(table)
          .upsert(
            { [idField]: idValue, user_id: userId, value: newValue },
            { onConflict: `${idField},user_id` },
          );

        if (error) {
          setScore((s) => s - newValue + prevVote);
          setUserVote(prevVote);
          console.error("upsert vote error:", error);
        }
      }
    });
  }

  // ─── Horizontal layout (comments) ──────────────────────────────────────────
  if (layout === "horizontal") {
    return (
      <div className="flex items-center gap-0.5">
        {/* Upvote */}
        <button
          onClick={() => handleVote(1)}
          disabled={isPending}
          className={`w-6 h-6 flex items-center justify-center rounded-md transition-all disabled:opacity-40
            ${
              userVote === 1
                ? "text-mv-primary bg-mv-primary/10"
                : "text-mv-dim hover:text-mv-primary hover:bg-mv-primary/10"
            }`}
          aria-label="Upvote"
        >
          <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
            <path
              d="M7 2L13 9H1L7 2Z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
              fill={userVote === 1 ? "currentColor" : "none"}
            />
          </svg>
        </button>

        {/* Score */}
        <span
          className={`text-xs font-bold tabular-nums min-w-4.5 text-center
          ${userVote === 1 ? "text-mv-primary" : userVote === -1 ? "text-mv-pink" : "text-mv-muted"}`}
        >
          {score}
        </span>

        {/* Downvote */}
        <button
          onClick={() => handleVote(-1)}
          disabled={isPending}
          className={`w-6 h-6 flex items-center justify-center rounded-md transition-all disabled:opacity-40
            ${
              userVote === -1
                ? "text-mv-pink bg-mv-pink/10"
                : "text-mv-dim hover:text-mv-pink hover:bg-mv-pink/10"
            }`}
          aria-label="Downvote"
        >
          <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
            <path
              d="M7 12L1 5H13L7 12Z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
              fill={userVote === -1 ? "currentColor" : "none"}
            />
          </svg>
        </button>
      </div>
    );
  }

  // ─── Vertical layout (posts) — unchanged ───────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-1 px-3 py-4 bg-mv-surface-2 border-r border-mv-border min-w-11">
      {/* Upvote */}
      <button
        onClick={() => handleVote(1)}
        disabled={isPending}
        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all disabled:opacity-50
          ${
            userVote === 1
              ? "text-mv-primary bg-mv-primary/10"
              : "text-mv-dim hover:text-mv-primary hover:bg-mv-primary/10"
          }`}
        aria-label="Upvote"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M7 2L13 9H1L7 2Z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
            fill={userVote === 1 ? "currentColor" : "none"}
          />
        </svg>
      </button>

      {/* Score */}
      <span
        className={`text-xs font-bold tabular-nums
        ${userVote === 1 ? "text-mv-primary" : userVote === -1 ? "text-mv-pink" : "text-mv-muted"}`}
      >
        {score}
      </span>

      {/* Downvote */}
      <button
        onClick={() => handleVote(-1)}
        disabled={isPending}
        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all disabled:opacity-50
          ${
            userVote === -1
              ? "text-mv-pink bg-mv-pink/10"
              : "text-mv-dim hover:text-mv-pink hover:bg-mv-pink/10"
          }`}
        aria-label="Downvote"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M7 12L1 5H13L7 12Z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
            fill={userVote === -1 ? "currentColor" : "none"}
          />
        </svg>
      </button>
    </div>
  );
}
