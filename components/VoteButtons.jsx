'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function VoteButtons({ postId, userId, initialScore, initialVote }) {
  const [score, setScore]            = useState(initialScore)
  const [userVote, setUserVote]      = useState(initialVote)
  const [isPending, startTransition] = useTransition()
  const supabase                     = createClient()

  async function handleVote(value) {
    // Capture BEFORE any state update to avoid stale closure inside startTransition
    const prevVote = userVote
    const newValue = prevVote === value ? 0 : value

    // Optimistic UI update
    setScore(s => s - prevVote + newValue)
    setUserVote(newValue)

    startTransition(async () => {
      if (newValue === 0) {
        // User toggled their existing vote off → delete it
        const { error } = await supabase
          .from('votes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId)

        if (error) {
          // Rollback optimistic update
          setScore(s => s - newValue + prevVote)
          setUserVote(prevVote)
          console.error('delete vote error:', error)
        }

      } else {
        // Insert or update (handles both new votes AND switching up↔down)
        // upsert will INSERT if no row exists, UPDATE if it does — no more silent failures
        const { error } = await supabase
          .from('votes')
          .upsert(
            { post_id: postId, user_id: userId, value: newValue },
            { onConflict: 'post_id,user_id' }
          )

        if (error) {
          // Rollback optimistic update
          setScore(s => s - newValue + prevVote)
          setUserVote(prevVote)
          console.error('upsert vote error:', error)
        }
      }
    })
  }

  return (
    <div className="flex flex-col items-center gap-1 px-3 py-4 bg-mv-surface-2 border-r border-mv-border min-w-11">

      {/* Upvote */}
      <button
        onClick={() => handleVote(1)}
        disabled={isPending}
        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all disabled:opacity-50
          ${userVote === 1
            ? 'text-mv-primary bg-mv-primary/10'
            : 'text-mv-dim hover:text-mv-primary hover:bg-mv-primary/10'
          }`}
        aria-label="Upvote"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M7 2L13 9H1L7 2Z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
            fill={userVote === 1 ? 'currentColor' : 'none'}
          />
        </svg>
      </button>

      {/* Score */}
      <span className={`text-xs font-bold tabular-nums
        ${userVote === 1 ? 'text-mv-primary' : userVote === -1 ? 'text-mv-pink' : 'text-mv-muted'}`}
      >
        {score}
      </span>

      {/* Downvote */}
      <button
        onClick={() => handleVote(-1)}
        disabled={isPending}
        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all disabled:opacity-50
          ${userVote === -1
            ? 'text-mv-pink bg-mv-pink/10'
            : 'text-mv-dim hover:text-mv-pink hover:bg-mv-pink/10'
          }`}
        aria-label="Downvote"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M7 12L1 5H13L7 12Z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
            fill={userVote === -1 ? 'currentColor' : 'none'}
          />
        </svg>
      </button>

    </div>
  )
}