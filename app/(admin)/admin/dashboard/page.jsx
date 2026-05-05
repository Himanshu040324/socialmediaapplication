import { createClient } from '@/utils/supabase/server'
import { redirect }      from 'next/navigation'
import AdminDashboard    from '@/components/AdminDashboard'

export const revalidate = 60 // refresh every minute

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const now     = new Date()
  const today0h = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

  // ─── Run all queries in parallel ─────────────────────────────────────────────
  const [
    { data: allUsers },
    { data: allCommunities },
    { data: recentPosts },
    { count: totalComments },
    { count: totalVotes },
    { count: removedPosts },
    { count: bannedUsers },
    { count: postsToday },
  ] = await Promise.all([
    // All users with post count
    supabase
      .from('profiles')
      .select('id, username, created_at, is_admin, is_banned')
      .order('created_at', { ascending: false }),

    // All communities with creator profile
    supabase
      .from('communities')
      .select(`
        id, name, description, avatar_url, created_at,
        profiles!communities_created_by_fkey(username),
        community_members(count),
        posts(count)
      `)
      .order('created_at', { ascending: false }),

    // Recent 100 posts for the posts tab
    supabase
      .from('posts')
      .select(`
        id, title, type, created_at, is_removed,
        profiles!posts_author_id_fkey(username),
        communities(name),
        votes(value)
      `)
      .order('created_at', { ascending: false })
      .limit(100),

    // Total comments
    supabase.from('comments').select('*', { count: 'exact', head: true }),

    // Total votes
    supabase.from('votes').select('*', { count: 'exact', head: true }),

    // Removed posts
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('is_removed', true),

    // Banned users
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_banned', true),

    // Posts today
    supabase.from('posts').select('*', { count: 'exact', head: true })
      .gte('created_at', today0h).eq('is_removed', false),
  ])

  // ─── Post counts per user ─────────────────────────────────────────────────
  const { data: postCountRows } = await supabase
    .from('posts')
    .select('author_id')
    .eq('is_removed', false)

  const postCountMap = {}
  for (const r of postCountRows ?? []) {
    postCountMap[r.author_id] = (postCountMap[r.author_id] ?? 0) + 1
  }

  // ─── Signups per day (last 7 days) ────────────────────────────────────────
  const signupsChart = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (6 - i))
    return {
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date:  d.toISOString().split('T')[0],
      count: 0,
    }
  })

  for (const user of allUsers ?? []) {
    const day = user.created_at?.split('T')[0]
    const slot = signupsChart.find(s => s.date === day)
    if (slot) slot.count++
  }

  // ─── Shape data for components ────────────────────────────────────────────
  const users = (allUsers ?? []).map(u => ({
    ...u,
    postCount: postCountMap[u.id] ?? 0,
  }))

  const communities = (allCommunities ?? []).map(c => ({
    ...c,
    memberCount: c.community_members?.[0]?.count ?? 0,
    postCount:   c.posts?.[0]?.count ?? 0,
  }))

  const posts = (recentPosts ?? []).map(p => ({
    id:         p.id,
    title:      p.title,
    type:       p.type,
    created_at: p.created_at,
    is_removed: p.is_removed,
    author:     p.profiles?.username ?? 'deleted',
    community:  p.communities?.name  ?? '',
    score:      p.votes?.reduce((s, v) => s + v.value, 0) ?? 0,
  }))

  const stats = {
    totalPosts:       (recentPosts?.length ?? 0),  // approximate from recent; use count below
    totalUsers:       allUsers?.length       ?? 0,
    totalCommunities: allCommunities?.length ?? 0,
    postsToday:       postsToday             ?? 0,
    removedPosts:     removedPosts           ?? 0,
    bannedUsers:      bannedUsers            ?? 0,
    totalComments:    totalComments          ?? 0,
    totalVotes:       totalVotes             ?? 0,
  }

  // Get exact total posts count
  const { count: exactPostCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('is_removed', false)
  stats.totalPosts = exactPostCount ?? 0

  return (
    <AdminDashboard
      stats={stats}
      users={users}
      communities={communities}
      posts={posts}
      signupsChart={signupsChart}
      currentUserId={user.id}
    />
  )
}