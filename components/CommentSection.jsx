'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/utils/supabase/client'

function timeAgo(dateStr) {
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000)
  if (seconds < 60)    return `${seconds}s ago`
  if (seconds < 3600)  return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

// Single comment + its replies (recursive)
function Comment({ comment, allComments, userId, postId, depth = 0 }) {
  const [replying, setReplying]      = useState(false)
  const [replyText, setReplyText]    = useState('')
  const [isPending, startTransition] = useTransition()
  const [replies, setReplies]        = useState(
    allComments.filter(c => c.parent_comment_id === comment.id)
  )
  const supabase = createClient()

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
          id,
          body,
          created_at,
          author_id,
          parent_comment_id,
          profiles!comments_author_id_fkey(username)
        `)
        .single()

      if (!error && data) {
        setReplies(prev => [...prev, data])
        setReplyText('')
        setReplying(false)
      }
    })
  }

  return (
    <div className={`flex gap-3 ${depth > 0 ? 'ml-6 mt-3' : ''}`}>

      {/* Thread line */}
      {depth > 0 && (
        <div className="w-px bg-mv-border flex-shrink-0 mt-1 self-stretch" />
      )}

      <div className="flex-1 min-w-0">
        {/* Comment bubble */}
        <div className="bg-mv-surface border border-mv-border rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-mv-accent">
              u/{comment.profiles?.username ?? 'deleted'}
            </span>
            <span className="text-mv-dim text-xs">·</span>
            <span className="text-xs text-mv-dim">{timeAgo(comment.created_at)}</span>
          </div>
          <p className="text-sm text-mv-muted leading-relaxed font-normal">
            {comment.body}
          </p>
        </div>

        {/* Reply button */}
        <button
          onClick={() => setReplying(p => !p)}
          className="mt-1.5 ml-1 text-xs text-mv-dim hover:text-mv-accent transition-colors font-medium flex items-center gap-1"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1h10v7H6.5L4 11V8H1V1z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
          </svg>
          Reply
        </button>

        {/* Reply form */}
        {replying && (
          <form onSubmit={handleReply} className="mt-2 flex flex-col gap-2">
            <textarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Write a reply..."
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
                {isPending ? 'Posting...' : 'Reply'}
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
        {replies.length > 0 && (
          <div className="mt-2 flex flex-col gap-0">
            {replies.map(reply => (
              <Comment
                key={reply.id}
                comment={reply}
                allComments={allComments}
                userId={userId}
                postId={postId}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Main CommentSection component
export default function CommentSection({ postId, userId, initialComments }) {
  const [comments, setComments]      = useState(
    initialComments.filter(c => c.parent_comment_id === null)
  )
  const [allComments, setAllComments] = useState(initialComments)
  const [body, setBody]              = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError]            = useState('')
  const supabase                     = createClient()

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
          id,
          body,
          created_at,
          author_id,
          parent_comment_id,
          profiles!comments_author_id_fkey(username)
        `)
        .single()

      if (error) {
        setError('Failed to post comment. Try again.')
        return
      }

      setComments(prev => [...prev, data])
      setAllComments(prev => [...prev, data])
      setBody('')
    })
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Comment count */}
      <h2 className="text-sm font-bold text-mv-text">
        {totalCount} {totalCount === 1 ? 'Comment' : 'Comments'}
      </h2>

      {/* Add comment form */}
      <form
        onSubmit={handleSubmit}
        className="bg-mv-surface border border-mv-border rounded-2xl p-4 flex flex-col gap-3"
      >
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="What are your thoughts?"
          rows={3}
          className="w-full bg-mv-surface-2 border border-mv-border rounded-xl px-4 py-3 text-sm text-mv-text placeholder-mv-dim outline-none font-sans focus:border-mv-primary transition-colors resize-none leading-relaxed"
        />

        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending || !body.trim()}
            className="h-9 px-5 flex items-center gap-2 bg-mv-primary text-mv-text text-sm font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            {isPending ? (
              <>
                <span className="w-3 h-3 border-2 border-mv-text/30 border-t-mv-text rounded-full animate-spin" />
                Posting...
              </>
            ) : 'Comment'}
          </button>
        </div>
      </form>

      {/* Comments list */}
      {comments.length > 0 ? (
        <div className="flex flex-col gap-3">
          {comments.map(comment => (
            <Comment
              key={comment.id}
              comment={comment}
              allComments={allComments}
              userId={userId}
              postId={postId}
              depth={0}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-12 bg-mv-surface border border-mv-border rounded-2xl text-center">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M3 3h26v19H18L13 28v-6H3V3z" stroke="var(--mv-border)" strokeWidth="1.3" strokeLinejoin="round" />
            <path d="M10 12h12M10 17h8" stroke="var(--mv-dim)" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <p className="text-sm font-semibold text-mv-text mt-1">No comments yet</p>
          <p className="text-xs text-mv-muted font-normal">Be the first to share your thoughts</p>
        </div>
      )}

    </div>
  )
}