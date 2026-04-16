'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import dynamic from 'next/dynamic'
import Link from 'next/link'

// Dynamically import editor to avoid SSR issues with tiptap
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="border border-mv-border rounded-xl h-48 bg-mv-surface-2 animate-pulse" />
  ),
})

const POST_TYPES = [
  {
    id: 'text',
    label: 'Text',
    icon: (
      <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
        <path d="M2 3h10M2 7h7M2 11h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'image',
    label: 'Image',
    icon: (
      <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
        <rect x="1.5" y="2.5" width="11" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
        <circle cx="5" cy="6" r="1" fill="currentColor"/>
        <path d="M2 10l3-3 2.5 2.5L10 7l2.5 3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'link',
    label: 'Link',
    icon: (
      <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
        <path d="M5.5 8.5a3.5 3.5 0 005 0l2-2a3.5 3.5 0 00-5-5L6.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M8.5 5.5a3.5 3.5 0 00-5 0L1.5 7.5a3.5 3.5 0 005 5l1-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
]

export default function SubmitPostClient({ community, userId }) {
  const [postType,   setPostType]   = useState('text')
  const [title,      setTitle]      = useState('')
  const [body,       setBody]       = useState('')
  const [linkUrl,    setLinkUrl]    = useState('')
  const [imageUrl,   setImageUrl]   = useState('')
  const [uploading,  setUploading]  = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors,     setErrors]     = useState({})
  const imageInputRef = useRef()
  const supabase      = createClient()
  const router        = useRouter()

  // ── Validate ──────────────────────────────────────────────────────────
  function validate() {
    const e = {}
    if (!title.trim())                          e.title   = 'Title is required'
    if (title.trim().length > 300)              e.title   = 'Title must be under 300 characters'
    if (postType === 'link' && !linkUrl.trim()) e.link    = 'Link URL is required'
    if (postType === 'image' && !imageUrl)      e.image   = 'Please upload an image'
    if (postType === 'text' && body === '<p></p>') e.body = 'Body cannot be empty'
    return e
  }

  // ── Image upload to Supabase Storage ─────────────────────────────────
  async function handleImageUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const ext      = file.name.split('.').pop()
    const filePath = `${userId}/${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from('post-images')
      .upload(filePath, file, { upsert: true })

    if (error) {
      setErrors(prev => ({ ...prev, image: 'Upload failed. Try again.' }))
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('post-images')
      .getPublicUrl(filePath)

    setImageUrl(publicUrl)
    setErrors(prev => ({ ...prev, image: null }))
    setUploading(false)
  }

  // ── Submit post ───────────────────────────────────────────────────────
  async function handleSubmit() {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }

    setSubmitting(true)

    const payload = {
      title:        title.trim(),
      type:         postType,
      community_id: community.id,
      author_id:    userId,
      body:         postType === 'text'  ? body      : null,
      link_url:     postType === 'link'  ? linkUrl.trim() : null,
      image_url:    postType === 'image' ? imageUrl  : null,
    }

    const { data: post, error } = await supabase
      .from('posts')
      .insert(payload)
      .select('id')
      .single()

    if (error) {
      setErrors({ submit: 'Failed to create post. Please try again.' })
      setSubmitting(false)
      return
    }

    router.push(`/post/${post.id}`)
  }

  const titleLen = title.length

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 font-sans">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        {/* Community avatar */}
        <div className="w-9 h-9 rounded-xl border border-mv-border overflow-hidden bg-mv-primary/10 flex items-center justify-center shrink-0">
          {community.avatar_url ? (
            <img src={community.avatar_url} alt={community.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-bold text-mv-primary">{community.name?.[0]?.toUpperCase()}</span>
          )}
        </div>
        <div>
          <h1 className="text-base font-bold text-mv-text tracking-tight leading-none">
            Create a post
          </h1>
          <Link
            href={`/c/${community.name}`}
            className="text-xs text-mv-accent hover:text-mv-text transition-colors mt-0.5 inline-block"
          >
            c/{community.name}
          </Link>
        </div>
      </div>

      <div className="bg-mv-surface border border-mv-border rounded-2xl overflow-hidden">

        {/* ── Post type tabs ── */}
        <div className="flex border-b border-mv-border">
          {POST_TYPES.map(type => (
            <button
              key={type.id}
              type="button"
              onClick={() => { setPostType(type.id); setErrors({}) }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all border-b-2 -mb-px
                ${postType === type.id
                  ? 'text-mv-text border-mv-primary bg-mv-surface-2/50'
                  : 'text-mv-dim border-transparent hover:text-mv-muted hover:bg-mv-surface-2/30'
                }`}
            >
              {type.icon}
              {type.label}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4">

          {/* ── Title ── */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-mv-muted">Title</label>
              <span className={`text-xs ${titleLen > 280 ? 'text-red-400' : 'text-mv-dim'}`}>
                {titleLen}/300
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={e => { setTitle(e.target.value); setErrors(prev => ({ ...prev, title: null })) }}
              placeholder="An interesting title…"
              maxLength={300}
              className={`w-full bg-mv-surface-2 border rounded-xl px-4 py-2.5 text-sm text-mv-text placeholder:text-mv-dim outline-none transition-colors
                ${errors.title ? 'border-red-400/50 focus:border-red-400' : 'border-mv-border focus:border-mv-primary/50'}`}
            />
            {errors.title && <p className="text-xs text-red-400">{errors.title}</p>}
          </div>

          {/* ── Text body (rich text) ── */}
          {postType === 'text' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-mv-muted">Body</label>
              <RichTextEditor
                content={body}
                onChange={val => { setBody(val); setErrors(prev => ({ ...prev, body: null })) }}
                placeholder="Share your thoughts…"
              />
              {errors.body && <p className="text-xs text-red-400">{errors.body}</p>}
            </div>
          )}

          {/* ── Image upload ── */}
          {postType === 'image' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-mv-muted">Image</label>

              {imageUrl ? (
                <div className="relative group rounded-xl overflow-hidden border border-mv-border">
                  <img src={imageUrl} alt="Preview" className="w-full max-h-72 object-cover" />
                  <button
                    type="button"
                    onClick={() => { setImageUrl(''); imageInputRef.current.value = '' }}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 text-white rounded-lg flex items-center justify-center transition-colors"
                  >
                    <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                      <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploading}
                  className={`w-full border-2 border-dashed rounded-xl py-10 flex flex-col items-center gap-2 transition-colors
                    ${errors.image ? 'border-red-400/40' : 'border-mv-border hover:border-mv-primary/40'}`}
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin text-mv-dim" width="20" height="20" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="14 6"/>
                      </svg>
                      <span className="text-xs text-mv-dim">Uploading…</span>
                    </>
                  ) : (
                    <>
                      <svg width="22" height="22" viewBox="0 0 14 14" fill="none" className="text-mv-dim">
                        <rect x="1.5" y="2.5" width="11" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                        <circle cx="5" cy="6" r="1" fill="currentColor"/>
                        <path d="M2 10l3-3 2.5 2.5L10 7l2.5 3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-xs text-mv-dim">Click to upload an image</span>
                      <span className="text-xs text-mv-dim opacity-60">PNG, JPG, GIF up to 10MB</span>
                    </>
                  )}
                </button>
              )}

              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              {errors.image && <p className="text-xs text-red-400">{errors.image}</p>}
            </div>
          )}

          {/* ── Link URL ── */}
          {postType === 'link' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-mv-muted">URL</label>
              <div className={`flex items-center gap-2 bg-mv-surface-2 border rounded-xl px-3 transition-colors
                ${errors.link ? 'border-red-400/50' : 'border-mv-border focus-within:border-mv-primary/50'}`}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-mv-dim shrink-0">
                  <path d="M5.5 8.5a3.5 3.5 0 005 0l2-2a3.5 3.5 0 00-5-5L6.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  <path d="M8.5 5.5a3.5 3.5 0 00-5 0L1.5 7.5a3.5 3.5 0 005 5l1-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={e => { setLinkUrl(e.target.value); setErrors(prev => ({ ...prev, link: null })) }}
                  placeholder="https://example.com"
                  className="flex-1 bg-transparent py-2.5 text-sm text-mv-text placeholder:text-mv-dim outline-none"
                />
              </div>
              {errors.link && <p className="text-xs text-red-400">{errors.link}</p>}
            </div>
          )}

          {errors.submit && (
            <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2">
              {errors.submit}
            </p>
          )}

        </div>

        {/* ── Footer actions ── */}
        <div className="px-5 py-4 border-t border-mv-border flex items-center justify-between">
          <Link
            href={`/c/${community.name}`}
            className="text-xs font-semibold text-mv-dim hover:text-mv-muted border border-mv-border hover:border-mv-primary/40 px-4 py-2 rounded-xl transition-colors"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !title.trim()}
            className="flex items-center gap-2 text-xs font-semibold text-white bg-mv-primary hover:bg-mv-primary/90 px-5 py-2 rounded-xl transition-colors disabled:opacity-50"
          >
            {submitting && (
              <svg className="animate-spin" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="14 6"/>
              </svg>
            )}
            {submitting ? 'Posting…' : 'Post'}
          </button>
        </div>

      </div>

    </div>
  )
}