'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/actions/logoutAction'
import {
  Home,
  Compass,
  Bell,
  User,
  PenSquare,
  Users,
  TrendingUp,
  LogOut,
  Bookmark,
} from 'lucide-react'

const navItems = [
  {
    group: 'Main',
    links: [
      { href: '/feed',          label: 'Home',          icon: Home },
      { href: '/communities',   label: 'Communities',   icon: Compass },
      { href: '/notifications', label: 'Notifications', icon: Bell },
    ],
  },
  {
    group: 'You',
    links: [
      { href: '/profile',  label: 'Profile',    icon: User },
      { href: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
    ],
  },
  {
    group: 'Discover',
    links: [
      { href: '/communities?sort=top', label: 'Trending',   icon: TrendingUp },
      { href: '/communities?sort=new', label: 'New Communities', icon: Users },
    ],
  },
]

export default function Sidebar({ userId }) {
  const pathname = usePathname()

  const isActive = (href) => {
    const base = href.split('?')[0]
    return pathname === base || (base !== '/feed' && pathname.startsWith(base))
  }

  return (
    <aside style={{
      width: '220px',
      flexShrink: 0,
      position: 'sticky',
      top: '56px',            // height of Navbar
      height: 'calc(100vh - 56px)',
      overflowY: 'auto',
      borderRight: '0.5px solid var(--mv-border)',
      backgroundColor: 'var(--mv-bg)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '16px 12px',
      scrollbarWidth: 'none',
    }}>

      {/* Top nav groups */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Create Post CTA */}
        <Link href="/c/general/submit" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '9px 16px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, var(--mv-primary) 0%, var(--mv-pink) 100%)',
          color: '#fff',
          fontFamily: 'Syne, sans-serif',
          fontWeight: 600,
          fontSize: '13px',
          textDecoration: 'none',
          letterSpacing: '0.01em',
          transition: 'opacity 0.15s ease',
          boxShadow: '0 2px 12px rgba(124,111,224,0.25)',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <PenSquare size={14} strokeWidth={2.5} />
          Create Post
        </Link>

        {/* Nav groups */}
        {navItems.map(({ group, links }) => (
          <div key={group}>
            <p style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--mv-dim)',
              padding: '0 10px',
              marginBottom: '4px',
            }}>
              {group}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {links.map(({ href, label, icon: Icon }) => {
                const active = isActive(href)
                return (
                  <Link key={href} href={href} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    borderRadius: '9px',
                    textDecoration: 'none',
                    fontFamily: 'Syne, sans-serif',
                    fontSize: '13.5px',
                    fontWeight: active ? 600 : 500,
                    color: active ? 'var(--mv-text)' : 'var(--mv-muted)',
                    backgroundColor: active ? 'var(--mv-surface-2)' : 'transparent',
                    borderLeft: active ? '2px solid var(--mv-primary)' : '2px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'var(--mv-surface)'
                      e.currentTarget.style.color = 'var(--mv-text)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = 'var(--mv-muted)'
                    }
                  }}
                  >
                    <Icon
                      size={15}
                      strokeWidth={active ? 2.5 : 2}
                      style={{ color: active ? 'var(--mv-accent)' : 'inherit', flexShrink: 0 }}
                    />
                    {label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom — logout */}
      <div style={{ paddingTop: '12px', borderTop: '0.5px solid var(--mv-border)' }}>
        <form action={logoutAction}>
          <button type="submit" style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 10px',
            borderRadius: '9px',
            fontFamily: 'Syne, sans-serif',
            fontSize: '13.5px',
            fontWeight: 500,
            color: 'var(--mv-muted)',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            textAlign: 'left',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'rgba(208,111,203,0.08)'
            e.currentTarget.style.color = 'var(--mv-pink)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = 'var(--mv-muted)'
          }}
          >
            <LogOut size={15} strokeWidth={2} style={{ flexShrink: 0 }} />
            Logout
          </button>
        </form>
      </div>

    </aside>
  )
}