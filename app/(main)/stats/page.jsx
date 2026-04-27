import { createClient } from '@/utils/supabase/server'
import { redirect }      from 'next/navigation'
import StatsPage         from '@/components/StatsPage'

export const revalidate = 300 // recompute every 5 minutes

export default async function StatsRoute() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const now      = new Date()
  const day7ago  = new Date(now - 7  * 24 * 60 * 60 * 1000).toISOString()
  const day1ago  = new Date(now - 1  * 24 * 60 * 60 * 1000).toISOString()
  const today0h  = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

  // ─── 1. Posts last 7 days (for active communities) ─────────────────────────
  const { data: weekPosts } = await supabase
    .from('posts')
    .select(`
      id, community_id, created_at,
      communities(id, name, avatar_url),
      comments(id)
    `)
    .gte('created_at', day7ago)
    .eq('is_removed', false)

  // Group by community
  const communityMap = {}
  for (const post of weekPosts ?? []) {
    const c = post.communities
    if (!c) continue
    if (!communityMap[c.id]) {
      communityMap[c.id] = {
        id:           c.id,
        name:         c.name,
        avatar_url:   c.avatar_url,
        postCount:    0,
        commentCount: 0,
      }
    }
    communityMap[c.id].postCount    += 1
    communityMap[c.id].commentCount += post.comments?.length ?? 0
  }

  // Member counts for top communities
  const topCommunityIds = Object.values(communityMap)
    .sort((a, b) => (b.postCount + b.commentCount) - (a.postCount + a.commentCount))
    .slice(0, 5)
    .map(c => c.id)

  const memberCounts = {}
  if (topCommunityIds.length > 0) {
    const { data: memberships } = await supabase
      .from('community_members')
      .select('community_id')
      .in('community_id', topCommunityIds)

    for (const m of memberships ?? []) {
      memberCounts[m.community_id] = (memberCounts[m.community_id] ?? 0) + 1
    }
  }

  const activeCommunities = Object.values(communityMap)
    .sort((a, b) => (b.postCount + b.commentCount) - (a.postCount + a.commentCount))
    .slice(0, 5)
    .map((c, i) => ({
      ...c,
      memberCount:   memberCounts[c.id] ?? 0,
      activityScore: c.postCount + c.commentCount,
      rank:          i + 1,
    }))

  // ─── 2. Top posts today ─────────────────────────────────────────────────────
  const { data: todayPosts } = await supabase
    .from('posts')
    .select(`
      id, title, type, created_at,
      author_id,
      profiles!posts_author_id_fkey(username),
      communities(id, name),
      votes(user_id, value),
      comments(id),
      flairs(id, name, color)
    `)
    .gte('created_at', day1ago)
    .eq('is_removed', false)
    .order('created_at', { ascending: false })

  const topPostsToday = (todayPosts ?? [])
    .map(p => ({
      id:           p.id,
      title:        p.title,
      type:         p.type,
      created_at:   p.created_at,
      author:       p.profiles?.username ?? 'deleted',
      community:    p.communities?.name  ?? '',
      score:        p.votes?.reduce((s, v) => s + v.value, 0) ?? 0,
      commentCount: p.comments?.length ?? 0,
      flair:        Array.isArray(p.flairs) ? p.flairs[0] ?? null : p.flairs ?? null,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  // ─── 3. Karma leaderboard today ─────────────────────────────────────────────
  // Sum vote values on posts created today, per author
  const { data: todayPostsForKarma } = await supabase
    .from('posts')
    .select(`
      author_id,
      profiles!posts_author_id_fkey(username),
      votes(value)
    `)
    .gte('created_at', today0h)
    .eq('is_removed', false)

  // Also count karma from comments created today
  const { data: todayComments } = await supabase
    .from('comments')
    .select(`
      author_id,
      profiles!comments_author_id_fkey(username),
      comment_votes(value)
    `)
    .gte('created_at', today0h)
    .eq('is_removed', false)

  const karmaMap = {}

  for (const post of todayPostsForKarma ?? []) {
    const uid = post.author_id
    if (!uid) continue
    if (!karmaMap[uid]) karmaMap[uid] = { id: uid, username: post.profiles?.username ?? 'deleted', karma: 0 }
    karmaMap[uid].karma += post.votes?.reduce((s, v) => s + v.value, 0) ?? 0
  }

  for (const comment of todayComments ?? []) {
    const uid = comment.author_id
    if (!uid) continue
    if (!karmaMap[uid]) karmaMap[uid] = { id: uid, username: comment.profiles?.username ?? 'deleted', karma: 0 }
    karmaMap[uid].karma += comment.comment_votes?.reduce((s, v) => s + v.value, 0) ?? 0
  }

  const karmaLeaderboard = Object.values(karmaMap)
    .filter(u => u.karma > 0)
    .sort((a, b) => b.karma - a.karma)
    .slice(0, 5)
    .map((u, i) => ({ ...u, rank: i + 1 }))

  // ─── 4. Quick site-wide numbers ─────────────────────────────────────────────
  const [
    { count: totalPosts },
    { count: totalUsers },
    { count: totalCommunities },
    { count: postsToday },
  ] = await Promise.all([
    supabase.from('posts').select('*',    { count: 'exact', head: true }).eq('is_removed', false),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('communities').select('*', { count: 'exact', head: true }),
    supabase.from('posts').select('*',    { count: 'exact', head: true }).gte('created_at', today0h).eq('is_removed', false),
  ])

  const siteStats = {
    totalPosts:       totalPosts       ?? 0,
    totalUsers:       totalUsers       ?? 0,
    totalCommunities: totalCommunities ?? 0,
    postsToday:       postsToday       ?? 0,
  }

  return (
    <StatsPage
      activeCommunities={activeCommunities}
      topPostsToday={topPostsToday}
      karmaLeaderboard={karmaLeaderboard}
      siteStats={siteStats}
      generatedAt={now.toISOString()}
    />
  )
}