'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function signupAction(formData) {
  const email = formData.get('email')
  const password = formData.get('password')
  const username = formData.get('username')

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // If email confirmation is enabled, user won't be auto logged in
  if (data?.user?.identities?.length === 0) {
    return { error: 'An account with this email already exists.' }
  }

  // If email confirmation is disabled (dev mode), redirect to feed
  if (data?.session) {
    redirect('/feed')
  }

  // If email confirmation is enabled, show success state
  return { success: true }
}