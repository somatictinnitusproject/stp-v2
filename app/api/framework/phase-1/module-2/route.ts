// Module 2 — Cervical submission handler. POST.
// Called when member clicks "Save and continue" at the bottom of Phase 1 session 3.
//
// Doc 13 §1.10 progressive save pattern:
//   UPDATE phase1_assessment
//   SET <module-2 columns>,
//       tmj_raw_score  = calculateTmjRawScore(assessment),
//       cerv_raw_score = calculateCervRawScore(assessment, user),
//       updated_at     = NOW()
//   WHERE user_id = auth.uid()
//
// Doc 13 §1.11 NULL handling: NULL columns evaluate to FALSE and contribute 0 points.
// ERRATA E7 collapse rules applied before UPDATE — see handler body.
// ERRATA E13: M3/M4/M5 read directly from phase1_assessment, no intake fallback.
// ERRATA E16: cerv_floor_relief_test removed — not present in this module.
// Doc 13 §7.8: incrementCurrentSession called inline after UPDATE succeeds.

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateTmjRawScore, calculateCervRawScore } from '@/lib/scoring'
import type { Phase1AssessmentRow, UserIntakeRow } from '@/lib/scoring'
import { incrementCurrentSession } from '@/lib/framework/advance'

// ── E7 collapse helpers ───────────────────────────────────────────────────────

// Yes/No → BOOLEAN (no unsure, no sometimes)
function collapseYesNo(val: string): boolean {
  return val === 'yes'
}

// Yes/Sometimes/No (history) → BOOLEAN: yes + sometimes → TRUE, no → FALSE
function collapseYesSometimesNo(val: string): boolean {
  return val === 'yes' || val === 'sometimes'
}

// ── Payload keys ─────────────────────────────────────────────────────────────

// These must be non-null strings in every valid submission
const REQUIRED_PRIMARY_KEYS = [
  'cerv_m3_neck_curl',
  'cerv_m4_head_rotation',
  'cerv_m5_chin_tuck',
  'cerv_suboccipital_tenderness',
  'cerv_scm_asymmetry',
  'cerv_trap_asymmetry',
  'cerv_rotation_restriction',
  'cerv_forward_head_posture',
  'cerv_neck_pain',
  'cerv_cervicogenic_headaches',
  'cerv_worse_desk_work',
  'ctx_whiplash_history',
  'ctx_sedentary_occupation',
  'ctx_one_sided_sport',
] as const

