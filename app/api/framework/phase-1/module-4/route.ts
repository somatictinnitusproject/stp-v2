// Module 4 — Nervous System & Stress submission handler. POST.
// Called when member clicks "Save and continue" at the bottom of Phase 1 session 5.
//
// Module 4 produces NO score — four ns_* flag columns only.
// Doc 13 §4.4 step 5: three or more flags trigger the high-NS modifier.
//   UPDATE phase1_assessment
//   SET ns_stress_tinnitus_correlation, ns_hypervigilance, ns_sleep_disruption,
//       ns_anxiety_loop, updated_at = NOW()
//   WHERE user_id = auth.uid()
//
// Client sends six semantic ternary keys (Q5/Q6 are UI-only and never sent).
// Route collapses ternary → boolean inline (no derive function — unlike M9a).
// Q3 sleep disruption: flag fires on strict 'yes' to any sub-question only.
// 'sometimes' does NOT fire per Doc 8: "Yes to one or more components of Q3".
// Doc 13 §7.8: incrementCurrentSession called inline after UPDATE succeeds.

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { incrementCurrentSession } from '@/lib/framework/advance'

// ── Collapse helpers ──────────────────────────────────────────────────────────

// Yes/Sometimes/No → BOOLEAN: yes + sometimes → TRUE, no → FALSE (Q1, Q2, Q4)
function collapseYesSometimesNo(val: string): boolean {
  return val === 'yes' || val === 'sometimes'
}

// Strict yes-only collapse — 'sometimes' does NOT fire the flag (Q3 per Doc 8)
function collapseYesOnly(val: string): boolean {
  return val === 'yes'
}

// ── Valid enum set ────────────────────────────────────────────────────────────

const VALID_TRI = new Set(['yes', 'sometimes', 'no'])

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  console.log('[module-4] POST received')

  // 1. Auth
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  console.log('[module-4] auth', { userId: user?.id ?? null, authError })
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  // 2. Parse body
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    console.log('[module-4] 400 invalid JSON')
    return NextResponse.json({ ok: false, message: 'Invalid JSON.' }, { status: 400 })
  }

  // 3. Validate required keys — all six must be present and valid ternary values
  if (!VALID_TRI.has(body.q1_stress as string)) {
    console.log('[module-4] 400 missing key q1_stress')
    return NextResponse.json({ ok: false, message: 'Missing required fields.' }, { status: 400 })
  }
  if (!VALID_TRI.has(body.q2_hypervigilance as string)) {
    console.log('[module-4] 400 missing key q2_hypervigilance')
    return NextResponse.json({ ok: false, message: 'Missing required fields.' }, { status: 400 })
  }
  if (!VALID_TRI.has(body.q3_falling_asleep as string)) {
    console.log('[module-4] 400 missing key q3_falling_asleep')
    return NextResponse.json({ ok: false, message: 'Missing required fields.' }, { status: 400 })
  }
  if (!VALID_TRI.has(body.q3_night_waking as string)) {
    console.log('[module-4] 400 missing key q3_night_waking')
    return NextResponse.json({ ok: false, message: 'Missing required fields.' }, { status: 400 })
  }
  if (!VALID_TRI.has(body.q3_morning_louder as string)) {
    console.log('[module-4] 400 missing key q3_morning_louder')
    return NextResponse.json({ ok: false, message: 'Missing required fields.' }, { status: 400 })
  }
  if (!VALID_TRI.has(body.q4_anxiety as string)) {
    console.log('[module-4] 400 missing key q4_anxiety')
    return NextResponse.json({ ok: false, message: 'Missing required fields.' }, { status: 400 })
  }

  console.log('[module-4] validation passed')

  // 4. Narrow types after validation
  const b = body as Record<string, string>

  // 5. Fetch existing assessment row — 409 if missing (B.1 not completed)
  const { data: existingAssessment, error: fetchError } = await supabase
    .from('phase1_assessment')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  console.log('[module-4] assessment fetch', { found: !!existingAssessment, fetchError })

  if (fetchError) {
    console.error('[module-4] assessment fetch failed', fetchError)
    return NextResponse.json({ ok: false, message: 'Failed to load assessment.' }, { status: 500 })
  }

  if (!existingAssessment) {
    return NextResponse.json(
      { ok: false, message: 'Phase 1 has not been started.' },
      { status: 409 },
    )
  }

  // 6. Collapse ternary → boolean inline (no derive function for M4)
  const updates = {
    ns_stress_tinnitus_correlation: collapseYesSometimesNo(b.q1_stress),
    ns_hypervigilance:              collapseYesSometimesNo(b.q2_hypervigilance),
    ns_sleep_disruption:
      collapseYesOnly(b.q3_falling_asleep) ||
      collapseYesOnly(b.q3_night_waking)   ||
      collapseYesOnly(b.q3_morning_louder),
    ns_anxiety_loop:                collapseYesSometimesNo(b.q4_anxiety),
  }
  console.log('[module-4] derived updates', updates)

  // 7. UPDATE phase1_assessment — four ns_* columns + updated_at
  const { data: updateData, error: updateError } = await supabase
    .from('phase1_assessment')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .select('user_id')

  console.log('[module-4] update result', {
    rows: updateData?.length ?? 0,
    error: updateError
      ? { code: updateError.code, message: updateError.message }
      : null,
  })

  if (updateError) {
    console.error('[module-4] update failed', updateError)
    return NextResponse.json({ ok: false, message: 'Failed to save assessment.' }, { status: 500 })
  }

  // Defensive — shouldn't fire after SELECT above succeeded
  if (!updateData || updateData.length === 0) {
    return NextResponse.json(
      { ok: false, message: 'Phase 1 has not been started.' },
      { status: 409 },
    )
  }

  // 8. Advance session 5 → 6 per Doc 13 §7.8
  try {
    await incrementCurrentSession(user.id, 1, 5)
    console.log('[module-4] session advanced')
  } catch (err) {
    console.error('[module-4] incrementCurrentSession failed', err)
    return NextResponse.json({ ok: false, message: 'Failed to advance session.' }, { status: 500 })
  }

  // 9. Success — no scores to return (M4 is unscored)
  console.log('[module-4] returning 200')
  return NextResponse.json({ ok: true, nextSession: 6 })
}
