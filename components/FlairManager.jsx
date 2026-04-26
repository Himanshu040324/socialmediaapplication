'use client'

import { useState, useTransition } from 'react'
import FlairBadge   from '@/components/FlairBadge'
import { createFlair, updateFlair, deleteFlair } from '@/actions/flairActions'

// ─── Preset color swatches matching the MV design system ─────────────────────
const PRESET_COLORS = [
  { hex: '#7c6fe0', label: 'Purple'  },
  { hex: '#d06fcb', label: 'Pink'    },
  { hex: '#4a9eff', label: 'Blue'    },
  { hex: '#4ade80', label: 'Green'   },
  { hex: '#fb923c', label: 'Orange'  },
  { hex: '#f87171', label: 'Red'     },
  { hex: '#facc15', label: 'Yellow'  },
  { hex: '#2dd4bf', label: 'Teal'    },
  { hex: '#e879f9', label: 'Fuchsia' },
  { hex: '#8a8bad', label: 'Gray'    },
]

function ColorSwatches({ selected, onSelect }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
      {PRESET_COLORS.map(({ hex, label }) => (
        <button
          key={hex}
          type="button"
          title={label}
          onClick={() => onSelect(hex)}
          style={{
            width:       '20px',
            height:      '20px',
            borderRadius: '50%',
            backgroundColor: hex,
            border:      selected === hex ? `2px solid white` : '2px solid transparent',
            outline:     selected === hex ? `2px solid ${hex}` : 'none',
            cursor:      'pointer',
            transition:  'transform 0.1s ease',
            flexShrink:  0,
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.15)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
        />
      ))}
    </div>
  )
}

