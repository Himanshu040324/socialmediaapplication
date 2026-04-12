'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const DEBOUNCE_MS = 300
const MIN_CHARS   = 2
const MAX_RESULTS = 5

// ─── Highlight matching substring ────────────────────────────────────────────
function Highlight({ text, query }) {
  if (!query) return <>{text}</>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-mv-primary font-semibold">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  )
}

export default function SearchBar() {
  const [query,    setQuery]    = useState('')
  const [results,  setResults]  = useState({ posts: [], communities: [] })
  const [loading,  setLoading]  = useState(false)
  const [open,     setOpen]     = useState(false)
  const [focused,  setFocused]  = useState(-1) // keyboard nav index

  const inputRef    = useRef(null)
  const dropdownRef = useRef(null)
  const timerRef    = useRef(null)
  const supabase    = createClient()
  const router      = useRouter()

  // Flat list of all navigable items for keyboard nav
  const allItems = [
    ...results.communities.map(c => ({ type: 'community', href: `/c/${c.name}`, data: c })),
    ...results.posts.map(p => ({ type: 'post', href: `/post/${p.id}`, data: p })),
  ]

  // ── Debounced search ──────────────────────────────────────────────────
  const search = useCallback(async (q) => {
    if (q.length < MIN_CHARS) {
      setResults({ posts: [], communities: [] })
      setOpen(false)
      setLoading(false)
      return
    }

    setLoading(true)

    const [{ data: communities }, { data: posts }] = await Promise.all([
      supabase
        .from('communities')
        .select('id, name, description')
        .ilike('name', `%${q}%`)
        .limit(MAX_RESULTS),

      supabase
        .from('posts')
        .select(`
          id, title, type,
          communities(name)
        `)
        .ilike('title', `%${q}%`)
        .limit(MAX_RESULTS),
    ])

    setResults({
      communities: communities ?? [],
      posts:       posts ?? [],
    })
    setLoading(false)
    setOpen(true)
    setFocused(-1)
  }, [])

  useEffect(() => {
    clearTimeout(timerRef.current)
    if (query.length < MIN_CHARS) {
      setResults({ posts: [], communities: [] })
      setOpen(false)
      return
    }
    timerRef.current = setTimeout(() => search(query), DEBOUNCE_MS)
    return () => clearTimeout(timerRef.current)
  }, [query, search])

  // ── Close on outside click ────────────────────────────────────────────
  useEffect(() => {
    function handleClick(e) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        inputRef.current && !inputRef.current.contains(e.target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // ── Keyboard navigation ───────────────────────────────────────────────
  function handleKeyDown(e) {
    if (!open) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocused(prev => Math.min(prev + 1, allItems.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocused(prev => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (focused >= 0 && allItems[focused]) {
        router.push(allItems[focused].href)
        setOpen(false)
        setQuery('')
        inputRef.current?.blur()
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  function handleSelect() {
    setOpen(false)
    setQuery('')
  }

  const hasResults = results.communities.length > 0 || results.posts.length > 0
  let itemIndex = 0 // running index for keyboard focus across both sections

  return (
    <div className="relative flex-1 max-w-sm">

      {/* Input */}
      <div className={`flex items-center gap-2 bg-mv-surface-2 border rounded-xl px-3 py-2 transition-colors
        ${open || query ? 'border-mv-primary/50' : 'border-mv-border hover:border-mv-primary/30'}`}
      >
        {/* Search icon */}
        {loading ? (
          <svg className="animate-spin shrink-0 text-mv-dim" width="14" height="14" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="14 6" />
          </svg>
        ) : (
          <svg className="shrink-0 text-mv-dim" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        )}

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (hasResults) setOpen(true) }}
          placeholder="Search posts, communities…"
          className="flex-1 bg-transparent text-sm text-mv-text placeholder:text-mv-dim outline-none min-w-0"
        />

        {/* Clear button */}
        {query && (
          <button
            onClick={() => { setQuery(''); setOpen(false); inputRef.current?.focus() }}
            className="shrink-0 text-mv-dim hover:text-mv-muted transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-mv-surface border border-mv-border rounded-2xl shadow-xl overflow-hidden z-50"
        >
          {!hasResults ? (
            <div className="px-4 py-6 text-center">
              <p className="text-xs text-mv-dim">No results for <span className="text-mv-muted font-medium">"{query}"</span></p>
            </div>
          ) : (
            <>
              {/* ── Communities section ── */}
              {results.communities.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1.5 text-[10px] font-bold text-mv-dim uppercase tracking-widest">
                    Communities
                  </p>
                  {results.communities.map(c => {
                    const isFocused = focused === itemIndex
                    const currentIndex = itemIndex++
                    return (
                      <Link
                        key={c.id}
                        href={`/c/${c.name}`}
                        onClick={handleSelect}
                        onMouseEnter={() => setFocused(currentIndex)}
                        className={`flex items-center gap-3 px-4 py-2.5 transition-colors
                          ${isFocused ? 'bg-mv-surface-2' : 'hover:bg-mv-surface-2'}`}
                      >
                        {/* Community icon */}
                        <div className="w-7 h-7 rounded-lg bg-mv-primary/10 border border-mv-primary/20 flex items-center justify-center shrink-0">
                          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                            <circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2" className="text-mv-primary" />
                            <path d="M2 12c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" className="text-mv-primary" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-mv-text leading-tight">
                            c/<Highlight text={c.name} query={query} />
                          </p>
                          {c.description && (
                            <p className="text-xs text-mv-dim truncate mt-0.5">{c.description}</p>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}

              {/* ── Posts section ── */}
              {results.posts.length > 0 && (
                <div className={results.communities.length > 0 ? 'border-t border-mv-border' : ''}>
                  <p className="px-4 pt-3 pb-1.5 text-[10px] font-bold text-mv-dim uppercase tracking-widest">
                    Posts
                  </p>
                  {results.posts.map(p => {
                    const isFocused = focused === itemIndex
                    const currentIndex = itemIndex++
                    return (
                      <Link
                        key={p.id}
                        href={`/post/${p.id}`}
                        onClick={handleSelect}
                        onMouseEnter={() => setFocused(currentIndex)}
                        className={`flex items-center gap-3 px-4 py-2.5 transition-colors
                          ${isFocused ? 'bg-mv-surface-2' : 'hover:bg-mv-surface-2'}`}
                      >
                        {/* Type icon */}
                        <div className="w-7 h-7 rounded-lg bg-mv-surface-2 border border-mv-border flex items-center justify-center shrink-0">
                          {p.type === 'image' ? (
                            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                              <rect x="1.5" y="2.5" width="11" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2" className="text-mv-muted" />
                              <circle cx="5" cy="6" r="1" fill="currentColor" className="text-mv-muted" />
                              <path d="M2 10l3-3 2.5 2.5L10 7l2.5 3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" className="text-mv-muted" />
                            </svg>
                          ) : p.type === 'link' ? (
                            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                              <path d="M5.5 8.5a3.5 3.5 0 005 0l2-2a3.5 3.5 0 00-5-5L6.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" className="text-mv-muted" />
                              <path d="M8.5 5.5a3.5 3.5 0 00-5 0L1.5 7.5a3.5 3.5 0 005 5l1-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" className="text-mv-muted" />
                            </svg>
                          ) : (
                            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                              <path d="M2 3h10M2 7h7M2 11h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" className="text-mv-muted" />
                            </svg>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-mv-text leading-tight truncate">
                            <Highlight text={p.title} query={query} />
                          </p>
                          {p.communities?.name && (
                            <p className="text-xs text-mv-dim mt-0.5">c/{p.communities.name}</p>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}

              {/* Footer hint */}
              <div className="px-4 py-2 border-t border-mv-border flex items-center gap-1.5">
                <kbd className="text-[10px] text-mv-dim bg-mv-surface-2 border border-mv-border px-1.5 py-0.5 rounded">↑↓</kbd>
                <span className="text-[10px] text-mv-dim">navigate</span>
                <kbd className="ml-2 text-[10px] text-mv-dim bg-mv-surface-2 border border-mv-border px-1.5 py-0.5 rounded">↵</kbd>
                <span className="text-[10px] text-mv-dim">open</span>
                <kbd className="ml-2 text-[10px] text-mv-dim bg-mv-surface-2 border border-mv-border px-1.5 py-0.5 rounded">Esc</kbd>
                <span className="text-[10px] text-mv-dim">close</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}