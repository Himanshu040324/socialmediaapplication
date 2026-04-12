'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import VoteButtons from '@/components/VoteButtons'

const SORT_TABS = ['Hot', 'New', 'Top']

function timeAgo(dateStr) {
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

function hotScore(score, createdAt) {
  const hours = (Date.now() - new Date(createdAt)) / 3_600_000
  return score / Math.pow(hours + 2, 1.5)
}

// ─── Post Card ────────────────────────────────────────────────────────────────
function PostCard({ post, userId }) {
  const router = useRouter()

  return (
    <div className="bg-mv-surface border border-mv-border rounded-2xl overflow-hidden hover:border-mv-primary/30 transition-colors">
      <div className="flex gap-0">

        {/* Vote sidebar — stop propagation so clicks don't navigate to post */}
        <div onClick={e => e.stopPropagation()}>
          <VoteButtons
            postId={post.id}
            userId={userId}
            initialScore={post.score}
            initialVote={post.userVote}
          />
        </div>

        {/* Content area — div + router.push instead of Link to avoid nested <a> */}
        <div
          className="flex-1 p-4 min-w-0 cursor-pointer group"
          onClick={() => router.push(`/post/${post.id}`)}
        >
          {/* Meta row */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {/* Community link — stopPropagation prevents double navigation */}
            <Link
              href={`/c/${post.communities?.name}`}
              onClick={e => e.stopPropagation()}
              className="text-xs font-bold text-mv-text hover:text-mv-accent transition-colors"
            >
              c/{post.communities?.name}
            </Link>
            <span className="text-mv-dim text-xs">·</span>
            <span className="text-xs text-mv-dim">
              u/<span className="text-mv-accent font-medium">{post.profiles?.username ?? 'deleted'}</span>
            </span>
            <span className="text-mv-dim text-xs">·</span>
            <span className="text-xs text-mv-dim">{timeAgo(post.created_at)}</span>

            {post.type !== 'text' && (
              <span className="ml-auto text-xs font-semibold text-mv-primary bg-mv-primary/10 border border-mv-primary/20 rounded px-2 py-0.5 uppercase tracking-wider">
                {post.type}
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="text-sm font-semibold text-mv-text leading-snug tracking-tight mb-2 group-hover:text-mv-accent transition-colors">
            {post.title}
          </h2>

          {/* Image preview */}
          {post.type === 'image' && post.image_url && (
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full rounded-xl max-h-72 object-cover border border-mv-border mb-2"
            />
          )}

          {/* Text snippet */}
          {post.type === 'text' && post.body && (
            <p className="text-xs text-mv-muted leading-relaxed line-clamp-2 mb-2">
              {post.body}
            </p>
          )}

          {/* Link pill */}
          {post.type === 'link' && post.link_url && (
            <span className="inline-flex items-center gap-1.5 text-xs text-mv-accent border border-mv-border bg-mv-surface-2 px-3 py-1 rounded-lg mb-2 truncate max-w-xs">
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                <path d="M5.5 8.5a3.5 3.5 0 005 0l2-2a3.5 3.5 0 00-5-5L6.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M8.5 5.5a3.5 3.5 0 00-5 0L1.5 7.5a3.5 3.5 0 005 5l1-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              {post.link_url}
            </span>
          )}

          {/* Comment count */}
          <div className="flex items-center gap-1.5 text-xs text-mv-dim">
            <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
              <path d="M1 1h11v8H7.5L5 12V9H1V1z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
            </svg>
            {post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}
          </div>
        </div>

      </div>
    </div>
  )
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function PostSkeleton() {
  return (
    <div className="bg-mv-surface border border-mv-border rounded-2xl overflow-hidden animate-pulse">
      <div className="flex">
        <div className="w-11 bg-mv-surface-2 border-r border-mv-border" />
        <div className="flex-1 p-4 space-y-3">
          <div className="flex gap-2">
            <div className="h-3 w-24 bg-mv-border rounded" />
            <div className="h-3 w-16 bg-mv-border rounded" />
            <div className="h-3 w-12 bg-mv-border rounded" />
          </div>
          <div className="h-4 w-3/4 bg-mv-border rounded" />
          <div className="h-3 w-1/4 bg-mv-border rounded" />
        </div>
      </div>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ filter }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-mv-surface-2 border border-mv-border flex items-center justify-center mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M3 5h18M3 12h18M3 19h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-mv-dim" />
        </svg>
      </div>
      <p className="text-mv-muted font-medium text-sm">No posts yet</p>
      <p className="text-mv-dim text-xs mt-1 max-w-xs">
        {filter === 'joined'
          ? "The communities you've joined haven't posted anything yet."
          : 'Be the first to post something.'}
      </p>
      {filter === 'joined' && (
        <Link
          href="/communities"
          className="mt-4 text-xs text-mv-accent border border-mv-border hover:border-mv-primary px-4 py-2 rounded-xl transition-colors"
        >
          Browse communities
        </Link>
      )}
    </div>
  )
}

// ─── Main FeedClient ──────────────────────────────────────────────────────────
export default function FeedClient({ userId }) {
  const [filter, setFilter]   = useState('all')
  const [sort, setSort]       = useState('Hot')
  const [posts, setPosts]     = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchPosts = useCallback(async () => {
    setLoading(true)

    let communityIds = null
    if (filter === 'joined') {
      const { data: memberships } = await supabase
        .from('community_members')
        .select('community_id')
        .eq('user_id', userId)

      communityIds = memberships?.map(m => m.community_id) ?? []
      if (communityIds.length === 0) {
        setPosts([])
        setLoading(false)
        return
      }
    }

    let query = supabase
      .from('posts')
      .select(`
        id,
        title,
        body,
        image_url,
        link_url,
        type,
        created_at,
        author_id,
        profiles!posts_author_id_fkey(username),
        communities(id, name),
        votes(user_id, value),
        comments(id)
      `)

    if (communityIds) {
      query = query.in('community_id', communityIds)
    }

    if (sort === 'New') {
      query = query.order('created_at', { ascending: false }).limit(50)
    } else {
      query = query.order('created_at', { ascending: false }).limit(200)
    }

    const { data, error } = await query
    if (error) {
      console.error('feed fetch error:', error)
      setLoading(false)
      return
    }

    let processed = (data ?? []).map(post => ({
      ...post,
      score:        post.votes?.reduce((sum, v) => sum + v.value, 0) ?? 0,
      userVote:     post.votes?.find(v => v.user_id === userId)?.value ?? 0,
      commentCount: post.comments?.length ?? 0,
    }))

    if (sort === 'Top') {
      processed.sort((a, b) => b.score - a.score)
    } else if (sort === 'Hot') {
      processed.sort((a, b) => hotScore(b.score, b.created_at) - hotScore(a.score, a.created_at))
    }

    setPosts(processed)
    setLoading(false)
  }, [filter, sort, userId])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 font-sans">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-mv-text tracking-tight">Feed</h1>

        {/* All / Joined toggle */}
        <div className="flex items-center bg-mv-surface-2 border border-mv-border rounded-xl p-1 gap-1">
          {['all', 'joined'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize
                ${filter === f
                  ? 'bg-mv-surface text-mv-text border border-mv-border shadow-sm'
                  : 'text-mv-dim hover:text-mv-muted'
                }`}
            >
              {f === 'all' ? 'All' : 'Joined'}
            </button>
          ))}
        </div>
      </div>

      {/* Sort tabs */}
      <div className="flex items-center gap-1 mb-5 border-b border-mv-border">
        {SORT_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setSort(tab)}
            className={`flex items-center gap-1.5 px-3 pb-3 text-sm font-semibold transition-all border-b-2 -mb-px
              ${sort === tab
                ? 'text-mv-text border-mv-primary'
                : 'text-mv-dim border-transparent hover:text-mv-muted hover:border-mv-border'
              }`}
          >
            {tab === 'Hot' && (
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M7 1C7 1 9.5 4 9.5 6.5C9.5 7.88 8.38 9 7 9C5.62 9 4.5 7.88 4.5 6.5C4.5 5.5 5 4.5 5 4.5C5 4.5 4 6 4 7.5C4 10.54 6.24 13 9 13C11.76 13 13 10.54 13 8C13 4 10 1 7 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              </svg>
            )}
            {tab === 'New' && (
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M7 4v3l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            )}
            {tab === 'Top' && (
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M7 2L13 9H1L7 2Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              </svg>
            )}
            {tab}
          </button>
        ))}
      </div>

      {/* Post list */}
      <div className="space-y-3">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <PostSkeleton key={i} />)
          : posts.length === 0
            ? <EmptyState filter={filter} />
            : posts.map(post => (
                <PostCard key={post.id} post={post} userId={userId} />
              ))
        }
      </div>

    </div>
  )
}