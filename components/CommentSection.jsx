'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/utils/supabase/client'
import VoteButtons from '@/components/VoteButtons'
import ModMenu    from '@/components/ModMenu'

function timeAgo(dateStr) {
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000)
  if (seconds < 60)    return `${seconds}s ago`
  if (seconds < 3600)  return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

function countDescendants(commentId, allComments) {
  const direct = allComments.filter(c => c.parent_comment_id === commentId)
  return direct.reduce((total, r) => total + 1 + countDescendants(r.id, allComments), 0)
}

const MAX_DEPTH = 6
const INDENT_PX = 20

// ─── Single comment node (recursive) ─────────────────────────────────────────
function Comment({
  comment,
  allComments,
  userId,
  postId,
  communityId,
  communityName,
  isMod,
  depth = 0,
}) {
  const [collapsed, setCollapsed]    = useState(false)
  const [replying,  setReplying]     = useState(false)
  const [replyText, setReplyText]    = useState('')
  const [isPending, startTransition] = useTransition()
  const [isRemoved, setIsRemoved]    = useState(comment.is_removed ?? false)

  const [localReplies, setLocalReplies] = useState(
    () => allComments.filter(c => c.parent_comment_id === comment.id)
  )

  const supabase = createClient()

  const score    = comment.comment_votes?.reduce((sum, v) => sum + v.value, 0) ?? 0
  const userVote = comment.comment_votes?.find(v => v.user_id === userId)?.value ?? 0
  const hasReplies   = localReplies.length > 0
  const clampedDepth = Math.min(depth, MAX_DEPTH)

  async function handleReply(e) {
    e.preventDefault()
    if (!replyText.trim()) return

    startTransition(async () => {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          body:              replyText.trim(),
          post_id:           postId,
          author_id:         userId,
          parent_comment_id: comment.id,
        })
        .select(`
          id, body, created_at, author_id, parent_comment_id, is_removed,
          profiles!comments_author_id_fkey(username),
          comment_votes(user_id, value)
        `)
        .single()

      if (!error && data) {
        setLocalReplies(prev => [...prev, data])
        setReplyText('')
        setReplying(false)
        setCollapsed(false)
      }
    })
  }

  // Mod: remove callback updates local state immediately
  function handleCommentRemoved(id, removed) {
    // Only this comment's own removal is handled here; nested ones handle themselves
    if (id === comment.id) setIsRemoved(removed)
  }

  // ── Removed placeholder (non-mod view) ─────────────────────────────────────
  if (isRemoved && !isMod) {
    return (
      <div style={{ marginLeft: depth > 0 ? `${INDENT_PX}px` : '0' }} className="mt-2.5">
        <div className="flex gap-0 min-w-0">
          {depth > 0 && (
            <div className="w-4 shrink-0 flex justify-center mr-2 self-stretch">
              <div className="w-px bg-mv-border h-full" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="bg-mv-surface-2 border border-mv-border rounded-xl px-4 py-3">
              <p className="text-xs text-mv-dim italic">[comment removed by moderator]</p>
            </div>
            {/* Still render replies so thread structure is preserved */}
            {!collapsed && localReplies.length > 0 && (
              <div>
                {localReplies.map(reply => (
                  <Comment
                    key={reply.id}
                    comment={reply}
                    allComments={allComments}
                    userId={userId}
                    postId={postId}
                    communityId={communityId}
                    communityName={communityName}
                    isMod={isMod}
                    depth={depth + 1}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Full comment ───────────────────────────────────────────────────────────
  return (
    <div style={{ marginLeft: depth > 0 ? `${INDENT_PX}px` : '0' }} className="mt-2.5">
      <div className="flex gap-0 min-w-0">

        {/* Thread line */}
        {depth > 0 && (
          <button
            onClick={() => setCollapsed(p => !p)}
            aria-label={collapsed ? 'Expand thread' : 'Collapse thread'}
            className="w-4 shrink-0 flex justify-center group cursor-pointer self-stretch py-0 border-none bg-transparent mr-2"
          >
            <div className={`w-px transition-colors duration-150 h-full
              ${collapsed ? 'bg-mv-primary/60' : 'bg-mv-border group-hover:bg-mv-primary/70'}`}
            />
          </button>
        )}

        <div className="flex-1 min-w-0">

          {/* Removed banner — mods see content but with a warning */}
          {isRemoved && isMod && (
            <div className="flex items-center gap-1.5 mb-1 px-3 py-1 rounded-lg border border-red-500/20 bg-red-500/5 w-fit">
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="5.5" stroke="#f87171" strokeWidth="1.2"/>
                <path d="M4.5 7h5" stroke="#f87171" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <span className="text-xs font-semibold text-red-400">Removed — visible to mods only</span>
            </div>
          )}

          {/* Comment bubble */}
          <div className={`border rounded-xl px-4 py-3 transition-colors
            ${isRemoved && isMod
              ? 'bg-mv-surface border-red-500/20 opacity-70'
              : 'bg-mv-surface border-mv-border'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-xs font-semibold text-mv-accent">
                u/{comment.profiles?.username ?? 'deleted'}
              </span>
              <span className="text-mv-dim text-xs">·</span>
              <span className="text-xs text-mv-dim">{timeAgo(comment.created_at)}</span>
              {clampedDepth >= MAX_DEPTH && (
                <span className="text-xs text-mv-dim bg-mv-surface-2 border border-mv-border rounded px-1.5 py-0.5">
                  deep thread
                </span>
              )}
            </div>
            <p className="text-sm text-mv-muted leading-relaxed">{comment.body}</p>
          </div>

          {/* Action bar */}
          <div className="flex items-center gap-3 mt-1.5 px-1 flex-wrap">

            <VoteButtons
              commentId={comment.id}
              userId={userId}
              initialScore={score}
              initialVote={userVote}
              layout="horizontal"
            />

            <span className="text-mv-border text-xs select-none">|</span>

            <button
              onClick={() => setReplying(p => !p)}
              className={`flex items-center gap-1 text-xs font-medium transition-colors
                ${replying ? 'text-mv-accent' : 'text-mv-dim hover:text-mv-accent'}`}
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M1 1h10v7H6.5L4 11V8H1V1z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
              </svg>
              Reply
            </button>

            {hasReplies && (
              <>
                <span className="text-mv-border text-xs select-none">|</span>
                <button
                  onClick={() => setCollapsed(p => !p)}
                  className="flex items-center gap-1 text-xs font-medium text-mv-dim hover:text-mv-accent transition-colors ml-auto"
                >
                  {collapsed ? (
                    <>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {localReplies.length} {localReplies.length === 1 ? 'reply' : 'replies'}
                    </>
                  ) : (
                    <>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 3l3 4 3-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Collapse
                    </>
                  )}
                </button>
              </>
            )}

            {/* Mod menu */}
            {isMod && (
              <>
                <span className="text-mv-border text-xs select-none">|</span>
                <ModMenu
                  type="comment"
                  targetId={comment.id}
                  targetAuthorId={comment.author_id}
                  targetAuthorName={comment.profiles?.username}
                  communityId={communityId}
                  communityName={communityName}
                  isRemoved={isRemoved}
                  onRemoved={handleCommentRemoved}
                  onBanned={() => {}}
                />
              </>
            )}
          </div>

          {/* Reply form */}
          {replying && (
            <form onSubmit={handleReply} className="mt-2 flex flex-col gap-2">
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder={`Reply to u/${comment.profiles?.username ?? 'deleted'}...`}
                rows={2}
                autoFocus
                className="w-full bg-mv-surface-2 border border-mv-border rounded-xl px-4 py-2.5 text-sm text-mv-text placeholder-mv-dim outline-none font-sans focus:border-mv-primary transition-colors resize-none leading-relaxed"
              />
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isPending || !replyText.trim()}
                  className="h-8 px-4 bg-mv-primary text-mv-text text-xs font-semibold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                >
                  {isPending ? 'Posting…' : 'Reply'}
                </button>
                <button
                  type="button"
                  onClick={() => { setReplying(false); setReplyText('') }}
                  className="h-8 px-4 text-xs font-medium text-mv-dim hover:text-mv-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Nested replies */}
          {!collapsed && localReplies.length > 0 && (
            <div>
              {localReplies.map(reply => (
                <Comment
                  key={reply.id}
                  comment={reply}
                  allComments={allComments}
                  userId={userId}
                  postId={postId}
                  communityId={communityId}
                  communityName={communityName}
                  isMod={isMod}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}

          {/* Collapsed pill */}
          {collapsed && localReplies.length > 0 && (
            <button
              onClick={() => setCollapsed(false)}
              className="mt-2 flex items-center gap-2 text-xs text-mv-dim hover:text-mv-accent transition-colors border border-mv-border hover:border-mv-primary/40 rounded-lg px-3 py-1.5 bg-mv-surface-2 hover:bg-mv-surface"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-medium">{localReplies.length} {localReplies.length === 1 ? 'reply' : 'replies'} hidden</span>
              <span className="text-mv-border">· click to expand</span>
            </button>
          )}

        </div>
      </div>
    </div>
  )
}

// ─── Main CommentSection ──────────────────────────────────────────────────────
export default function CommentSection({
  postId,
  userId,
  initialComments,
  communityId,
  communityName,
  isMod = false,
}) {
  const [topLevelComments, setTopLevelComments] = useState(
    () => initialComments.filter(c => c.parent_comment_id === null)
  )
  const [allComments, setAllComments] = useState(initialComments)
  const [body,        setBody]        = useState('')
  const [isPending,   startTransition] = useTransition()
  const [error,       setError]       = useState('')
  const supabase = createClient()

  const totalCount = allComments.length

  async function handleSubmit(e) {
    e.preventDefault()
    if (!body.trim()) return
    setError('')

    startTransition(async () => {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          body:              body.trim(),
          post_id:           postId,
          author_id:         userId,
          parent_comment_id: null,
        })
        .select(`
          id, body, created_at, author_id, parent_comment_id, is_removed,
          profiles!comments_author_id_fkey(username),
          comment_votes(user_id, value)
        `)
        .single()

      if (error) { setError('Failed to post comment. Try again.'); return }

      setTopLevelComments(prev => [...prev, data])
      setAllComments(prev => [...prev, data])
      setBody('')
    })
  }

  return (
    <div className="flex flex-col gap-4">

      <h2 className="text-sm font-bold text-mv-text">
        {totalCount} {totalCount === 1 ? 'Comment' : 'Comments'}
      </h2>

      {/* Add comment form */}
      <form onSubmit={handleSubmit} className="bg-mv-surface border border-mv-border rounded-2xl p-4 flex flex-col gap-3">
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="What are your thoughts?"
          rows={3}
          className="w-full bg-mv-surface-2 border border-mv-border rounded-xl px-4 py-3 text-sm text-mv-text placeholder-mv-dim outline-none font-sans focus:border-mv-primary transition-colors resize-none leading-relaxed"
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending || !body.trim()}
            className="h-9 px-5 flex items-center gap-2 bg-mv-primary text-mv-text text-sm font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            {isPending ? (
              <>
                <span className="w-3 h-3 border-2 border-mv-text/30 border-t-mv-text rounded-full animate-spin" />
                Posting…
              </>
            ) : 'Comment'}
          </button>
        </div>
      </form>

      {/* Comments list */}
      {topLevelComments.length > 0 ? (
        <div className="flex flex-col">
          {topLevelComments.map(comment => (
            <Comment
              key={comment.id}
              comment={comment}
              allComments={allComments}
              userId={userId}
              postId={postId}
              communityId={communityId}
              communityName={communityName}
              isMod={isMod}
              depth={0}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-12 bg-mv-surface border border-mv-border rounded-2xl text-center">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M3 3h26v19H18L13 28v-6H3V3z" stroke="var(--mv-border)" strokeWidth="1.3" strokeLinejoin="round"/>
            <path d="M10 12h12M10 17h8" stroke="var(--mv-dim)" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <p className="text-sm font-semibold text-mv-text mt-1">No comments yet</p>
          <p className="text-xs text-mv-muted font-normal">Be the first to share your thoughts</p>
        </div>
      )}

    </div>
  )
}