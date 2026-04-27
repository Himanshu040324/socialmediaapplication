import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function CommunitiesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all communities with member count
  const { data: communities } = await supabase
    .from('communities')
    .select(`
      id,
      name,
      description,
      avatar_url,
      created_at,
      community_members(count)
    `)
    .order('created_at', { ascending: false })

  // Fetch communities the user has already joined
  const { data: memberships } = await supabase
    .from('community_members')
    .select('community_id')
    .eq('user_id', user.id)

  const joinedIds = new Set(memberships?.map(m => m.community_id) || [])

  return (
    <div className="communities-root">

      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">Communities</h1>
          <p className="page-sub">Find your people. Join the conversation.</p>
        </div>
        <Link href="/communities/create" className="create-btn">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Create
        </Link>
      </div>

      {/* Communities grid */}
      {communities && communities.length > 0 ? (
        <div className="communities-grid">
          {communities.map((community, i) => {
            const memberCount = community.community_members?.[0]?.count ?? 0
            const isJoined = joinedIds.has(community.id)
            const initial = community.name.charAt(0).toUpperCase()

            return (
              <div
                key={community.id}
                className="community-card"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {/* Avatar */}
                <div className="card-top">
                  <div className="community-avatar">
                    {community.avatar_url ? (
                      <img src={community.avatar_url} alt={community.name} className="avatar-img" />
                    ) : (
                      <span className="avatar-initial">{initial}</span>
                    )}
                  </div>

                  {isJoined && (
                    <span className="joined-badge">Joined</span>
                  )}
                </div>

                {/* Info */}
                <div className="card-body">
                  <Link href={`/c/${community.name}`} className="community-name">
                    c/{community.name}
                  </Link>
                  <p className="community-desc">
                    {community.description || 'No description yet.'}
                  </p>
                </div>

                {/* Footer */}
                <div className="card-footer">
                  <span className="member-count">
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <circle cx="5" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.1" />
                      <path d="M1 11c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                      <circle cx="10" cy="4.5" r="1.8" stroke="currentColor" strokeWidth="1.1" />
                      <path d="M10 8.5c1.4.3 2.5 1.4 2.5 2.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                    </svg>
                    {memberCount} {memberCount === 1 ? 'member' : 'members'}
                  </span>
                  <Link href={`/c/${community.name}`} className="view-btn">
                    View →
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        // Empty state
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" stroke="var(--mv-border)" strokeWidth="1.2" />
              <path d="M13 20h14M20 13v14" stroke="var(--mv-dim)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className="empty-title">No communities yet</p>
          <p className="empty-sub">Be the first to create one</p>
          <Link href="/communities/create" className="create-btn">
            Create a community
          </Link>
        </div>
      )}

      <style>{`
        .communities-root {
          max-width: 1100px;
          margin: 0 auto;
          padding: 40px 24px;
          font-family: 'Syne', sans-serif;
        }

        /* Header */
        .page-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 36px;
          animation: fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }
        .page-title {
          font-size: 28px;
          font-weight: 700;
          color: var(--mv-text);
          margin: 0 0 6px;
          letter-spacing: -0.03em;
        }
        .page-sub {
          font-size: 14px;
          color: var(--mv-muted);
          margin: 0;
          font-weight: 400;
        }
        .create-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: var(--mv-primary);
          color: var(--mv-text);
          border: none;
          border-radius: 10px;
          padding: 10px 18px;
          font-size: 13px;
          font-weight: 600;
          font-family: 'Syne', sans-serif;
          text-decoration: none;
          cursor: pointer;
          transition: opacity 0.15s, transform 0.1s;
          letter-spacing: 0.02em;
          white-space: nowrap;
        }
        .create-btn:hover {
          opacity: 0.88;
        }
        .create-btn:active {
          transform: scale(0.97);
        }

        /* Grid */
        .communities-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        /* Card */
        .community-card {
          background: var(--mv-surface);
          border: 0.5px solid var(--mv-border);
          border-radius: 14px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          animation: fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both;
          transition: border-color 0.2s, transform 0.15s;
        }
        .community-card:hover {
          border-color: var(--mv-primary);
          transform: translateY(-2px);
        }

        .card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .community-avatar {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: var(--mv-surface-2);
          border: 0.5px solid var(--mv-border);
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
          font-size: 18px;
          font-weight: 700;
          color: var(--mv-accent);
        }

        .joined-badge {
          font-size: 11px;
          font-weight: 600;
          color: var(--mv-accent);
          background: rgba(159, 148, 240, 0.1);
          border: 0.5px solid rgba(159, 148, 240, 0.25);
          border-radius: 20px;
          padding: 3px 10px;
          letter-spacing: 0.04em;
        }

        .card-body {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }
        .community-name {
          font-size: 15px;
          font-weight: 700;
          color: var(--mv-text);
          text-decoration: none;
          letter-spacing: -0.01em;
          transition: color 0.15s;
        }
        .community-name:hover {
          color: var(--mv-accent);
        }
        .community-desc {
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

        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 12px;
          border-top: 0.5px solid var(--mv-border);
        }
        .member-count {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: var(--mv-dim);
        }
        .view-btn {
          font-size: 12px;
          font-weight: 600;
          color: var(--mv-accent);
          text-decoration: none;
          letter-spacing: 0.02em;
          transition: color 0.15s;
        }
        .view-btn:hover {
          color: var(--mv-text);
        }

        /* Empty state */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 80px 24px;
          text-align: center;
          animation: fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }
        .empty-icon {
          margin-bottom: 8px;
          opacity: 0.5;
        }
        .empty-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--mv-text);
          margin: 0;
        }
        .empty-sub {
          font-size: 14px;
          color: var(--mv-muted);
          margin: 0 0 8px;
          font-weight: 400;
        }

        /* Animation */
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Responsive */
        @media (max-width: 600px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .communities-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}