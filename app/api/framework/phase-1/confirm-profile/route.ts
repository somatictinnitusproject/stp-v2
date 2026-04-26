// Phase 1 confirmation handler. POST.
// Called when member clicks "Confirm and continue to Phase 2" or "Continue to Phase 2"
// at the bottom of Phase 1 session 7 (B.7 Profile Output).
//
// Writes protocol_option to framework_progress, sets phase1_completed_at = NOW(),
// advances current_phase to 2, current_session to 1. Doc 13 §7.2.
//
// null protocol_option is valid — single-driver and low-confidence members do not
// choose a protocol option; NULL is stored in framework_progress.protocol_option.
//
// Defensive check: requires phase1_assessment.completed_at to be set — ensures
// profile generation ran before Phase 2 access is granted.

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { advancePhase1 } from '@/lib/framework/advance'

// ── Valid option set ──────────────────────────────────────────────────────────

const VALID_OPTIONS = new Set<number | null>([1, 2, 3, null])

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  console.log('[confirm-profile] POST received')

  // 1. Auth
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  console.log('[confirm-profile] auth', { userId: user?.id ?? null, authError })
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  // 2. Parse body
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    console.log('[confirm-profile] 400 invalid JSON')
    return NextResponse.json({ ok: false, message: 'Invalid JSON.' }, { status: 400 })
  }

  // 3. Validate protocol_option — must be key-present (even if null), value in {1, 2, 3, null}
  if (typeof body.protocol_option === 'undefined') {
    console.log('[confirm-profile] 400 missing key protocol_option')
    return NextResponse.json({ ok: false, message: 'Missing required fields.' }, { status: 400 })
  }
  if (!VALID_OPTIONS.has(body.protocol_option as number | null)) {
    console.log('[confirm-profile] 400 invalid protocol_option', body.protocol_option)
    return NextResponse.json({ ok: false, message: 'Missing required fields.' }, { status: 400 })
  }

  console.log('[confirm-profile] validation passed', { protocol_option: body.protocol_option })

  const protocolOption = body.protocol_option as 1 | 2 | 3 | null

  // 4. Defensive check — confirm profile has been generated (completed_at is set)
  const { data: assessment, error: fetchError } = await supabase
    .from('phase1_assessment')
    .select('completed_at')
    .eq('user_id', user.id)
    .maybeSingle()

  console.log('[confirm-profile] assessment fetch', { found: !!assessment, fetchError })

  if (fetchError) {
    console.error('[confirm-profile] assessment fetch failed', fetchError)
    return NextResponse.json({ ok: false, message: 'Failed to load assessment.' }, { status: 500 })
  }

  if (!assessment) {
    return NextResponse.json(
      { ok: false, message: 'Phase 1 has not been started.' },
      { status: 409 },
    )
  }

  if (assessment.completed_at === null) {
    console.log('[confirm-profile] 409 profile not yet generated')
    return NextResponse.json(
      { ok: false, message: 'Profile not yet generated.' },
      { status: 409 },
    )
  }

  // 5. Advance Phase 1 → Phase 2
  try {
    await advancePhase1(user.id, protocolOption)
    console.log('[confirm-profile] phase advanced', { protocolOption })
  } catch (err) {
    console.error('[confirm-profile] advancePhase1 failed', err)
    return NextResponse.json(
      { ok: false, message: 'Failed to advance to Phase 2.' },
      { status: 500 },
    )
  }

  // 6. Success
  console.log('[confirm-profile] returning 200')
  return NextResponse.json({ ok: true })
}