// These are always sent from the client but may be null (boolean secondaries + direction/side)
const NULLABLE_SECONDARY_KEYS = [
  'cerv_m4_asymmetric_side',       // yes/no | null — boolean secondary (asymmetry flag)
  'cerv_suboccipital_asymmetric',  // yes/no | null — boolean secondary
  'cerv_suboccipital_tender_side', // left/right | null — side tertiary
  'cerv_scm_dominant_side',        // left/right | null — direction
  'cerv_trap_dominant_side',       // left/right | null — direction
  'cerv_restricted_side',          // left/right | null — direction
] as const

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  console.log('[module-2] POST received')

  // 1. Auth
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  console.log('[module-2] auth', { userId: user?.id ?? null, authError })
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  // 2. Parse + validate body
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid JSON.' }, { status: 400 })
  }

  for (const key of REQUIRED_PRIMARY_KEYS) {
    if (typeof body[key] !== 'string') {
      console.log('[module-2] 400 missing key', key)
      return NextResponse.json({ ok: false, message: 'Missing required fields.' }, { status: 400 })
    }
  }
  for (const key of NULLABLE_SECONDARY_KEYS) {
    if (!(key in body)) {
      console.log('[module-2] 400 missing secondary key', key)
      return NextResponse.json({ ok: false, message: 'Missing required fields.' }, { status: 400 })
    }
  }

  // Narrow types after validation
  const b = body as Record<(typeof REQUIRED_PRIMARY_KEYS)[number], string> &
    Record<(typeof NULLABLE_SECONDARY_KEYS)[number], string | null>

  // 3. Apply E7 collapse rules
  const updates = {
    // Movement tests (yes/no → boolean)
    cerv_m3_neck_curl:     collapseYesNo(b.cerv_m3_neck_curl),
    cerv_m4_head_rotation: collapseYesNo(b.cerv_m4_head_rotation),
    // Boolean secondary: asymmetry flag — only meaningful when primary === 'yes'
    cerv_m4_asymmetric_side:
      b.cerv_m4_head_rotation === 'yes' && b.cerv_m4_asymmetric_side !== null
        ? collapseYesNo(b.cerv_m4_asymmetric_side)
        : null,
    cerv_m5_chin_tuck: collapseYesNo(b.cerv_m5_chin_tuck),

    // Physical assessment
    cerv_suboccipital_tenderness: collapseYesNo(b.cerv_suboccipital_tenderness),
    // Boolean secondary — null when primary is 'no'
    cerv_suboccipital_asymmetric:
      b.cerv_suboccipital_tenderness === 'yes' && b.cerv_suboccipital_asymmetric !== null
        ? collapseYesNo(b.cerv_suboccipital_asymmetric)
        : null,
    // Side tertiary — null unless both primary='yes' and secondary='yes'
    cerv_suboccipital_tender_side:
      b.cerv_suboccipital_tenderness === 'yes' && b.cerv_suboccipital_asymmetric === 'yes'
        ? (b.cerv_suboccipital_tender_side ?? null)
        : null,

    cerv_scm_asymmetry:     collapseYesNo(b.cerv_scm_asymmetry),
    cerv_scm_dominant_side: b.cerv_scm_asymmetry === 'yes' ? (b.cerv_scm_dominant_side ?? null) : null,

    cerv_trap_asymmetry:     collapseYesNo(b.cerv_trap_asymmetry),
    cerv_trap_dominant_side: b.cerv_trap_asymmetry === 'yes' ? (b.cerv_trap_dominant_side ?? null) : null,

    cerv_rotation_restriction: collapseYesNo(b.cerv_rotation_restriction),
    cerv_restricted_side:      b.cerv_rotation_restriction === 'yes' ? (b.cerv_restricted_side ?? null) : null,

    cerv_forward_head_posture: collapseYesNo(b.cerv_forward_head_posture),

    // History (yes/sometimes/no → boolean)
    cerv_neck_pain:              collapseYesSometimesNo(b.cerv_neck_pain),
    cerv_cervicogenic_headaches: collapseYesSometimesNo(b.cerv_cervicogenic_headaches),
    cerv_worse_desk_work:        collapseYesSometimesNo(b.cerv_worse_desk_work),

    // Context (yes/no → boolean)
    ctx_whiplash_history:     collapseYesNo(b.ctx_whiplash_history),
    ctx_sedentary_occupation: collapseYesNo(b.ctx_sedentary_occupation),
    ctx_one_sided_sport:      collapseYesNo(b.ctx_one_sided_sport),
  }

  // 4. Fetch existing assessment row — 409 if missing (B.1 not completed)
  const { data: existingAssessment, error: fetchError } = await supabase
    .from('phase1_assessment')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  console.log('[module-2] assessment fetch', { found: !!existingAssessment, fetchError })

  if (fetchError) {
    console.error('[module-2] assessment fetch failed', fetchError)
    return NextResponse.json({ ok: false, message: 'Failed to load assessment.' }, { status: 500 })
  }

  if (!existingAssessment) {
    return NextResponse.json(
      { ok: false, message: 'Phase 1 has not been started.' },
      { status: 409 },
    )
  }

  // Fetch intake columns needed for TMJ overlapping indicators (§1.10 progressive save)
  const { data: userData } = await supabase
    .from('users')
    .select('s1_score, s6_score, s7_score, s8_score, symptom_score')
    .eq('id', user.id)
    .maybeSingle()

  // m1/m2/m3/m4/m4_asymmetric/m5/s2/s5 removed — always NULL for V2 members (E9/E12/E13/E14/E15)
  const userIntake: UserIntakeRow = {
    m1_score:      null,
    m2_score:      null,
    m3_score:      null,
    m4_score:      null,
    m4_asymmetric: null,
    m5_score:      null,
    s1_score:      userData?.s1_score      ?? null,
    s2_score:      null,
    s5_score:      null,
    s6_score:      userData?.s6_score      ?? null,
    s7_score:      userData?.s7_score      ?? null,
    s8_score:      userData?.s8_score      ?? null,
    symptom_score: userData?.symptom_score ?? null,
  }

  // 5. Merge updates into existing row, compute scores (§1.10 progressive save)
  const mergedAssessment = { ...existingAssessment, ...updates } as Phase1AssessmentRow

  const tmjRawScore  = calculateTmjRawScore(mergedAssessment, userIntake)
  const cervRawScore = calculateCervRawScore(mergedAssessment, userIntake)
  console.log('[module-2] scores', { tmjRawScore, cervRawScore })

  // 6. UPDATE phase1_assessment — single write per §1.10
  const { data: updateData, error: updateError } = await supabase
    .from('phase1_assessment')
    .update({
      ...updates,
      tmj_raw_score:  tmjRawScore,
      cerv_raw_score: cervRawScore,
      updated_at:     new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .select('user_id')

  console.log('[module-2] update result', {
    rows: updateData?.length ?? 0,
    error: updateError
      ? { code: updateError.code, message: updateError.message }
      : null,
  })

  if (updateError) {
    console.error('[module-2] update failed', updateError)
    return NextResponse.json({ ok: false, message: 'Failed to save assessment.' }, { status: 500 })
  }

  // 7. Sanity-check rows affected — should never fire if SELECT above found a row
  if (!updateData || updateData.length === 0) {
    return NextResponse.json(
      { ok: false, message: 'Phase 1 has not been started.' },
      { status: 409 },
    )
  }

  // 8. Advance session 3 → 4 per Doc 13 §7.8
  try {
    await incrementCurrentSession(user.id, 1, 3)
    console.log('[module-2] session advanced')
  } catch (err) {
    console.error('[module-2] incrementCurrentSession failed', err)
    return NextResponse.json({ ok: false, message: 'Failed to advance session.' }, { status: 500 })
  }

  // 9. Success
  console.log('[module-2] returning 200')
  return NextResponse.json({ ok: true, tmjRawScore, cervRawScore, nextSession: 4 })
}
