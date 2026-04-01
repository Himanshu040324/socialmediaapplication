import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  return (
    <div>

      {/* Admin badge — only shows if role is admin */}
      {isAdmin && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'var(--mv-surface)',
          border: '0.5px solid var(--mv-primary)',
          borderRadius: '20px',
          padding: '4px 12px',
          fontFamily: 'Syne, sans-serif',
          fontSize: '12px',
          color: 'var(--mv-accent)',
        }}>
          ⚡ Admin
        </div>
      )}

      {/* rest of your feed will go here */}

    </div>
  )
}