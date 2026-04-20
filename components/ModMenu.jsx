'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { removePost, pinPost, removeComment, banUser } from '@/actions/moderationActions'

// ─── Tiny inline components ───────────────────────────────────────────────────

function MenuIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="2.5" r="1" fill="currentColor"/>
      <circle cx="7" cy="7"   r="1" fill="currentColor"/>
      <circle cx="7" cy="11.5" r="1" fill="currentColor"/>
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
      <path d="M7 1.5L2 4v3.5C2 10.54 4.24 13 7 13s5-2.46 5-5.5V4L7 1.5z"
        stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Props:
//   type            "post" | "comment"
//   targetId        post.id or comment.id
//   targetAuthorId  the author's user id
//   targetAuthorName the author's username (for display)
//   communityId
//   communityName   (used in post-level actions)
//   isPinned        boolean (posts only)
//   isRemoved       boolean
//   onRemoved(id, removed)   called optimistically
//   onPinToggled(id, pinned) called optimistically (posts only)
//   onBanned()               called after ban
// ─────────────────────────────────────────────────────────────────────────────
export default function ModMenu({
  type,
  targetId,
  targetAuthorId,
  targetAuthorName,
  communityId,
  communityName,
  isPinned     = false,
  isRemoved    = false,
  onRemoved,
  onPinToggled,
  onBanned,
}) {
  const [open,      setOpen]      = useState(false)
  const [view,      setView]      = useState('menu')   // 'menu' | 'confirmRemove' | 'ban'
  const [banReason, setBanReason] = useState('')
  const [banError,  setBanError]  = useState('')
  const [isPending, startTransition] = useTransition()

  const menuRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        closeMenu()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  function closeMenu() {
    setOpen(false)
    setView('menu')
    setBanReason('')
    setBanError('')
  }

  // ── Remove / restore ────────────────────────────────────────────────────────
  function handleRemoveConfirm() {
    startTransition(async () => {
      const newRemoved = !isRemoved
      const result = type === 'post'
        ? await removePost(targetId, communityId, newRemoved)
        : await removeComment(targetId, communityId, newRemoved)

      if (!result.error) {
        onRemoved?.(targetId, newRemoved)
        closeMenu()
      }
    })
  }

  // ── Pin / unpin ─────────────────────────────────────────────────────────────
  function handlePinToggle() {
    startTransition(async () => {
      const newPinned = !isPinned
      const result = await pinPost(targetId, communityId, newPinned)
      if (!result.error) {
        onPinToggled?.(targetId, newPinned)
        closeMenu()
      }
    })
  }

  // ── Ban ─────────────────────────────────────────────────────────────────────
  function handleBan(e) {
    e.preventDefault()
    setBanError('')
    startTransition(async () => {
      const result = await banUser(targetAuthorId, communityId, banReason)
      if (result.error) {
        setBanError(result.error)
      } else {
        onBanned?.(targetAuthorId)
        closeMenu()
      }
    })
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="relative" ref={menuRef}>

      {/* Trigger */}
      <button
        onClick={() => setOpen(p => !p)}
        className={`flex items-center justify-center w-6 h-6 rounded-md transition-colors
          ${open ? 'bg-mv-surface-2 text-mv-text' : 'text-mv-dim hover:bg-mv-surface-2 hover:text-mv-muted'}`}
        aria-label="Moderator actions"
        title="Mod actions"
      >
        <ShieldIcon />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 z-50 mt-1 w-52 bg-mv-surface border border-mv-border rounded-xl shadow-xl overflow-hidden"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-mv-border flex items-center gap-1.5">
            <ShieldIcon />
            <span className="text-xs font-bold text-mv-muted tracking-wide uppercase">Mod Tools</span>
          </div>

          {/* ── Menu view ─────────────────────────────────────────────── */}
          {view === 'menu' && (
            <div className="py-1">

              {/* Pin / Unpin — posts only */}
              {type === 'post' && (
                <button
                  onClick={handlePinToggle}
                  disabled={isPending}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-mv-muted hover:bg-mv-surface-2 hover:text-mv-text transition-colors disabled:opacity-40 text-left"
                >
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                    <path d="M9 1L13 5l-4 4-2-1-3 3H2v-2l3-3-1-2 4-4z"
                      stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"
                      fill={isPinned ? 'currentColor' : 'none'}/>
                  </svg>
                  {isPinned ? 'Unpin Post' : 'Pin to Top'}
                </button>
              )}

              {/* Remove / Restore */}
              <button
                onClick={() => setView('confirmRemove')}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium hover:bg-mv-surface-2 transition-colors text-left text-red-400 hover:text-red-300"
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M4.5 7h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                {isRemoved ? 'Restore' : `Remove ${type === 'post' ? 'Post' : 'Comment'}`}
              </button>

              {/* Ban user */}
              <button
                onClick={() => setView('ban')}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-orange-400 hover:text-orange-300 hover:bg-mv-surface-2 transition-colors text-left"
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M3 3l8 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                Ban u/{targetAuthorName ?? 'user'}
              </button>
            </div>
          )}

          {/* ── Confirm remove view ────────────────────────────────────── */}
          {view === 'confirmRemove' && (
            <div className="p-3 flex flex-col gap-3">
              <p className="text-xs text-mv-muted leading-relaxed">
                {isRemoved
                  ? `Restore this ${type}? It will become visible again.`
                  : `Remove this ${type}? It will be hidden from other users.`}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleRemoveConfirm}
                  disabled={isPending}
                  className="flex-1 h-7 text-xs font-semibold rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors disabled:opacity-40"
                >
                  {isPending ? '…' : isRemoved ? 'Restore' : 'Remove'}
                </button>
                <button
                  onClick={() => setView('menu')}
                  className="flex-1 h-7 text-xs font-medium rounded-lg text-mv-dim hover:text-mv-muted border border-mv-border hover:bg-mv-surface-2 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* ── Ban view ───────────────────────────────────────────────── */}
          {view === 'ban' && (
            <form onSubmit={handleBan} className="p-3 flex flex-col gap-2.5">
              <p className="text-xs text-mv-muted">
                Ban <span className="font-semibold text-mv-text">u/{targetAuthorName ?? 'user'}</span> from this community?
              </p>
              <textarea
                value={banReason}
                onChange={e => setBanReason(e.target.value)}
                placeholder="Reason (optional)"
                rows={2}
                className="w-full bg-mv-surface-2 border border-mv-border rounded-lg px-2.5 py-2 text-xs text-mv-text placeholder-mv-dim outline-none focus:border-mv-primary transition-colors resize-none font-sans"
              />
              {banError && (
                <p className="text-xs text-red-400">{banError}</p>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 h-7 text-xs font-semibold rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30 transition-colors disabled:opacity-40"
                >
                  {isPending ? '…' : 'Ban User'}
                </button>
                <button
                  type="button"
                  onClick={() => setView('menu')}
                  className="flex-1 h-7 text-xs font-medium rounded-lg text-mv-dim hover:text-mv-muted border border-mv-border hover:bg-mv-surface-2 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

        </div>
      )}
    </div>
  )
}