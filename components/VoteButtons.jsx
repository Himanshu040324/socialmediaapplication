'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function VoteButtons({ postId, userId, initialScore, initialVote }) {
  const [score, setScore]            = useState(initialScore)
  const [userVote, setUserVote]      = useState(initialVote)
  const [isPending, startTransition] = useTransition()
  const supabase                     = createClient()

  async function handleVote(value) {
    const newValue = userVote === value ? 0 : value

    // Optimistic UI update
    setScore(prev => prev - userVote + newValue)
    setUserVote(newValue)

    startTransition(async () => {
      console.log('voting with:', { postId, userId, newValue, userVote })

      if (newValue === 0) {
        const { error } = await supabase
          .from('votes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId)
        console.log('delete error:', error)

      } else if (userVote === 0) {
        const { error } = await supabase
          .from('votes')
          .insert({ post_id: postId, user_id: userId, value: newValue })
        console.log('insert error:', error)

      } else {
        const { error } = await supabase
          .from('votes')
          .update({ value: newValue })
          .eq('post_id', postId)
          .eq('user_id', userId)
        console.log('update error:', error)
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