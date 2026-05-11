import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { syncSignupToEmailOctopus, sendWelcomeEmail } from '@/lib/emailoctopus/client'

export async function POST() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try { cookieStore.set(name, value, options) } catch {}
          })
        },
      },
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  // Mark onboarding complete
  const { error } = await supabase
    .from('users')
    .update({ onboarding_completed: true, onboarding_step: 5 })
    .eq('id', user.id)

  if (error) {
    return NextResponse.json({ error: 'Could not save.' }, { status: 500 })
  }

  // Fetch user details for EmailOctopus — fire-and-forget, never blocks response
  const [{ data: userData }, { data: membership }] = await Promise.all([
    supabase.from('users').select('display_name').eq('id', user.id).single(),
    supabase
      .from('memberships')
      .select('is_founding_member, is_free_for_life')
      .eq('user_id', user.id)
      .single(),
  ])

  const email = user.email ?? ''
  const username = userData?.display_name ?? ''

  // Sync must complete before welcome email — sendWelcomeEmail looks up the
  // contact by email, so the contact must exist first. Fire-and-forget but ordered.
  void (async () => {
    try {
      await syncSignupToEmailOctopus({
        email,
        username,
        is_founding_member: membership?.is_founding_member ?? false,
        is_free_for_life: membership?.is_free_for_life ?? false,
      })
      await sendWelcomeEmail({ email, username })
    } catch (err) {
      console.error('[onboarding/complete] emailoctopus chain failed:', err)
    }
  })()

  return NextResponse.json({ success: true })
}
