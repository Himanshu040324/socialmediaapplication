'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  adminRemovePost,
  adminRestorePost,
  adminBanUser,
  adminUnbanUser,
  adminDeleteCommunity,
} from '@/actions/adminActions'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000)
  if (seconds < 60)    return `${seconds}s ago`
  if (seconds < 3600)  return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatNum(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return n
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, accent = '#7c6fe0' }) {
  return (
    <div style={{
      background: 'var(--mv-surface)', border: '1px solid var(--mv-border)',
      borderRadius: '14px', padding: '18px 20px', flex: 1, minWidth: 0,
      display: 'flex', alignItems: 'center', gap: '14px',
    }}>
      <div style={{
        width: '42px', height: '42px', borderRadius: '11px', flexShrink: 0,
        background: accent + '18', border: `1px solid ${accent}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
      }}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: '22px', fontWeight: 700, color: 'var(--mv-text)', fontFamily: 'Syne, sans-serif', lineHeight: 1, margin: 0 }}>
          {formatNum(value)}
        </p>
        <p style={{ fontSize: '12px', color: 'var(--mv-muted)', margin: '4px 0 0' }}>{label}</p>
        {sub && <p style={{ fontSize: '11px', color: accent, margin: '2px 0 0', fontWeight: 600 }}>{sub}</p>}
      </div>
    </div>
  )
}

// ─── Signups bar chart ────────────────────────────────────────────────────────
function SignupsChart({ data }) {
  const max = Math.max(...data.map(d => d.count), 1)
  return (
    <div style={{
      background: 'var(--mv-surface)', border: '1px solid var(--mv-border)',
      borderRadius: '14px', padding: '18px 20px',
    }}>
      <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--mv-text)', fontFamily: 'Syne, sans-serif', marginBottom: '16px' }}>
        📈 Signups — last 7 days
      </p>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '80px' }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', height: '100%', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: '10px', color: 'var(--mv-dim)', fontWeight: 600 }}>{d.count || ''}</span>
            <div style={{
              width: '100%', borderRadius: '5px 5px 0 0',
              height: `${Math.max(6, (d.count / max) * 60)}px`,
              background: 'linear-gradient(180deg, var(--mv-primary), var(--mv-pink))',
              transition: 'height 0.4s ease',
              opacity: d.count === 0 ? 0.2 : 1,
            }} />
            <span style={{ fontSize: '10px', color: 'var(--mv-dim)' }}>{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Action button ────────────────────────────────────────────────────────────
function ActionBtn({ onClick, disabled, color = '#f87171', children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        padding: '4px 10px', borderRadius: '7px', fontSize: '11px', fontWeight: 600,
        fontFamily: 'Syne, sans-serif', cursor: disabled ? 'not-allowed' : 'pointer',
        border: `1px solid ${color}40`, background: `${color}12`,
        color: color, transition: 'all 0.15s', opacity: disabled ? 0.5 : 1,
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = `${color}22` }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = `${color}12` }}
    >
      {children}
    </button>
  )
}

// ─── Table wrapper ────────────────────────────────────────────────────────────
function Table({ children }) {
  return (
    <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--mv-border)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Syne, sans-serif' }}>
        {children}
      </table>
    </div>
  )
}

function Th({ children, right }) {
  return (
    <th style={{
      padding: '10px 14px', textAlign: right ? 'right' : 'left',
      fontSize: '10px', fontWeight: 700, color: 'var(--mv-dim)',
      textTransform: 'uppercase', letterSpacing: '0.08em',
      background: 'var(--mv-surface-2)', borderBottom: '1px solid var(--mv-border)',
      whiteSpace: 'nowrap',
    }}>{children}</th>
  )
}

function Td({ children, right, muted }) {
  return (
    <td style={{
      padding: '10px 14px', textAlign: right ? 'right' : 'left',
      fontSize: '12px', color: muted ? 'var(--mv-dim)' : 'var(--mv-text)',
      borderBottom: '1px solid var(--mv-border)', verticalAlign: 'middle',
    }}>{children}</td>
  )
}

// ─── Users tab ────────────────────────────────────────────────────────────────
function UsersTab({ users: initialUsers, currentUserId }) {
  const [users, setUsers]        = useState(initialUsers)
  const [search, setSearch]      = useState('')
  const [isPending, startTransition] = useTransition()
  const [loadingId, setLoadingId] = useState(null)

  const filtered = users.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase())
  )

  function toggleBan(user) {
    setLoadingId(user.id)
    startTransition(async () => {
      const result = user.is_banned
        ? await adminUnbanUser(user.id)
        : await adminBanUser(user.id)

      if (!result.error) {
        setUsers(prev => prev.map(u =>
          u.id === user.id ? { ...u, is_banned: !u.is_banned } : u
        ))
      }
      setLoadingId(null)
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search users…"
        style={{
          background: 'var(--mv-surface-2)', border: '1px solid var(--mv-border)',
          borderRadius: '10px', padding: '8px 14px', fontSize: '13px',
          color: 'var(--mv-text)', outline: 'none', fontFamily: 'Syne, sans-serif',
          width: '280px',
        }}
      />
      <Table>
        <thead>
          <tr>
            <Th>User</Th>
            <Th>Joined</Th>
            <Th right>Posts</Th>
            <Th right>Status</Th>
            <Th right>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(user => (
            <tr key={user.id} style={{ background: user.is_banned ? 'rgba(248,113,113,0.04)' : 'var(--mv-surface)' }}>
              <Td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, var(--mv-primary), var(--mv-pink))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: 700, color: '#fff',
                  }}>
                    {user.username?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--mv-text)', fontSize: '12px' }}>
                      u/{user.username}
                    </p>
                    {user.is_admin && (
                      <span style={{ fontSize: '10px', color: 'var(--mv-primary)', fontWeight: 600 }}>Admin</span>
                    )}
                  </div>
                </div>
              </Td>
              <Td muted>{formatDate(user.created_at)}</Td>
              <Td right>{user.postCount ?? 0}</Td>
              <Td right>
                <span style={{
                  fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px',
                  background: user.is_banned ? 'rgba(248,113,113,0.12)' : 'rgba(74,222,128,0.1)',
                  color: user.is_banned ? '#f87171' : '#4ade80',
                  border: `1px solid ${user.is_banned ? '#f8717140' : '#4ade8040'}`,
                }}>
                  {user.is_banned ? 'Banned' : 'Active'}
                </span>
              </Td>
              <Td right>
                {user.id !== currentUserId && !user.is_admin && (
                  <ActionBtn
                    onClick={() => toggleBan(user)}
                    disabled={isPending && loadingId === user.id}
                    color={user.is_banned ? '#4ade80' : '#f87171'}
                  >
                    {loadingId === user.id ? '…' : user.is_banned ? 'Unban' : 'Ban'}
                  </ActionBtn>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
      {filtered.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--mv-dim)', fontSize: '13px', padding: '20px' }}>No users found</p>
      )}
    </div>
  )
}

// ─── Communities tab ──────────────────────────────────────────────────────────
function CommunitiesTab({ communities: initialCommunities }) {
  const [communities, setCommunities] = useState(initialCommunities)
  const [isPending, startTransition]  = useTransition()
  const [loadingId, setLoadingId]     = useState(null)
  const [confirmId, setConfirmId]     = useState(null)

  function handleDelete(id) {
    if (confirmId !== id) { setConfirmId(id); return }
    setLoadingId(id)
    startTransition(async () => {
      const result = await adminDeleteCommunity(id)
      if (!result.error) setCommunities(prev => prev.filter(c => c.id !== id))
      setLoadingId(null)
      setConfirmId(null)
    })
  }

  return (
    <Table>
      <thead>
        <tr>
          <Th>Community</Th>
          <Th>Creator</Th>
          <Th>Created</Th>
          <Th right>Members</Th>
          <Th right>Posts</Th>
          <Th right>Actions</Th>
        </tr>
      </thead>
      <tbody>
        {communities.map(c => (
          <tr key={c.id} style={{ background: 'var(--mv-surface)' }}>
            <Td>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                  background: 'var(--mv-primary)18', border: '1px solid var(--mv-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 700, color: 'var(--mv-primary)', overflow: 'hidden',
                }}>
                  {c.avatar_url
                    ? <img src={c.avatar_url} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : c.name[0].toUpperCase()
                  }
                </div>
                <Link href={`/c/${c.name}`} style={{ fontWeight: 600, color: 'var(--mv-accent)', fontSize: '12px', textDecoration: 'none' }}>
                  c/{c.name}
                </Link>
              </div>
            </Td>
            <Td muted>u/{c.profiles?.username ?? 'deleted'}</Td>
            <Td muted>{formatDate(c.created_at)}</Td>
            <Td right>{c.memberCount ?? 0}</Td>
            <Td right>{c.postCount ?? 0}</Td>
            <Td right>
              <ActionBtn
                onClick={() => handleDelete(c.id)}
                disabled={isPending && loadingId === c.id}
                color="#f87171"
              >
                {loadingId === c.id ? '…' : confirmId === c.id ? 'Confirm?' : 'Delete'}
              </ActionBtn>
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

// ─── Posts tab ────────────────────────────────────────────────────────────────
function PostsTab({ posts: initialPosts }) {
  const [posts, setPosts]            = useState(initialPosts)
  const [search, setSearch]          = useState('')
  const [isPending, startTransition] = useTransition()
  const [loadingId, setLoadingId]    = useState(null)

  const filtered = posts.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.author?.toLowerCase().includes(search.toLowerCase())
  )

  function toggleRemove(post) {
    setLoadingId(post.id)
    startTransition(async () => {
      const result = post.is_removed
        ? await adminRestorePost(post.id)
        : await adminRemovePost(post.id)

      if (!result.error) {
        setPosts(prev => prev.map(p =>
          p.id === post.id ? { ...p, is_removed: !p.is_removed } : p
        ))
      }
      setLoadingId(null)
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search posts or authors…"
        style={{
          background: 'var(--mv-surface-2)', border: '1px solid var(--mv-border)',
          borderRadius: '10px', padding: '8px 14px', fontSize: '13px',
          color: 'var(--mv-text)', outline: 'none', fontFamily: 'Syne, sans-serif',
          width: '280px',
        }}
      />
      <Table>
        <thead>
          <tr>
            <Th>Title</Th>
            <Th>Author</Th>
            <Th>Community</Th>
            <Th>Posted</Th>
            <Th right>Score</Th>
            <Th right>Status</Th>
            <Th right>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(post => (
            <tr key={post.id} style={{ background: post.is_removed ? 'rgba(248,113,113,0.04)' : 'var(--mv-surface)' }}>
              <Td>
                <Link
                  href={`/post/${post.id}`}
                  style={{ color: 'var(--mv-text)', fontWeight: 600, fontSize: '12px', textDecoration: 'none', maxWidth: '220px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {post.title}
                </Link>
              </Td>
              <Td muted>u/{post.author}</Td>
              <Td muted>c/{post.community}</Td>
              <Td muted>{timeAgo(post.created_at)}</Td>
              <Td right>{post.score}</Td>
              <Td right>
                <span style={{
                  fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px',
                  background: post.is_removed ? 'rgba(248,113,113,0.12)' : 'rgba(74,222,128,0.1)',
                  color: post.is_removed ? '#f87171' : '#4ade80',
                  border: `1px solid ${post.is_removed ? '#f8717140' : '#4ade8040'}`,
                }}>
                  {post.is_removed ? 'Removed' : 'Live'}
                </span>
              </Td>
              <Td right>
                <ActionBtn
                  onClick={() => toggleRemove(post)}
                  disabled={isPending && loadingId === post.id}
                  color={post.is_removed ? '#4ade80' : '#f87171'}
                >
                  {loadingId === post.id ? '…' : post.is_removed ? 'Restore' : 'Remove'}
                </ActionBtn>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
      {filtered.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--mv-dim)', fontSize: '13px', padding: '20px' }}>No posts found</p>
      )}
    </div>
  )
}

// ─── Main AdminDashboard ──────────────────────────────────────────────────────
const TABS = ['Overview', 'Users', 'Communities', 'Posts']

export default function AdminDashboard({
  stats,
  users,
  communities,
  posts,
  signupsChart,
  currentUserId,
}) {
  const [activeTab, setActiveTab] = useState('Overview')

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px', fontFamily: 'Syne, sans-serif' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '9px', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--mv-primary), var(--mv-pink))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
          }}>⚙️</div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--mv-text)', letterSpacing: '-0.02em', margin: 0 }}>
            Admin Dashboard
          </h1>
          <span style={{
            fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px',
            background: 'rgba(124,111,224,0.12)', color: 'var(--mv-primary)',
            border: '1px solid rgba(124,111,224,0.3)', letterSpacing: '0.06em',
          }}>
            ADMIN
          </span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--mv-muted)', margin: 0 }}>
          Platform management — all actions are permanent and logged.
        </p>
      </div>

      {/* ── Tabs ── */}
      <div style={{
        display: 'flex', gap: '2px', marginBottom: '24px',
        borderBottom: '1px solid var(--mv-border)', paddingBottom: '0',
      }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px', fontSize: '13px', fontWeight: 600,
              fontFamily: 'Syne, sans-serif', cursor: 'pointer',
              background: 'transparent', border: 'none',
              borderBottom: `2px solid ${activeTab === tab ? 'var(--mv-primary)' : 'transparent'}`,
              color: activeTab === tab ? 'var(--mv-text)' : 'var(--mv-dim)',
              marginBottom: '-1px', transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { if (activeTab !== tab) e.currentTarget.style.color = 'var(--mv-muted)' }}
            onMouseLeave={e => { if (activeTab !== tab) e.currentTarget.style.color = 'var(--mv-dim)' }}
          >
            {tab}
            {tab === 'Users'       && <span style={{ marginLeft: '6px', fontSize: '10px', color: 'var(--mv-dim)' }}>{stats.totalUsers}</span>}
            {tab === 'Communities' && <span style={{ marginLeft: '6px', fontSize: '10px', color: 'var(--mv-dim)' }}>{stats.totalCommunities}</span>}
            {tab === 'Posts'       && <span style={{ marginLeft: '6px', fontSize: '10px', color: 'var(--mv-dim)' }}>{stats.totalPosts}</span>}
          </button>
        ))}
      </div>

      {/* ── Overview tab ── */}
      {activeTab === 'Overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Stat cards */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <StatCard icon="📝" label="Total Posts"        value={stats.totalPosts}       accent="#7c6fe0" />
            <StatCard icon="👥" label="Total Users"        value={stats.totalUsers}       accent="#d06fcb" />
            <StatCard icon="🏘️" label="Communities"        value={stats.totalCommunities} accent="#4a9eff" />
            <StatCard icon="⚡" label="Posts Today"        value={stats.postsToday}       accent="#4ade80" />
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <StatCard icon="🚫" label="Removed Posts"  value={stats.removedPosts}  accent="#f87171" />
            <StatCard icon="🔨" label="Banned Users"   value={stats.bannedUsers}   accent="#fb923c" />
            <StatCard icon="💬" label="Total Comments" value={stats.totalComments} accent="#2dd4bf" />
            <StatCard icon="🗳️" label="Total Votes"    value={stats.totalVotes}    accent="#facc15" />
          </div>

          {/* Signups chart */}
          <SignupsChart data={signupsChart} />
        </div>
      )}

      {/* ── Users tab ── */}
      {activeTab === 'Users' && (
        <UsersTab users={users} currentUserId={currentUserId} />
      )}

      {/* ── Communities tab ── */}
      {activeTab === 'Communities' && (
        <CommunitiesTab communities={communities} />
      )}

      {/* ── Posts tab ── */}
      {activeTab === 'Posts' && (
        <PostsTab posts={posts} />
      )}

    </div>
  )
}