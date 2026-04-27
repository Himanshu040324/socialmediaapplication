'use client'

import Link from 'next/link'
import FlairBadge from '@/components/FlairBadge'

function timeAgo(dateStr) {
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000)
  if (seconds < 60)    return `${seconds}s ago`
  if (seconds < 3600)  return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

function formatNum(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return n
}

// ─── Rank medal colors ────────────────────────────────────────────────────────
function rankStyle(rank) {
  if (rank === 1) return { color: '#facc15', label: '🥇' }
  if (rank === 2) return { color: '#94a3b8', label: '🥈' }
  if (rank === 3) return { color: '#fb923c', label: '🥉' }
  return { color: 'var(--mv-dim)', label: `#${rank}` }
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ icon, title, subtitle }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
        <span style={{ fontSize: '16px' }}>{icon}</span>
        <h2 style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 700,
          fontSize: '15px', color: 'var(--mv-text)', letterSpacing: '-0.01em',
        }}>{title}</h2>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--mv-muted)', paddingLeft: '24px' }}>{subtitle}</p>
    </div>
  )
}

// ─── Stat card (top summary numbers) ─────────────────────────────────────────
function StatCard({ icon, label, value, accent }) {
  return (
    <div style={{
      background:   'var(--mv-surface)',
      border:       '1px solid var(--mv-border)',
      borderRadius: '14px',
      padding:      '16px 18px',
      flex:         1,
      minWidth:     0,
      display:      'flex',
      alignItems:   'center',
      gap:          '12px',
    }}>
      <div style={{
        width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
        background: accent + '18', border: `1px solid ${accent}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '18px',
      }}>{icon}</div>
      <div>
        <p style={{ fontSize: '20px', fontWeight: 700, color: 'var(--mv-text)', fontFamily: 'Syne, sans-serif', lineHeight: 1 }}>
          {formatNum(value)}
        </p>
        <p style={{ fontSize: '11px', color: 'var(--mv-muted)', marginTop: '3px' }}>{label}</p>
      </div>
    </div>
  )
}

// ─── Community row ────────────────────────────────────────────────────────────
function CommunityRow({ community }) {
  const { color, label } = rankStyle(community.rank)
  const barWidth = Math.max(8, (community.activityScore / (community.activityScore + 20)) * 100)

  return (
    <Link href={`/c/${community.name}`} style={{ textDecoration: 'none' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '10px 14px', borderRadius: '12px',
        background: 'var(--mv-surface-2)', border: '1px solid var(--mv-border)',
        marginBottom: '6px', cursor: 'pointer', transition: 'border-color 0.15s ease',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--mv-primary)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--mv-border)'}
      >
        {/* Rank */}
        <span style={{ fontSize: '14px', minWidth: '24px', textAlign: 'center', flexShrink: 0 }}>
          {label}
        </span>

        {/* Avatar */}
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
          background: 'var(--mv-primary)18', border: '1px solid var(--mv-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
        }}>
          {community.avatar_url
            ? <img src={community.avatar_url} alt={community.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--mv-primary)' }}>{community.name[0].toUpperCase()}</span>
          }
        </div>

        {/* Name + bar */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '13px',
            color: 'var(--mv-text)', marginBottom: '5px',
          }}>
            c/{community.name}
          </p>
          {/* Activity bar */}
          <div style={{ height: '4px', background: 'var(--mv-border)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '4px',
              width: `${barWidth}%`,
              background: 'linear-gradient(90deg, var(--mv-primary), var(--mv-pink))',
              transition: 'width 0.6s ease',
            }} />
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', flexShrink: 0 }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--mv-text)' }}>
            {community.postCount} posts
          </span>
          <span style={{ fontSize: '11px', color: 'var(--mv-muted)' }}>
            {community.commentCount} comments
          </span>
        </div>
      </div>
    </Link>
  )
}

// ─── Post row ─────────────────────────────────────────────────────────────────
function PostRow({ post, rank }) {
  const { label } = rankStyle(rank)

  return (
    <Link href={`/post/${post.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '10px 14px', borderRadius: '12px',
        background: 'var(--mv-surface-2)', border: '1px solid var(--mv-border)',
        marginBottom: '6px', cursor: 'pointer', transition: 'border-color 0.15s ease',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--mv-primary)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--mv-border)'}
      >
        {/* Rank */}
        <span style={{ fontSize: '14px', minWidth: '24px', textAlign: 'center', flexShrink: 0 }}>
          {label}
        </span>

        {/* Score pill */}
        <div style={{
          minWidth: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
          background: post.score > 0 ? 'rgba(124,111,224,0.12)' : 'var(--mv-surface)',
          border: '1px solid var(--mv-border)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: post.score > 0 ? 'var(--mv-primary)' : 'var(--mv-muted)', lineHeight: 1 }}>
            {post.score}
          </span>
          <span style={{ fontSize: '9px', color: 'var(--mv-dim)', marginTop: '1px' }}>pts</span>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: 'var(--mv-muted)', fontWeight: 600 }}>c/{post.community}</span>
            <span style={{ fontSize: '10px', color: 'var(--mv-dim)' }}>·</span>
            <span style={{ fontSize: '11px', color: 'var(--mv-dim)' }}>u/{post.author}</span>
            {post.flair && <FlairBadge name={post.flair.name} color={post.flair.color} size="xs" />}
          </div>
          <p style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '13px',
            color: 'var(--mv-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {post.title}
          </p>
        </div>

        {/* Comment count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
            <path d="M1 1h11v8H7.5L5 12V9H1V1z" stroke="var(--mv-dim)" strokeWidth="1.1" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontSize: '11px', color: 'var(--mv-dim)' }}>{post.commentCount}</span>
        </div>
      </div>
    </Link>
  )
}

// ─── Karma row ────────────────────────────────────────────────────────────────
function KarmaRow({ user }) {
  const { label, color } = rankStyle(user.rank)

  return (
    <Link href={`/u/${user.username}`} style={{ textDecoration: 'none' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '10px 14px', borderRadius: '12px',
        background: 'var(--mv-surface-2)', border: '1px solid var(--mv-border)',
        marginBottom: '6px', cursor: 'pointer', transition: 'border-color 0.15s ease',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--mv-primary)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--mv-border)'}
      >
        {/* Rank */}
        <span style={{ fontSize: '14px', minWidth: '24px', textAlign: 'center', flexShrink: 0 }}>
          {label}
        </span>

        {/* Avatar placeholder */}
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--mv-primary), var(--mv-pink))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', fontWeight: 700, color: '#fff',
        }}>
          {user.username[0]?.toUpperCase()}
        </div>

        {/* Username */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '13px',
            color: 'var(--mv-text)',
          }}>
            u/{user.username}
          </p>
          <p style={{ fontSize: '11px', color: 'var(--mv-muted)', marginTop: '2px' }}>
            earned today
          </p>
        </div>

        {/* Karma */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          background: 'rgba(124,111,224,0.1)', border: '1px solid rgba(124,111,224,0.25)',
          borderRadius: '8px', padding: '4px 10px',
        }}>
          <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
            <path d="M7 2L13 9H1L7 2Z" stroke="var(--mv-primary)" strokeWidth="1.3" strokeLinejoin="round" fill="rgba(124,111,224,0.3)"/>
          </svg>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--mv-primary)', fontFamily: 'Syne, sans-serif' }}>
            +{user.karma}
          </span>
        </div>
      </div>
    </Link>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ message }) {
  return (
    <div style={{
      padding: '28px', textAlign: 'center',
      background: 'var(--mv-surface-2)', borderRadius: '12px',
      border: '1px solid var(--mv-border)',
    }}>
      <p style={{ fontSize: '12px', color: 'var(--mv-dim)' }}>{message}</p>
    </div>
  )
}

