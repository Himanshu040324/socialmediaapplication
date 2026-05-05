'use server'

import { createClient }   from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// ─── Guard: caller must be a platform admin ───────────────────────────────────
async function assertAdmin(supabase) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) throw new Error('Not authorized — admin only')
  return user
}

// ─── Delete (remove) a post ───────────────────────────────────────────────────
export async function adminRemovePost(postId) {
  const supabase = await createClient()
  await assertAdmin(supabase)

  const { error } = await supabase
    .from('posts')
    .update({ is_removed: true })
    .eq('id', postId)

  if (error) return { error: error.message }
  revalidatePath('/admin/dashboard')
  return { success: true }
}

// ─── Restore a post ───────────────────────────────────────────────────────────
export async function adminRestorePost(postId) {
  const supabase = await createClient()
  await assertAdmin(supabase)

  const { error } = await supabase
    .from('posts')
    .update({ is_removed: false })
    .eq('id', postId)

  if (error) return { error: error.message }
  revalidatePath('/admin/dashboard')
  return { success: true }
}

// ─── Globally ban a user ──────────────────────────────────────────────────────
export async function adminBanUser(targetUserId) {
  const supabase = await createClient()
  const admin    = await assertAdmin(supabase)

  if (targetUserId === admin.id) return { error: 'Cannot ban yourself' }

  const { error } = await supabase
    .from('profiles')
    .update({ is_banned: true })
    .eq('id', targetUserId)

  if (error) return { error: error.message }
  revalidatePath('/admin/dashboard')
  return { success: true }
}

// ─── Unban a user ─────────────────────────────────────────────────────────────
export async function adminUnbanUser(targetUserId) {
  const supabase = await createClient()
  await assertAdmin(supabase)

  const { error } = await supabase
    .from('profiles')
    .update({ is_banned: false })
    .eq('id', targetUserId)

  if (error) return { error: error.message }
  revalidatePath('/admin/dashboard')
  return { success: true }
}

// ─── Delete a community ───────────────────────────────────────────────────────
export async function adminDeleteCommunity(communityId) {
  const supabase = await createClient()
  await assertAdmin(supabase)

  const { error } = await supabase
    .from('communities')
    .delete()
    .eq('id', communityId)

  if (error) return { error: error.message }
  revalidatePath('/admin/dashboard')
  return { success: true }
}