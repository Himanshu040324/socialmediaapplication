import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import CommunityPage from '@/components/CommunityPage'

export default async function CommunityPageRoute({ params }) {
  const { name } = await params
  const supabase  = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch community with creator profile
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

  // Member count + whether current user has joined
  const { count: memberCount } = await supabase
    .from('community_members')
    .select('*', { count: 'exact', head: true })
    .eq('community_id', community.id)

  const { data: membership } = await supabase
    .from('community_members')
    .select('user_id')
    .eq('community_id', community.id)
    .eq('user_id', user.id)
    .single()

  // Posts
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      id, title, body, image_url, link_url, type, created_at,
      author_id,
      profiles!posts_author_id_fkey(username),
      votes(user_id, value),
      comments(id)
    `)
    .eq('community_id', community.id)
    .order('created_at', { ascending: false })

  const enrichedPosts = (posts ?? []).map(p => ({
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
      isCreator={user.id === community.created_by}
      posts={enrichedPosts}
      userId={user.id}
    />
  )
}