// ─── Inline edit row for an existing flair ────────────────────────────────────
function FlairRow({ flair, communityId, onUpdated, onDeleted }) {
  const [editing,   setEditing]   = useState(false)
  const [name,      setName]      = useState(flair.name)
  const [color,     setColor]     = useState(flair.color)
  const [error,     setError]     = useState('')
  const [isPending, startTransition] = useTransition()

  function handleCancel() {
    setName(flair.name)
    setColor(flair.color)
    setError('')
    setEditing(false)
  }

  function handleSave() {
    if (!name.trim()) { setError('Name is required'); return }
    setError('')
    startTransition(async () => {
      const result = await updateFlair(flair.id, communityId, name, color)
      if (result.error) { setError(result.error); return }
      onUpdated(result.flair)
      setEditing(false)
    })
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteFlair(flair.id, communityId)
      if (result.error) { setError(result.error); return }
      onDeleted(flair.id)
    })
  }

  if (!editing) {
    return (
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        padding:        '8px 10px',
        borderRadius:   '10px',
        background:     'var(--mv-surface-2)',
        border:         '1px solid var(--mv-border)',
      }}>
        <FlairBadge name={flair.name} color={flair.color} />
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            type="button"
            onClick={() => setEditing(true)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '26px', height: '26px', borderRadius: '7px',
              border: '1px solid var(--mv-border)', background: 'transparent',
              color: 'var(--mv-dim)', cursor: 'pointer',
            }}
            title="Edit"
          >
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
              <path d="M10 2l2 2-7 7H3v-2l7-7z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '26px', height: '26px', borderRadius: '7px',
              border: '1px solid var(--mv-border)', background: 'transparent',
              color: 'var(--mv-dim)', cursor: 'pointer',
              opacity: isPending ? 0.5 : 1,
            }}
            title="Delete"
          >
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
              <path d="M2 4h10M5 4V2h4v2M6 7v4M8 7v4M3 4l1 8h6l1-8"
                stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    )
  }

  // Edit state
  return (
    <div style={{
      padding:      '10px 12px',
      borderRadius: '10px',
      background:   'var(--mv-surface-2)',
      border:       '1px solid var(--mv-primary)',
      display:      'flex',
      flexDirection: 'column',
      gap:          '8px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Live preview */}
        <FlairBadge name={name || 'Preview'} color={color} />
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={32}
          placeholder="Flair name"
          autoFocus
          style={{
            flex: 1, background: 'var(--mv-surface)', border: '1px solid var(--mv-border)',
            borderRadius: '8px', padding: '4px 10px', fontSize: '12px',
            color: 'var(--mv-text)', outline: 'none', fontFamily: 'Syne, sans-serif',
          }}
        />
      </div>
      <ColorSwatches selected={color} onSelect={setColor} />
      {error && <p style={{ fontSize: '11px', color: '#f87171' }}>{error}</p>}
      <div style={{ display: 'flex', gap: '6px' }}>
        <button type="button" onClick={handleSave} disabled={isPending}
          style={{
            flex: 1, height: '28px', borderRadius: '8px', fontSize: '11px',
            fontWeight: 600, fontFamily: 'Syne, sans-serif', cursor: 'pointer',
            background: 'var(--mv-primary)', color: '#fff', border: 'none',
            opacity: isPending ? 0.5 : 1,
          }}>
          {isPending ? '…' : 'Save'}
        </button>
        <button type="button" onClick={handleCancel}
          style={{
            flex: 1, height: '28px', borderRadius: '8px', fontSize: '11px',
            fontWeight: 500, fontFamily: 'Syne, sans-serif', cursor: 'pointer',
            background: 'transparent', color: 'var(--mv-dim)',
            border: '1px solid var(--mv-border)',
          }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

// ─── Main FlairManager ────────────────────────────────────────────────────────
export default function FlairManager({ communityId, initialFlairs }) {
  const [open,    setOpen]    = useState(false)
  const [flairs,  setFlairs]  = useState(initialFlairs)
  const [newName, setNewName] = useState('')
  const [newColor,setNewColor]= useState(PRESET_COLORS[0].hex)
  const [addError,setAddError]= useState('')
  const [isPending, startTransition] = useTransition()

  function handleUpdated(updated) {
    setFlairs(prev => prev.map(f => f.id === updated.id ? { ...f, ...updated } : f))
  }

  function handleDeleted(id) {
    setFlairs(prev => prev.filter(f => f.id !== id))
  }

  function handleAdd() {
    if (!newName.trim()) { setAddError('Name is required'); return }
    setAddError('')
    startTransition(async () => {
      const result = await createFlair(communityId, newName, newColor)
      if (result.error) { setAddError(result.error); return }
      setFlairs(prev => [...prev, result.flair])
      setNewName('')
      setNewColor(PRESET_COLORS[0].hex)
    })
  }

  return (
    <div style={{ marginTop: '16px' }}>
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '6px 12px', borderRadius: '9px',
          border: '1px solid var(--mv-border)', background: 'transparent',
          color: 'var(--mv-dim)', cursor: 'pointer', fontFamily: 'Syne, sans-serif',
          fontSize: '12px', fontWeight: 600, transition: 'all 0.15s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'var(--mv-primary)'
          e.currentTarget.style.color = 'var(--mv-primary)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--mv-border)'
          e.currentTarget.style.color = 'var(--mv-dim)'
        }}
      >
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
          <path d="M2 4h1.5L5 2h4l1.5 2H12a1 1 0 011 1v7a1 1 0 01-1 1H2a1 1 0 01-1-1V5a1 1 0 011-1z"
            stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
          <circle cx="7" cy="8" r="2" stroke="currentColor" strokeWidth="1.2"/>
        </svg>
        Manage Flairs ({flairs.length})
        <svg
          width="10" height="10" viewBox="0 0 10 10" fill="none"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
        >
          <path d="M2 3l3 4 3-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Panel */}
      {open && (
        <div style={{
          marginTop: '10px',
          padding: '14px',
          background: 'var(--mv-surface)',
          border: '1px solid var(--mv-border)',
          borderRadius: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <p style={{
            fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: 'var(--mv-dim)',
            fontFamily: 'Syne, sans-serif', marginBottom: '2px',
          }}>
            Community Flairs
          </p>

          {/* Existing flairs */}
          {flairs.length === 0 && (
            <p style={{ fontSize: '12px', color: 'var(--mv-dim)', fontFamily: 'Syne, sans-serif' }}>
              No flairs yet. Add one below.
            </p>
          )}
          {flairs.map(flair => (
            <FlairRow
              key={flair.id}
              flair={flair}
              communityId={communityId}
              onUpdated={handleUpdated}
              onDeleted={handleDeleted}
            />
          ))}

          {/* Divider */}
          <div style={{ height: '1px', background: 'var(--mv-border)', margin: '4px 0' }} />

          {/* Add new flair */}
          <p style={{
            fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: 'var(--mv-dim)',
            fontFamily: 'Syne, sans-serif', marginBottom: '2px',
          }}>
            Add Flair
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FlairBadge name={newName || 'Preview'} color={newColor} />
            <input
              type="text"
              value={newName}
              onChange={e => { setNewName(e.target.value); setAddError('') }}
              maxLength={32}
              placeholder="Flair name…"
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              style={{
                flex: 1, background: 'var(--mv-surface-2)', border: '1px solid var(--mv-border)',
                borderRadius: '8px', padding: '5px 10px', fontSize: '12px',
                color: 'var(--mv-text)', outline: 'none', fontFamily: 'Syne, sans-serif',
              }}
            />
          </div>

          <ColorSwatches selected={newColor} onSelect={setNewColor} />

          {addError && <p style={{ fontSize: '11px', color: '#f87171' }}>{addError}</p>}

          <button
            type="button"
            onClick={handleAdd}
            disabled={isPending || !newName.trim()}
            style={{
              height: '32px', borderRadius: '9px', fontSize: '12px',
              fontWeight: 600, fontFamily: 'Syne, sans-serif', cursor: 'pointer',
              background: 'var(--mv-primary)', color: '#fff', border: 'none',
              opacity: (isPending || !newName.trim()) ? 0.45 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            {isPending ? 'Adding…' : '+ Add Flair'}
          </button>
        </div>
      )}
    </div>
  )
}