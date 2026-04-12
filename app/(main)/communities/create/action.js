'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function createCommunityAction(formData) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name        = formData.get('name')?.trim()
  const description = formData.get('description')?.trim()

  // Basic validation
  if (!name) {
    return { error: 'Community name is required.' }
  }

  if (name.length < 3) {
    return { error: 'Name must be at least 3 characters.' }
  }

  if (name.length > 30) {
    return { error: 'Name must be 30 characters or less.' }
  }

  // Only allow letters, numbers, underscores (like Reddit)
  if (!/^[a-zA-Z0-9_]+$/.test(name)) {
    return { error: 'Name can only contain letters, numbers, and underscores.' }
  }

  // Insert the community
  const { data: community, error } = await supabase
    .from('communities')
    .insert({
      name,
      description: description || null,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    // Unique constraint = name already taken
    if (error.code === '23505') {
      return { error: `c/${name} already exists. Try a different name.` }
    }
    return { error: error.message }
  }

  // Auto-join the creator to their own community
  await supabase
    .from('memberships')
    .insert({
      user_id: user.id,
      community_id: community.id,
    })

  // Redirect to the new community page
  redirect(`/c/${name}`)
}