import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import JoinButton from '@/components/JoinButton'

export default async function CommunityPage({ params }) {
  const { name } = await params
  const supabase  = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch community
  const { data: community } = await supabase
    .from('communities')
    .select(`
      id,
      name,
      description,
      avatar_url,
      banner_url,
      created_at,
      created_by,
      memberships(count)
    `)
    .eq('name', name)
    .single()

  if (!community) redirect('/communities')

  // Check if user is a member
  const { data: membership } = await supabase
    .from('memberships')
    .select('id')
    .eq('user_id', user.id)
    .eq('community_id', community.id)
    .single()

  const isMember = !!membership

  // Fetch posts in this community
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      body,
      image_url,
      link_url,
      type,
      created_at,
      author_id,
      profiles!posts_author_id_fkey(username),
      votes(value)
    `)
    .eq('community_id', community.id)
    .order('created_at', { ascending: false })

  const memberCount = community.memberships?.[0]?.count ?? 0

  // Calculate vote score per post
  const postsWithScore = posts?.map(post => {
    const score = post.votes?.reduce((sum, v) => sum + v.value, 0) ?? 0
    const userVote = post.votes?.find(v => v.author_id === user.id)?.value ?? 0
    return { ...post, score, userVote }
  }) || []

  return (
    <div className="community-root">

      {/* Banner */}
      <div className="banner" style={{
        background: community.banner_url
          ? `url(${community.banner_url}) center/cover no-repeat`
          : 'linear-gradient(135deg, var(--mv-surface) 0%, #1a1a38 100%)'
      }}>
        <div className="banner-overlay" />
      </div>

      {/* Community header */}
      <div className="community-header">
        <div className="header-inner">
          <div className="avatar-wrap">
            {community.avatar_url ? (
              <img src={community.avatar_url} alt={community.name} className="avatar-img" />
            ) : (
              <span className="avatar-initial">{community.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="header-info">
            <div className="header-top">
              <div>
                <h1 className="community-title">c/{community.name}</h1>
                <p className="member-count">
                  {memberCount} {memberCount === 1 ? 'member' : 'members'}
                </p>
              </div>
              <JoinButton
                communityId={community.id}
                userId={user.id}
                initialJoined={isMember}
              />
            </div>
            {community.description && (
              <p className="community-desc">{community.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="content-wrap">

        {/* Posts feed */}
        <div className="posts-col">

          {/* Create post bar */}
          <Link href={`/c/${name}/submit`} className="create-post-bar">
            <div className="create-avatar">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="6" r="3" stroke="currentColor" strokeWidth="1.2" />
                <path d="M2 13c0-2.8 2.7-5 6-5s6 2.2 6 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="create-placeholder">Create a post</span>
            <span className="create-btn-pill">Post</span>
          </Link>

          {/* Posts */}
          {postsWithScore.length > 0 ? (
            <div className="posts-list">
              {postsWithScore.map((post, i) => (
                <Link
                  key={post.id}
                  href={`/post/${post.id}`}
                  className="post-card"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {/* Vote column */}
                  <div className="vote-col">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 3l5 6H3l5-6z" stroke="currentColor" strokeWidth="1.2" fill="none" />
                    </svg>
                    <span className="vote-score">{post.score}</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 13L3 7h10l-5 6z" stroke="currentColor" strokeWidth="1.2" fill="none" />
                    </svg>
                  </div>

                  {/* Post content */}
                  <div className="post-body">
                    <div className="post-meta">
                      <span className="post-author">u/{post.profiles?.username ?? 'deleted'}</span>
                      <span className="meta-dot">·</span>
                      <span className="post-time">{timeAgo(post.created_at)}</span>
                      {post.type !== 'text' && (
                        <span className="post-type-badge">{post.type}</span>
                      )}
                    </div>
                    <h2 className="post-title">{post.title}</h2>
                    {post.type === 'text' && post.body && (
                      <p className="post-preview">{post.body}</p>
                    )}
                    {post.type === 'link' && post.link_url && (
                      <p className="post-link">{post.link_url}</p>
                    )}
                    {post.type === 'image' && post.image_url && (
                      <img src={post.image_url} alt={post.title} className="post-image" />
                    )}
                    <div className="post-footer">
                      <span className="post-stat">
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                          <path d="M1 1h11v8H7.5L5 12V9H1V1z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
                        </svg>
                        Comments
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-posts">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <rect x="4" y="4" width="28" height="28" rx="6" stroke="var(--mv-border)" strokeWidth="1.2" />
                <path d="M10 14h16M10 19h10" stroke="var(--mv-dim)" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <p className="empty-title">No posts yet</p>
              <p className="empty-sub">Be the first to post in c/{name}</p>
              <Link href={`/c/${name}/submit`} className="empty-cta">Create a post</Link>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-card">
            <h3 className="sidebar-title">About c/{community.name}</h3>
            <p className="sidebar-desc">
              {community.description || 'No description yet.'}
            </p>
            <div className="sidebar-stat">
              <span className="stat-number">{memberCount}</span>
              <span className="stat-label">{memberCount === 1 ? 'Member' : 'Members'}</span>
            </div>
            <div className="sidebar-divider" />
            <Link href={`/c/${name}/submit`} className="sidebar-post-btn">
              Create Post
            </Link>
          </div>
        </aside>

      </div>

      <style>{`
        .community-root {
          font-family: 'Syne', sans-serif;
          min-height: 100vh;
        }

        /* Banner */
        .banner {
          height: 120px;
          position: relative;
        }
        .banner-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 60%, var(--mv-bg) 100%);
        }

        /* Header */
        .community-header {
          background: var(--mv-surface);
          border-bottom: 0.5px solid var(--mv-border);
        }
        .header-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 24px 20px;
          display: flex;
          gap: 16px;
          align-items: flex-start;
          margin-top: -28px;
          position: relative;
          z-index: 2;
        }
        .avatar-wrap {
          width: 60px;
          height: 60px;
          border-radius: 14px;
          background: var(--mv-surface-2);
          border: 2px solid var(--mv-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }
        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .avatar-initial {
          font-size: 24px;
          font-weight: 700;
          color: var(--mv-accent);
        }
        .header-info { flex: 1; padding-top: 8px; }
        .header-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        .community-title {
          font-size: 22px;
          font-weight: 700;
          color: var(--mv-text);
          margin: 0 0 2px;
          letter-spacing: -0.02em;
        }
        .member-count {
          font-size: 13px;
          color: var(--mv-muted);
          margin: 0;
          font-weight: 400;
        }
        .community-desc {
          font-size: 14px;
          color: var(--mv-muted);
          margin: 10px 0 0;
          line-height: 1.6;
          font-weight: 400;
        }

        /* Content layout */
        .content-wrap {
          max-width: 1100px;
          margin: 0 auto;
          padding: 24px;
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 24px;
          align-items: start;
        }

        /* Create post bar */
        .create-post-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--mv-surface);
          border: 0.5px solid var(--mv-border);
          border-radius: 12px;
          padding: 10px 14px;
          text-decoration: none;
          margin-bottom: 12px;
          transition: border-color 0.15s;
        }
        .create-post-bar:hover { border-color: var(--mv-primary); }
        .create-avatar {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: var(--mv-surface-2);
          border: 0.5px solid var(--mv-border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--mv-dim);
          flex-shrink: 0;
        }
        .create-placeholder {
          flex: 1;
          font-size: 14px;
          color: var(--mv-dim);
        }
        .create-btn-pill {
          font-size: 12px;
          font-weight: 600;
          color: var(--mv-accent);
          background: rgba(159,148,240,0.1);
          border: 0.5px solid rgba(159,148,240,0.2);
          border-radius: 20px;
          padding: 4px 12px;
        }

        /* Posts */
        .posts-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .post-card {
          display: flex;
          gap: 0;
          background: var(--mv-surface);
          border: 0.5px solid var(--mv-border);
          border-radius: 12px;
          text-decoration: none;
          overflow: hidden;
          animation: fade-up 0.4s cubic-bezier(0.16,1,0.3,1) both;
          transition: border-color 0.15s;
        }
        .post-card:hover { border-color: var(--mv-primary); }

        /* Vote col */
        .vote-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 12px 10px;
          background: var(--mv-surface-2);
          color: var(--mv-dim);
          min-width: 44px;
          flex-shrink: 0;
        }
        .vote-score {
          font-size: 12px;
          font-weight: 700;
          color: var(--mv-muted);
        }

        /* Post body */
        .post-body {
          flex: 1;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 0;
        }
        .post-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .post-author {
          font-size: 12px;
          font-weight: 600;
          color: var(--mv-accent);
        }
        .meta-dot {
          color: var(--mv-dim);
          font-size: 12px;
        }
        .post-time {
          font-size: 12px;
          color: var(--mv-dim);
        }
        .post-type-badge {
          font-size: 10px;
          font-weight: 600;
          color: var(--mv-primary);
          background: rgba(124,111,224,0.1);
          border: 0.5px solid rgba(124,111,224,0.2);
          border-radius: 4px;
          padding: 2px 6px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .post-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--mv-text);
          margin: 0;
          letter-spacing: -0.01em;
          line-height: 1.4;
        }
        .post-preview {
          font-size: 13px;
          color: var(--mv-muted);
          margin: 0;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          font-weight: 400;
        }
        .post-link {
          font-size: 12px;
          color: var(--mv-accent);
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .post-image {
          width: 100%;
          max-height: 300px;
          object-fit: cover;
          border-radius: 8px;
          margin-top: 4px;
        }
        .post-footer {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 4px;
        }
        .post-stat {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: var(--mv-dim);
        }

        /* Empty posts */
        .empty-posts {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 60px 24px;
          text-align: center;
          background: var(--mv-surface);
          border: 0.5px solid var(--mv-border);
          border-radius: 12px;
        }
        .empty-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--mv-text);
          margin: 4px 0 0;
        }
        .empty-sub {
          font-size: 13px;
          color: var(--mv-muted);
          margin: 0;
          font-weight: 400;
        }
        .empty-cta {
          margin-top: 8px;
          padding: 8px 20px;
          background: var(--mv-primary);
          color: var(--mv-text);
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.15s;
        }
        .empty-cta:hover { opacity: 0.88; }

        /* Sidebar */
        .sidebar-card {
          background: var(--mv-surface);
          border: 0.5px solid var(--mv-border);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: sticky;
          top: 80px;
        }
        .sidebar-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--mv-text);
          margin: 0;
          letter-spacing: -0.01em;
        }
        .sidebar-desc {
          font-size: 13px;
          color: var(--mv-muted);
          margin: 0;
          line-height: 1.6;
          font-weight: 400;
        }
        .sidebar-stat {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .stat-number {
          font-size: 20px;
          font-weight: 700;
          color: var(--mv-text);
        }
        .stat-label {
          font-size: 12px;
          color: var(--mv-muted);
        }
        .sidebar-divider {
          height: 0.5px;
          background: var(--mv-border);
        }
        .sidebar-post-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 40px;
          background: var(--mv-primary);
          color: var(--mv-text);
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.15s;
        }
        .sidebar-post-btn:hover { opacity: 0.88; }

        @keyframes fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .content-wrap {
            grid-template-columns: 1fr;
          }
          .sidebar { display: none; }
        }
      `}</style>
    </div>
  )
}

function timeAgo(dateStr) {
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000)
  if (seconds < 60)  return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}