// ─── Main StatsPage ───────────────────────────────────────────────────────────
export default function StatsPage({
  activeCommunities,
  topPostsToday,
  karmaLeaderboard,
  siteStats,
  generatedAt,
}) {
  return (
    <div style={{
      maxWidth: '800px', margin: '0 auto', padding: '32px 16px',
      fontFamily: 'Syne, sans-serif',
    }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h1 style={{
              fontSize: '22px', fontWeight: 700, color: 'var(--mv-text)',
              letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: '6px',
            }}>
              📊 Stats &amp; Leaderboards
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--mv-muted)' }}>
              Live activity across the platform — updated every 5 minutes.
            </p>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            background: 'var(--mv-surface)', border: '1px solid var(--mv-border)',
            borderRadius: '8px', padding: '5px 10px',
          }}>
            <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke="var(--mv-dim)" strokeWidth="1.2"/>
              <path d="M7 4v3l2 1.5" stroke="var(--mv-dim)" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize: '11px', color: 'var(--mv-dim)' }}>
              Updated {new Date(generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {/* ── Site-wide stat cards ── */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <StatCard icon="📝" label="Total Posts"       value={siteStats.totalPosts}       accent="#7c6fe0" />
        <StatCard icon="👥" label="Total Users"       value={siteStats.totalUsers}       accent="#d06fcb" />
        <StatCard icon="🏘️" label="Communities"       value={siteStats.totalCommunities} accent="#4a9eff" />
        <StatCard icon="⚡" label="Posted Today"      value={siteStats.postsToday}       accent="#4ade80" />
      </div>

      {/* ── Three sections grid ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

        {/* 1. Most active communities */}
        <section>
          <SectionHeader
            icon="🔥"
            title="Most Active Communities"
            subtitle="Ranked by posts + comments in the last 7 days"
          />
          {activeCommunities.length === 0
            ? <EmptyState message="No community activity this week yet." />
            : activeCommunities.map(c => <CommunityRow key={c.id} community={c} />)
          }
        </section>

        {/* 2. Top posts today */}
        <section>
          <SectionHeader
            icon="⭐"
            title="Top Posts Today"
            subtitle="Highest scoring posts from the last 24 hours"
          />
          {topPostsToday.length === 0
            ? <EmptyState message="No posts in the last 24 hours yet." />
            : topPostsToday.map((p, i) => <PostRow key={p.id} post={p} rank={i + 1} />)
          }
        </section>

        {/* 3. Karma leaderboard */}
        <section>
          <SectionHeader
            icon="👑"
            title="Karma Leaderboard"
            subtitle="Most upvotes earned on posts & comments created today"
          />
          {karmaLeaderboard.length === 0
            ? <EmptyState message="No karma earned today yet — be the first to post!" />
            : karmaLeaderboard.map(u => <KarmaRow key={u.id} user={u} />)
          }
        </section>

      </div>

      {/* ── Footer note ── */}
      <p style={{
        marginTop: '40px', textAlign: 'center',
        fontSize: '11px', color: 'var(--mv-dim)',
      }}>
        Stats are computed from existing data — no tracking, no new tables.
      </p>

    </div>
  )
}