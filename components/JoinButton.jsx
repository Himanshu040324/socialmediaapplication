'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function JoinButton({ communityId, userId, initialJoined }) {
  const [isJoined, setIsJoined]      = useState(initialJoined)
  const [isPending, startTransition] = useTransition()
  const supabase                     = createClient()

  async function handleClick() {
    startTransition(async () => {
      if (isJoined) {
        // Leave community
        await supabase
          .from('memberships')
          .delete()
          .eq('user_id', userId)
          .eq('community_id', communityId)

        setIsJoined(false)
      } else {
        // Join community
        await supabase
          .from('memberships')
          .insert({ user_id: userId, community_id: communityId })

        setIsJoined(true)
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`h-9 px-5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2
        ${isJoined
          ? 'bg-transparent border border-mv-border text-mv-muted hover:border-red-500/50 hover:text-red-400'
          : 'bg-mv-primary text-mv-text hover:opacity-90'
        }`}
    >
      {isPending ? (
        <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      ) : isJoined ? (
        <>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M2 6.5h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          Leave
        </>
      ) : (
        <>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 2v9M2 6.5h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          Join
        </>
      )}
    </button>
  )
}