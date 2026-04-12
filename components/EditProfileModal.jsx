'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

function ImageUploadField({ label, currentUrl, bucket, userId, onUploaded }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview]     = useState(currentUrl)
  const inputRef                  = useRef()
  const supabase                  = createClient()

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return

    // Local preview
    setPreview(URL.createObjectURL(file))
    setUploading(true)

    const ext      = file.name.split('.').pop()
    const filePath = `${userId}/${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { upsert: true })

    if (error) {
      console.error(`${bucket} upload error:`, error)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    onUploaded(publicUrl)
    setUploading(false)
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-mv-muted">{label}</label>

      {/* Preview */}
      {preview && (
        <div className={`w-full overflow-hidden border border-mv-border rounded-xl
          ${bucket === 'avatars' ? 'w-16 h-16 rounded-full' : 'h-24'}`}
        >
          <img
            src={preview}
            alt={label}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 text-xs text-mv-accent border border-mv-border hover:border-mv-primary px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
      >
        {uploading ? (
          <>
            <svg className="animate-spin" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="14 6" />
            </svg>
            Uploading…
          </>
        ) : (
          <>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v8M3 5l4-4 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M1 11h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            {preview ? 'Change' : 'Upload'} {label}
          </>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  )
}

export default function EditProfileModal({ profile, onClose, onSaved }) {
  const [bio,       setBio]       = useState(profile.bio ?? '')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? '')
  const [bannerUrl, setBannerUrl] = useState(profile.banner_url ?? '')
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState(null)
  const supabase                  = createClient()
  const router                    = useRouter()

  async function handleSave() {
    setSaving(true)
    setError(null)

    const { error } = await supabase
      .from('profiles')
      .update({
        bio:        bio.trim() || null,
        avatar_url: avatarUrl || null,
        banner_url: bannerUrl || null,
      })
      .eq('id', profile.id)

    if (error) {
      setError('Failed to save. Please try again.')
      setSaving(false)
      return
    }

    onSaved({ ...profile, bio, avatar_url: avatarUrl, banner_url: bannerUrl })
    router.refresh()
    onClose()
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      {/* Modal */}
      <div className="bg-mv-surface border border-mv-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-mv-border">
          <h2 className="text-sm font-bold text-mv-text">Edit Profile</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-mv-dim hover:text-mv-text hover:bg-mv-surface-2 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-5">

          {/* Banner upload */}
          <ImageUploadField
            label="Banner Image"
            currentUrl={bannerUrl}
            bucket="banners"
            userId={profile.id}
            onUploaded={setBannerUrl}
          />

          {/* Avatar upload */}
          <ImageUploadField
            label="Avatar"
            currentUrl={avatarUrl}
            bucket="avatars"
            userId={profile.id}
            onUploaded={setAvatarUrl}
          />

          {/* Bio */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-mv-muted">Bio</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell people a little about yourself…"
              maxLength={160}
              rows={3}
              className="w-full bg-mv-surface-2 border border-mv-border rounded-xl px-3 py-2.5 text-sm text-mv-text placeholder:text-mv-dim resize-none focus:outline-none focus:border-mv-primary transition-colors"
            />
            <p className="text-xs text-mv-dim text-right">{bio.length}/160</p>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-mv-border flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-mv-dim hover:text-mv-muted border border-mv-border hover:border-mv-primary px-4 py-2 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-xs font-semibold text-white bg-mv-primary hover:bg-mv-primary/90 px-4 py-2 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving && (
              <svg className="animate-spin" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="14 6" />
              </svg>
            )}
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>

      </div>
    </div>
  )
}