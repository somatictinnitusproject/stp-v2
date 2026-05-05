import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const VALID_CLASSIFICATIONS = new Set(['A', 'B', 'C'])

export async function POST(request: Request) {
  const { classification } = await request.json() as { classification: unknown }

  if (typeof classification !== 'string' || !VALID_CLASSIFICATIONS.has(classification)) {
    return NextResponse.json({ error: 'Invalid classification.' }, { status: 400 })
  }

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

  const now = new Date().toISOString()

  // Upsert: create row with classification if none exists, or update classification on conflict.
  // created_at is set by DB DEFAULT on INSERT and intentionally not overwritten on UPDATE.
  const { error: upsertError } = await supabase
    .from('phase1_assessment')
    .upsert(
      { user_id: user.id, classification, updated_at: now },
      { onConflict: 'user_id', ignoreDuplicates: false },
    )

  if (upsertError) {
    console.error('[save-classification] upsert failed', upsertError.message, 'user:', user.id)
    return NextResponse.json({ error: 'Could not save.' }, { status: 500 })
  }

  // Advance onboarding step to 5 (payment step)
  const { error: stepError } = await supabase
    .from('users')
    .update({ onboarding_step: 5 })
    .eq('id', user.id)

  if (stepError) {
    console.error('[save-classification] step update failed', stepError.message, 'user:', user.id)
    return NextResponse.json({ error: 'Could not advance.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
