'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// ─── Guard: verify the calling user is this community's creator ───────────────
async function assertMod(supabase, communityId) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: community } = await supabase
    .from('communities')
    .select('created_by, name')
    .eq('id', communityId)
    .single()

  if (!community || community.created_by !== user.id) {
    throw new Error('Not authorized — must be community moderator')
  }

  return { user, community }
}

// ─── Remove / restore a post ──────────────────────────────────────────────────
export async function removePost(postId, communityId, remove = true) {
  const supabase = await createClient()
  const { community } = await assertMod(supabase, communityId)

  const { error } = await supabase
    .from('posts')
    .update({ is_removed: remove })
    .eq('id', postId)

  if (error) return { error: error.message }

  revalidatePath(`/c/${community.name}`)
  revalidatePath(`/post/${postId}`)
  return { success: true }
}

// ─── Pin / unpin a post ───────────────────────────────────────────────────────
export async function pinPost(postId, communityId, pin = true) {
  const supabase = await createClient()
  const { community } = await assertMod(supabase, communityId)

  const { error } = await supabase
    .from('posts')
    .update({ is_pinned: pin })
    .eq('id', postId)

  if (error) return { error: error.message }

  revalidatePath(`/c/${community.name}`)
  return { success: true }
}

// ─── Remove / restore a comment ───────────────────────────────────────────────
export async function removeComment(commentId, communityId, remove = true) {
  const supabase = await createClient()
  await assertMod(supabase, communityId)

  const { error } = await supabase
    .from('comments')
    .update({ is_removed: remove })
    .eq('id', commentId)

  if (error) return { error: error.message }
  return { success: true }
}

// ─── Ban a user from a community ─────────────────────────────────────────────
export async function banUser(targetUserId, communityId, reason = '') {
  const supabase = await createClient()
  const { user, community } = await assertMod(supabase, communityId)

  // Can't ban yourself
  if (targetUserId === user.id) return { error: 'Cannot ban yourself' }

  const { error } = await supabase
    .from('community_bans')
    .upsert(
      {
        community_id: communityId,
        user_id:      targetUserId,
        banned_by:    user.id,
        reason:       reason.trim() || null,
      },
      { onConflict: 'community_id,user_id' }
    )

  if (error) return { error: error.message }

  // Also remove them from community_members if they were a member
  await supabase
    .from('community_members')
    .delete()
    .eq('community_id', communityId)
    .eq('user_id', targetUserId)

  revalidatePath(`/c/${community.name}`)
  return { success: true }
}

// ─── Unban a user ─────────────────────────────────────────────────────────────
export async function unbanUser(targetUserId, communityId) {
  const supabase = await createClient()
  const { community } = await assertMod(supabase, communityId)

  const { error } = await supabase
    .from('community_bans')
    .delete()
    .eq('community_id', communityId)
    .eq('user_id', targetUserId)

  if (error) return { error: error.message }

  revalidatePath(`/c/${community.name}`)
  return { success: true }
}