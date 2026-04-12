import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import NotificationsClient from '@/components/NotificationsClient'

export default async function NotificationsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch first page server-side for instant render
  const { data } = await supabase
    .from('notifications')
    .select(`
      id, type, is_read, created_at, post_id, comment_id,
      profiles!notifications_actor_id_fkey(username),
      posts(title)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(30)

  const initial = (data ?? []).map(n => ({
    ...n,
    post_title: n.posts?.title ?? null,
  }))

  return <NotificationsClient userId={user.id} initialNotifications={initial} />
}