'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
// import { submitPostAction } from './actions'
import { submitPostAction } from './action'

const TABS = [
  {
    type: 'text',
    label: 'Text',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M2 3h11M2 7h11M2 11h7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    type: 'image',
    label: 'Image',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <rect x="1" y="2" width="13" height="11" rx="2" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="5" cy="6" r="1.2" stroke="currentColor" strokeWidth="1.1" />
        <path d="M1 10l3.5-3.5L7 9l2.5-2.5L14 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    type: 'link',
    label: 'Link',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M6 9a3.5 3.5 0 005 0l2-2a3.5 3.5 0 00-5-5L7 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M9 6a3.5 3.5 0 00-5 0L2 8a3.5 3.5 0 005 5l1-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
]

export default function SubmitPostPage() {
  const params                        = useParams()
  const communityName                 = params.name
  const [type, setType]               = useState('text')
  const [title, setTitle]             = useState('')
  const [body, setBody]               = useState('')
  const [linkUrl, setLinkUrl]         = useState('')
  const [imageFile, setImageFile]     = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [error, setError]             = useState('')
  const [isPending, startTransition]  = useTransition()

  const titleCount = title.length

  function handleImageChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const formData = new FormData(e.target)
    formData.set('type', type)
    if (imageFile) formData.set('image', imageFile)

    startTransition(async () => {
      const result = await submitPostAction(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 font-sans">

      {/* Back link */}
      <Link
        href={`/c/${communityName}`}
        className="inline-flex items-center gap-2 text-mv-muted text-sm font-medium mb-6 hover:text-mv-text transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        c/{communityName}
      </Link>

      {/* Card */}
      <div className="bg-mv-surface border border-mv-border rounded-2xl overflow-hidden">

        {/* Card header */}
        <div className="px-7 pt-7 pb-5 border-b border-mv-border">
          <h1 className="text-xl font-bold text-mv-text tracking-tight">Create a post</h1>
          <p className="text-sm text-mv-muted mt-1 font-normal">
            Posting in <span className="text-mv-accent font-semibold">c/{communityName}</span>
          </p>
        </div>

        {/* hidden community_id will be set server-side via the URL param in action
            but we pass name here; action already gets communityId from formData */}
        <form onSubmit={handleSubmit} className="px-7 py-6 flex flex-col gap-6">

          {/* Hidden fields */}
          <input type="hidden" name="community_name" value={communityName} />

          {/* Type tabs */}
          <div className="flex gap-1 bg-mv-surface-2 border border-mv-border rounded-xl p-1">
            {TABS.map(tab => (
              <button
                key={tab.type}
                type="button"
                onClick={() => setType(tab.type)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all
                  ${type === tab.type
                    ? 'bg-mv-surface text-mv-text border border-mv-border shadow-sm'
                    : 'text-mv-dim hover:text-mv-muted'
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Title */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-mv-muted uppercase tracking-widest">
                Title
              </label>
              <span className={`text-xs ${titleCount > 300 ? 'text-red-400' : 'text-mv-dim'}`}>
                {titleCount}/300
              </span>
            </div>
            <input
              name="title"
              type="text"
              placeholder="An interesting title..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={300}
              required
              autoFocus
              className="w-full h-11 bg-mv-surface-2 border border-mv-border rounded-xl px-4 text-sm text-mv-text placeholder-mv-dim outline-none font-sans focus:border-mv-primary transition-colors"
            />
          </div>

          {/* Text body */}
          {type === 'text' && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-mv-muted uppercase tracking-widest">
                Body
              </label>
              <textarea
                name="body"
                placeholder="What do you want to share?"
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={6}
                className="w-full bg-mv-surface-2 border border-mv-border rounded-xl px-4 py-3 text-sm text-mv-text placeholder-mv-dim outline-none font-sans focus:border-mv-primary transition-colors resize-y leading-relaxed"
              />
            </div>
          )}

          {/* Image upload */}
          {type === 'image' && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-mv-muted uppercase tracking-widest">
                Image
              </label>

              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden border border-mv-border">
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="w-full max-h-72 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(null) }}
                    className="absolute top-3 right-3 w-8 h-8 bg-mv-bg/80 border border-mv-border rounded-full flex items-center justify-center text-mv-muted hover:text-mv-text transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-3 h-40 bg-mv-surface-2 border border-dashed border-mv-border rounded-xl cursor-pointer hover:border-mv-primary transition-colors group">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-mv-dim group-hover:text-mv-accent transition-colors">
                    <rect x="2" y="4" width="24" height="20" rx="4" stroke="currentColor" strokeWidth="1.3" />
                    <circle cx="9" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M2 19l6-6 4 4 4-4 8 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-sm text-mv-dim group-hover:text-mv-muted transition-colors font-normal">
                    Click to upload · PNG, JPG, GIF up to 5MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          )}

          {/* Link URL */}
          {type === 'link' && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-mv-muted uppercase tracking-widest">
                URL
              </label>
              <div className="flex items-center bg-mv-surface-2 border border-mv-border rounded-xl overflow-hidden focus-within:border-mv-primary transition-colors">
                <span className="px-4 h-11 flex items-center text-mv-dim border-r border-mv-border text-sm shrink-0">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M5.5 8.5a3.5 3.5 0 005 0l2-2a3.5 3.5 0 00-5-5L6.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    <path d="M8.5 5.5a3.5 3.5 0 00-5 0L1.5 7.5a3.5 3.5 0 005 5l1-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  name="link_url"
                  type="url"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={e => setLinkUrl(e.target.value)}
                  className="flex-1 h-11 bg-transparent px-4 text-sm text-mv-text placeholder-mv-dim outline-none font-sans"
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-500/8 border border-red-500/25 rounded-lg text-sm text-red-400">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className=" shrink-0">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
                <line x1="7" y1="4" x2="7" y2="7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                <circle cx="7" cy="10" r="0.7" fill="currentColor" />
              </svg>
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1 border-t border-mv-border">
            <Link
              href={`/c/${communityName}`}
              className="h-10 px-5 flex items-center text-sm font-medium text-mv-muted border border-mv-border rounded-xl hover:border-mv-primary hover:text-mv-text transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending || !title}
              className="h-10 px-6 flex items-center gap-2 bg-mv-primary text-mv-text text-sm font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              {isPending ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-mv-text/30 border-t-mv-text rounded-full animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  Post
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}