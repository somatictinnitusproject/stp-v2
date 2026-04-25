// Module 1 — TMJ submission handler. POST.
// Called when member clicks "Save and continue" at the bottom of Phase 1 session 2.
//
// Doc 13 §1.10 progressive save pattern:
//   UPDATE phase1_assessment
//   SET <module-1 columns>,
//       tmj_raw_score  = calculateTmjRawScore(assessment),
//       cerv_raw_score = calculateCervRawScore(assessment, user),
//       updated_at     = NOW()
//   WHERE user_id = auth.uid()
//
// Doc 13 §1.11 NULL handling: NULL columns evaluate to FALSE and contribute 0 points.
// ERRATA E7 collapse rules applied before UPDATE — see handler body.
// ERRATA E9: M1/M2 read directly from phase1_assessment, no intake fallback.
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

// Yes/No/Unsure (jaw drift only) → BOOLEAN | NULL
function collapseYesNoUnsure(val: string): boolean | null {
  if (val === 'yes') return true
  if (val === 'no') return false
  return null // 'unsure'
}

// Yes/Sometimes/No (history) → BOOLEAN: yes + sometimes → TRUE, no → FALSE
function collapseYesSometimesNo(val: string): boolean {
  return val === 'yes' || val === 'sometimes'
}

// ── Payload keys ─────────────────────────────────────────────────────────────

// These must be non-null strings in every valid submission
const REQUIRED_PRIMARY_KEYS = [
  'tmj_m1_jaw_opening',
  'tmj_m2_jaw_protrusion',
  'tmj_jaw_drift',
  'tmj_masseter_asymmetry',
  'tmj_pterygoid_tenderness',
  'tmj_joint_sounds',
  'tmj_opening_restriction',
  'tmj_morning_soreness',
  'tmj_daytime_clenching',
  'tmj_pain_eating',
  'tmj_worse_after_chewing',
  'ctx_orthodontic_history',
  'ctx_dental_extractions',
  'ctx_jaw_surgery',
  'ctx_jaw_injury',
] as const

// These are always sent from the client but may be null (direction/side)
const NULLABLE_SECONDARY_KEYS = [
  'tmj_jaw_drift_direction',
  'tmj_masseter_dominant_side',
  'tmj_pterygoid_tender_side',
] as const

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  console.log('[module-1] POST received')

  // 1. Auth
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  console.log('[module-1] auth', { userId: user?.id ?? null, authError })
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
      console.log('[module-1] 400 missing key', key)
      return NextResponse.json({ ok: false, message: 'Missing required fields.' }, { status: 400 })
    }
  }
  for (const key of NULLABLE_SECONDARY_KEYS) {
    if (!(key in body)) {
      console.log('[module-1] 400 missing secondary key', key)
      return NextResponse.json({ ok: false, message: 'Missing required fields.' }, { status: 400 })
    }
  }

  // Narrow types after validation
  const b = body as Record<(typeof REQUIRED_PRIMARY_KEYS)[number], string> &
    Record<(typeof NULLABLE_SECONDARY_KEYS)[number], string | null>

  // 3. Apply E7 collapse rules
  const updates = {
    tmj_m1_jaw_opening:          collapseYesNo(b.tmj_m1_jaw_opening),
    tmj_m2_jaw_protrusion:       collapseYesNo(b.tmj_m2_jaw_protrusion),
    tmj_jaw_drift:               collapseYesNoUnsure(b.tmj_jaw_drift),
    tmj_jaw_drift_direction:     b.tmj_jaw_drift === 'yes' ? (b.tmj_jaw_drift_direction ?? null) : null,
    tmj_masseter_asymmetry:      collapseYesNo(b.tmj_masseter_asymmetry),
    tmj_masseter_dominant_side:  b.tmj_masseter_asymmetry === 'yes' ? (b.tmj_masseter_dominant_side ?? null) : null,
    tmj_pterygoid_tenderness:    collapseYesNo(b.tmj_pterygoid_tenderness),
    tmj_pterygoid_tender_side:   b.tmj_pterygoid_tenderness === 'yes' ? (b.tmj_pterygoid_tender_side ?? null) : null,
    tmj_joint_sounds:            collapseYesNo(b.tmj_joint_sounds),
    tmj_opening_restriction:     collapseYesNo(b.tmj_opening_restriction),
    tmj_morning_soreness:        collapseYesSometimesNo(b.tmj_morning_soreness),
    tmj_daytime_clenching:       collapseYesSometimesNo(b.tmj_daytime_clenching),
    tmj_pain_eating:             collapseYesSometimesNo(b.tmj_pain_eating),
    tmj_worse_after_chewing:     collapseYesSometimesNo(b.tmj_worse_after_chewing),
    ctx_orthodontic_history:     collapseYesNo(b.ctx_orthodontic_history),
    ctx_dental_extractions:      collapseYesNo(b.ctx_dental_extractions),
    ctx_jaw_surgery:             collapseYesNo(b.ctx_jaw_surgery),
    ctx_jaw_injury:              collapseYesNo(b.ctx_jaw_injury),
  }

  // 4. Fetch existing assessment row — 409 if missing (B.1 not completed)
  const { data: existingAssessment, error: fetchError } = await supabase
    .from('phase1_assessment')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  console.log('[module-1] assessment fetch', { found: !!existingAssessment, fetchError })

  if (fetchError) {
    console.error('[module-1] assessment fetch failed', fetchError)
    return NextResponse.json({ ok: false, message: 'Failed to load assessment.' }, { status: 500 })
  }

  if (!existingAssessment) {
    return NextResponse.json(
      { ok: false, message: 'Phase 1 has not been started. Return to Phase 1 opening.' },
      { status: 409 },
    )
  }

  // Fetch intake columns needed for cerv and TMJ overlapping indicators
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
  console.log('[module-1] scores', { tmjRawScore, cervRawScore })

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

  console.log('[module-1] update result', {
    rows: updateData?.length ?? 0,
    error: updateError
      ? { code: updateError.code, message: updateError.message }
      : null,
  })

  if (updateError) {
    console.error('[module-1] update failed', updateError)
    return NextResponse.json({ ok: false, message: 'Failed to save assessment.' }, { status: 500 })
  }

  // 7. Sanity-check rows affected — should never fire if SELECT above found a row
  if (!updateData || updateData.length === 0) {
    return NextResponse.json(
      { ok: false, message: 'Phase 1 has not been started. Return to Phase 1 opening.' },
      { status: 409 },
    )
  }

  // 8. Advance session 2 → 3 per Doc 13 §7.8
  try {
    await incrementCurrentSession(user.id, 1, 2)
    console.log('[module-1] session advanced')
  } catch (err) {
    console.error('[module-1] incrementCurrentSession failed', err)
    return NextResponse.json({ ok: false, message: 'Failed to advance session.' }, { status: 500 })
  }

  // 9. Success
  console.log('[module-1] returning 200')
  return NextResponse.json({ ok: true, tmjRawScore, cervRawScore, nextSession: 3 })
}
