'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createCommunityAction } from './action'

export default function CreateCommunityPage() {
  const [name, setName]               = useState('')
  const [description, setDescription] = useState('')
  const [error, setError]             = useState('')
  const [isPending, startTransition]  = useTransition()
  const router                        = useRouter()

  const nameValid   = /^[a-zA-Z0-9_]*$/.test(name)
  const nameCount   = name.length
  const descCount   = description.length

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const formData = new FormData(e.target)
    startTransition(async () => {
      const result = await createCommunityAction(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="create-root">

      {/* Back link */}
      <Link href="/communities" className="back-link">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Communities
      </Link>

      <div className="create-card">

        {/* Header */}
        <div className="card-header">
          <div className="header-icon">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="9.5" stroke="var(--mv-primary)" strokeWidth="1.2" />
              <path d="M11 6v10M6 11h10" stroke="var(--mv-accent)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h1 className="card-title">Create a community</h1>
            <p className="card-sub">Build a space for people who share your interests</p>
          </div>
        </div>

        <div className="divider" />

        <form onSubmit={handleSubmit} className="form" noValidate>

          {/* Name */}
          <div className="field">
            <div className="field-top">
              <label className="field-label">Community name</label>
              <span className={`char-count ${nameCount > 30 ? 'over' : ''}`}>
                {nameCount}/30
              </span>
            </div>
            <div className="input-wrap">
              <span className="input-prefix">c/</span>
              <input
                name="name"
                type="text"
                className={`input ${!nameValid && name ? 'input-error' : ''}`}
                placeholder="my_community"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={30}
                autoComplete="off"
                autoFocus
                required
              />
            </div>
            <p className="field-hint">
              Letters, numbers, and underscores only. Cannot be changed later.
            </p>
            {!nameValid && name && (
              <p className="inline-error">No spaces or special characters allowed.</p>
            )}
          </div>

          {/* Description */}
          <div className="field">
            <div className="field-top">
              <label className="field-label">Description <span className="optional">optional</span></label>
              <span className={`char-count ${descCount > 300 ? 'over' : ''}`}>
                {descCount}/300
              </span>
            </div>
            <textarea
              name="description"
              className="textarea"
              placeholder="What is this community about?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={300}
              rows={4}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="error-box" role="alert">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
                <line x1="7" y1="4" x2="7" y2="7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                <circle cx="7" cy="10" r="0.7" fill="currentColor" />
              </svg>
              {error}
            </div>
          )}

          {/* Preview */}
          {name && nameValid && (
            <div className="preview-box">
              <span className="preview-label">Preview</span>
              <span className="preview-name">c/{name}</span>
            </div>
          )}

          {/* Actions */}
          <div className="form-actions">
            <Link href="/communities" className="cancel-btn">
              Cancel
            </Link>
            <button
              type="submit"
              className="submit-btn"
              disabled={isPending || !name || !nameValid || nameCount > 30}
            >
              {isPending ? (
                <span className="btn-inner">
                  <span className="spinner" />
                  Creating...
                </span>
              ) : (
                <span className="btn-inner">
                  Create community
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M3 7.5h9M8 3.5l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              )}
            </button>
          </div>

        </form>
      </div>

      <style>{`
        .create-root {
          max-width: 560px;
          margin: 0 auto;
          padding: 40px 24px;
          font-family: 'Syne', sans-serif;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--mv-muted);
          text-decoration: none;
          margin-bottom: 24px;
          transition: color 0.15s;
          font-weight: 500;
        }
        .back-link:hover { color: var(--mv-text); }

        /* Card */
        .create-card {
          background: var(--mv-surface);
          border: 0.5px solid var(--mv-border);
          border-radius: 16px;
          padding: 32px;
          animation: fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 24px;
        }
        .header-icon {
          width: 44px;
          height: 44px;
          background: var(--mv-surface-2);
          border: 0.5px solid var(--mv-border);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .card-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--mv-text);
          margin: 0 0 4px;
          letter-spacing: -0.02em;
        }
        .card-sub {
          font-size: 13px;
          color: var(--mv-muted);
          margin: 0;
          font-weight: 400;
        }

        .divider {
          height: 0.5px;
          background: var(--mv-border);
          margin-bottom: 28px;
        }

        /* Form */
        .form {
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .field-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .field-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--mv-muted);
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }
        .optional {
          font-size: 11px;
          color: var(--mv-dim);
          text-transform: none;
          letter-spacing: 0;
          font-weight: 400;
          margin-left: 6px;
        }
        .char-count {
          font-size: 11px;
          color: var(--mv-dim);
        }
        .char-count.over {
          color: #f07090;
        }

        .input-wrap {
          display: flex;
          align-items: center;
          background: var(--mv-surface-2);
          border: 0.5px solid var(--mv-border);
          border-radius: 10px;
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .input-wrap:focus-within {
          border-color: var(--mv-primary);
        }
        .input-prefix {
          padding: 0 12px 0 14px;
          font-size: 14px;
          font-weight: 600;
          color: var(--mv-accent);
          border-right: 0.5px solid var(--mv-border);
          height: 44px;
          display: flex;
          align-items: center;
          background: var(--mv-surface);
          flex-shrink: 0;
        }
        .input {
          flex: 1;
          height: 44px;
          background: transparent;
          border: none;
          outline: none;
          padding: 0 14px;
          font-size: 14px;
          color: var(--mv-text);
          font-family: 'Syne', sans-serif;
        }
        .input::placeholder { color: var(--mv-dim); }
        .input.input-error { color: #f07090; }

        .textarea {
          width: 100%;
          background: var(--mv-surface-2);
          border: 0.5px solid var(--mv-border);
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 14px;
          color: var(--mv-text);
          font-family: 'Syne', sans-serif;
          outline: none;
          resize: vertical;
          min-height: 100px;
          transition: border-color 0.2s;
          box-sizing: border-box;
          line-height: 1.6;
        }
        .textarea::placeholder { color: var(--mv-dim); }
        .textarea:focus { border-color: var(--mv-primary); }

        .field-hint {
          font-size: 12px;
          color: var(--mv-dim);
          margin: 0;
          font-weight: 400;
        }
        .inline-error {
          font-size: 12px;
          color: #f07090;
          margin: 0;
        }

        /* Preview */
        .preview-box {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: rgba(124, 111, 224, 0.06);
          border: 0.5px solid rgba(124, 111, 224, 0.2);
          border-radius: 10px;
          animation: fade-up 0.2s ease both;
        }
        .preview-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--mv-dim);
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }
        .preview-name {
          font-size: 14px;
          font-weight: 700;
          color: var(--mv-accent);
        }

        /* Error */
        .error-box {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 11px 14px;
          background: rgba(240, 80, 80, 0.08);
          border: 0.5px solid rgba(240, 80, 80, 0.25);
          border-radius: 8px;
          font-size: 13px;
          color: #f07090;
        }

        /* Actions */
        .form-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          padding-top: 4px;
        }
        .cancel-btn {
          height: 42px;
          padding: 0 18px;
          background: transparent;
          border: 0.5px solid var(--mv-border);
          border-radius: 10px;
          color: var(--mv-muted);
          font-size: 13px;
          font-weight: 500;
          font-family: 'Syne', sans-serif;
          text-decoration: none;
          display: flex;
          align-items: center;
          transition: border-color 0.15s, color 0.15s;
        }
        .cancel-btn:hover {
          border-color: var(--mv-primary);
          color: var(--mv-text);
        }
        .submit-btn {
          height: 42px;
          padding: 0 20px;
          background: var(--mv-primary);
          border: none;
          border-radius: 10px;
          color: var(--mv-text);
          font-size: 13px;
          font-weight: 600;
          font-family: 'Syne', sans-serif;
          cursor: pointer;
          transition: opacity 0.15s, transform 0.1s;
          letter-spacing: 0.02em;
        }
        .submit-btn:hover:not(:disabled) { opacity: 0.88; }
        .submit-btn:active:not(:disabled) { transform: scale(0.97); }
        .submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .btn-inner {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .spinner {
          width: 13px;
          height: 13px;
          border: 2px solid rgba(232,234,255,0.3);
          border-top-color: var(--mv-text);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 480px) {
          .create-card { padding: 24px 20px; }
          .form-actions { flex-direction: column-reverse; }
          .cancel-btn, .submit-btn { width: 100%; justify-content: center; }
        }
      `}</style>
    </div>
  )
}