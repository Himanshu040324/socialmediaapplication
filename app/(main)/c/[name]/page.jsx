import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import CommunityPage from '@/components/CommunityPage'

// ─── Banned landing — shown instead of community content ─────────────────────
function BannedView({ communityName, reason }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-24 font-sans flex flex-col items-center text-center gap-4">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center border"
        style={{ background: 'rgba(208,111,203,0.08)', borderColor: 'rgba(208,111,203,0.25)' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="var(--mv-pink)" strokeWidth="1.5"/>
          <path d="M6 6l12 12" stroke="var(--mv-pink)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      <h1 className="text-lg font-bold text-mv-text">You're banned from c/{communityName}</h1>
      <p className="text-sm text-mv-muted max-w-sm">
        You have been banned from this community and cannot view or participate in it.
      </p>
      {reason && (
        <div className="bg-mv-surface border border-mv-border rounded-xl px-5 py-3 max-w-sm w-full text-left">
          <p className="text-xs font-semibold text-mv-dim uppercase tracking-wide mb-1">Reason</p>
          <p className="text-sm text-mv-muted">{reason}</p>
        </div>
      )}
      <Link
        href="/feed"
        className="mt-2 text-xs text-mv-accent border border-mv-border hover:border-mv-primary px-5 py-2 rounded-xl transition-colors"
      >
        Back to Feed
      </Link>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default async function CommunityPageRoute({ params }) {
  const { name } = await params
  const supabase  = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch community
  const { data: community } = await supabase
    .from('communities')
    .select(`
      id, name, description, banner_url, avatar_url, created_at,
      created_by,
      profiles!communities_created_by_fkey(username)
    `)
    .eq('name', name)
    .single()

  if (!community) notFound()

  const isCreator = user.id === community.created_by

  // ── Ban check — creators are never banned from their own community ──────────
  if (!isCreator) {
    const { data: ban } = await supabase
      .from('community_bans')
      .select('reason')
      .eq('community_id', community.id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (ban) {
      return <BannedView communityName={community.name} reason={ban.reason} />
    }
  }

  // Member count + join status
  const { count: memberCount } = await supabase
    .from('community_members')
    .select('*', { count: 'exact', head: true })
    .eq('community_id', community.id)

  const { data: membership } = await supabase
    .from('community_members')
    .select('user_id')
    .eq('community_id', community.id)
    .eq('user_id', user.id)
    .maybeSingle()

  // Posts — include is_removed and is_pinned
  // Mods see all posts; non-mods only see non-removed ones (filter below)
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      id, title, body, image_url, link_url, type, created_at,
      is_removed, is_pinned,
      author_id,
      profiles!posts_author_id_fkey(username),
      votes(user_id, value),
      comments(id)
    `)
    .eq('community_id', community.id)
    .order('created_at', { ascending: false })

  const enrichedPosts = (posts ?? [])
    // Non-mods never receive removed posts at all (extra safety on top of client filter)
    .filter(p => isCreator || !p.is_removed)
    .map(p => ({
      ...p,
      score:        p.votes?.reduce((sum, v) => sum + v.value, 0) ?? 0,
      userVote:     p.votes?.find(v => v.user_id === user.id)?.value ?? 0,
      commentCount: p.comments?.length ?? 0,
    }))

  return (
    <CommunityPage
      community={community}
      memberCount={memberCount ?? 0}
      isMember={!!membership}
      isCreator={isCreator}
      posts={enrichedPosts}
      userId={user.id}
    />
  )
}