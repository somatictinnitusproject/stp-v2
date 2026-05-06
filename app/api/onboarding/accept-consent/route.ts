import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const { researchConsent } = await request.json()

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

  const [consentResult, userResult] = await Promise.all([
    // Upsert so retries and re-runs of onboarding don't 500 on the UNIQUE(user_id) constraint.
    supabase.from('consents').upsert(
      {
        user_id: user.id,
        health_data_consent: true,
        research_consent: researchConsent === true,
        consented_at: new Date().toISOString(),
      },
      { onConflict: 'user_id', ignoreDuplicates: false },
    ),
    supabase.from('users').update({ onboarding_step: 3 }).eq('id', user.id),
  ])

  if (consentResult.error || userResult.error) {
    return NextResponse.json({ error: 'Could not save.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
