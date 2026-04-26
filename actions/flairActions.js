'use server'

import { createClient }   from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// ─── Guard: caller must be the community creator ──────────────────────────────
async function assertMod(supabase, communityId) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: community } = await supabase
    .from('communities')
    .select('created_by, name')
    .eq('id', communityId)
    .single()

  if (!community || community.created_by !== user.id)
    throw new Error('Not authorized — must be community moderator')

  return { user, community }
}

// ─── Create flair ─────────────────────────────────────────────────────────────
export async function createFlair(communityId, name, color) {
  const supabase = await createClient()
  const { community } = await assertMod(supabase, communityId)

  const { data, error } = await supabase
    .from('flairs')
    .insert({ community_id: communityId, name: name.trim(), color })
    .select('id, name, color, created_at')
    .single()

  if (error) return { error: error.message }

  revalidatePath(`/c/${community.name}`)
  return { flair: data }
}

// ─── Update flair ─────────────────────────────────────────────────────────────
export async function updateFlair(flairId, communityId, name, color) {
  const supabase = await createClient()
  const { community } = await assertMod(supabase, communityId)

  const { data, error } = await supabase
    .from('flairs')
    .update({ name: name.trim(), color })
    .eq('id', flairId)
    .select('id, name, color')
    .single()

  if (error) return { error: error.message }

  revalidatePath(`/c/${community.name}`)
  return { flair: data }
}

// ─── Delete flair ─────────────────────────────────────────────────────────────
// Posts that used this flair will have flair_id set to NULL (on delete set null)
export async function deleteFlair(flairId, communityId) {
  const supabase = await createClient()
  const { community } = await assertMod(supabase, communityId)

  const { error } = await supabase
    .from('flairs')
    .delete()
    .eq('id', flairId)

  if (error) return { error: error.message }

  revalidatePath(`/c/${community.name}`)
  return { success: true }
}