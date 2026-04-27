import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { advancePhase2 } from '@/lib/framework/advance'

// Phase 2 → Phase 3 advancement route. Member-triggered confirmation
// gate at the end of Phase 2 (C.8). Writes phase2_completed_at, sets
// current_phase=3, resets current_session=1.
//
// Idempotent: re-hitting the route after a successful advance returns
// success without re-writing phase2_completed_at.
//
// No payload required — the confirmation IS the action. Doc 8 line 457
// specifies the button is unconditional; per-habit acknowledges are
// engagement telemetry, not access control.

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ success: false }, { status: 401 })
  }

  try {
    const { nextPhase, nextSession, alreadyAdvanced } = await advancePhase2(user.id)
    return NextResponse.json({
      success: true,
      next_phase: nextPhase,
      next_session: nextSession,
      already_advanced: alreadyAdvanced,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : ''
    if (msg === 'framework_progress row not found for user') {
      return NextResponse.json({ success: false, message: 'No progress row' }, { status: 404 })
    }
    if (msg === 'cannot advance phase 2 from earlier phase') {
      return NextResponse.json({ success: false, message: 'Phase 2 not yet reached' }, { status: 400 })
    }
    console.error('[confirm-phase-2] advance error', err)
    return NextResponse.json({ success: false, message: 'Advance failed' }, { status: 500 })
  }
}
