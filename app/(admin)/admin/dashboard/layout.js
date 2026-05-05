import { createClient } from '@/utils/supabase/server'
import { redirect }      from 'next/navigation'

export default async function AdminLayout({ children }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // ✅ Fixed: use 'role' column, not 'is_admin'
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/feed')

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--mv-bg)',
    }}>
      {/* Admin top bar */}
      <div style={{
        height: '44px',
        background: 'var(--mv-surface)',
        borderBottom: '1px solid var(--mv-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--mv-text)', fontFamily: 'Syne, sans-serif' }}>
            SMA
          </span>
          <span style={{ color: 'var(--mv-border)' }}>›</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--mv-primary)', fontFamily: 'Syne, sans-serif' }}>
            Admin
          </span>
        </div>
        <a
          href="/feed"
          style={{
            fontSize: '12px', fontWeight: 500, color: 'var(--mv-dim)',
            textDecoration: 'none', fontFamily: 'Syne, sans-serif',
            display: 'flex', alignItems: 'center', gap: '5px',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to app
        </a>
      </div>

      {children}
    </div>
  )
}