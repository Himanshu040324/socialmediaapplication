'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

function timeAgo(dateStr) {
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

const ICONS = {
  post_upvote: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 2L13 9H1L7 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="currentColor" />
    </svg>
  ),
  post_comment: (
    <svg width="14" height="14" viewBox="0 0 13 13" fill="none">
      <path d="M1 1h11v8H7.5L5 12V9H1V1z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  ),
  comment_reply: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 4h10M2 4l3-3M2 4l3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 10H2M12 10l-3-3M12 10l-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  mention: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  ),
}

const COLORS = {
  post_upvote:    'text-mv-primary bg-mv-primary/10',
  post_comment:   'text-mv-accent bg-mv-accent/10',
  comment_reply:  'text-mv-muted bg-mv-surface-2',
  mention:        'text-mv-pink bg-mv-pink/10',
}

function notificationText(n) {
  const actor = n.profiles?.username ?? 'Someone'
  switch (n.type) {
    case 'post_upvote':   return <><span className="font-semibold text-mv-text">u/{actor}</span> upvoted your post</>
    case 'post_comment':  return <><span className="font-semibold text-mv-text">u/{actor}</span> commented on your post</>
    case 'comment_reply': return <><span className="font-semibold text-mv-text">u/{actor}</span> replied to your comment</>
    case 'mention':       return <><span className="font-semibold text-mv-text">u/{actor}</span> mentioned you in a comment</>
    default:              return 'New notification'
  }
}

function notificationHref(n) {
  if (n.post_id && n.comment_id) return `/post/${n.post_id}#comment-${n.comment_id}`
  if (n.post_id) return `/post/${n.post_id}`
  return '/notifications'
}

// ─── Single notification row (shared by dropdown + page) ─────────────────────
export function NotificationRow({ n, onRead, compact = false }) {
  return (
    <Link
      href={notificationHref(n)}
      onClick={() => !n.is_read && onRead(n.id)}
      className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-mv-surface-2 
        ${!n.is_read ? 'bg-mv-surface-2/60' : ''}
        ${compact ? 'py-2.5' : 'py-3'}`}
    >
      {/* Type icon */}
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${COLORS[n.type] ?? 'text-mv-dim bg-mv-surface-2'}`}>
        {ICONS[n.type]}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-mv-muted leading-relaxed">
          {notificationText(n)}
        </p>
        {!compact && n.post_title && (
          <p className="text-xs text-mv-dim mt-0.5 truncate">"{n.post_title}"</p>
        )}
        <p className="text-xs text-mv-dim mt-0.5">{timeAgo(n.created_at)}</p>
      </div>

      {/* Unread dot */}
      {!n.is_read && (
        <div className="w-2 h-2 rounded-full bg-mv-primary shrink-0 mt-1.5" />
      )}
    </Link>
  )
}

// ─── Bell button + dropdown ───────────────────────────────────────────────────
export default function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([])
  const [open, setOpen]                   = useState(false)
  const dropdownRef                       = useRef(null)
  const supabase                          = createClient()
  const router                            = useRouter()

  const unreadCount = notifications.filter(n => !n.is_read).length

  // ── Fetch latest 20 notifications ───────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    const { data } = await supabase
      .from('notifications')
      .select(`
        id, type, is_read, created_at, post_id, comment_id,
        profiles!notifications_actor_id_fkey(username),
        posts(title)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    setNotifications(
      (data ?? []).map(n => ({
        ...n,
        post_title: n.posts?.title ?? null,
      }))
    )
  }, [userId])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  // ── Supabase Realtime subscription ──────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('notifications-bell')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Fetch full row (with joined profiles/posts) instead of using raw payload
          fetchNotifications()
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, fetchNotifications])

  // ── Close dropdown on outside click ─────────────────────────────────────
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ── Mark single notification as read ────────────────────────────────────
  async function markRead(id) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
  }

  // ── Mark all as read ─────────────────────────────────────────────────────
  async function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
  }

  return (
    <div className="relative" ref={dropdownRef}>

      {/* Bell button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className={`relative w-8 h-8 flex items-center justify-center rounded-xl transition-colors
          ${open ? 'bg-mv-surface-2 text-mv-text' : 'text-mv-dim hover:text-mv-text hover:bg-mv-surface-2'}`}
        aria-label="Notifications"
      >
        <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
          <path
            d="M10 2a6 6 0 00-6 6v3.5L2.5 13.5A1 1 0 003.4 15h13.2a1 1 0 00.9-1.5L16 11.5V8a6 6 0 00-6-6z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path d="M8 15a2 2 0 004 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-mv-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-10 w-80 bg-mv-surface border border-mv-border rounded-2xl shadow-xl overflow-hidden z-50">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-mv-border">
            <span className="text-sm font-bold text-mv-text">Notifications</span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-mv-accent hover:text-mv-text transition-colors"
                >
                  Mark all read
                </button>
              )}
              <Link
                href="/notifications"
                onClick={() => setOpen(false)}
                className="text-xs text-mv-dim hover:text-mv-muted transition-colors"
              >
                See all
              </Link>
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-mv-border">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-xs text-mv-dim">No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 8).map(n => (
                <NotificationRow
                  key={n.id}
                  n={n}
                  onRead={markRead}
                  compact
                />
              ))
            )}
          </div>

        </div>
      )}
    </div>
  )
}