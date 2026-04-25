// Module 3 — Postural submission handler. POST.
// Called when member clicks "Save and continue" at the bottom of Phase 1 session 4.
//
// Module 3 produces NO score — five post_* flag columns only.
// Doc 13 §1.10 progressive save pattern (no score recompute needed):
//   UPDATE phase1_assessment
//   SET post_shoulder_asymmetry, post_elevated_side, post_dominant_chewing_side,
//       post_sustained_desk_load, post_asymmetric_exercise, updated_at = NOW()
//   WHERE user_id = auth.uid()
//
// Client sends raw UI-state strings. Route collapses 'yes'/'no' → boolean,
// builds PosturalUiState, then calls derivePosturalSubmitPayload to produce the
// five-column write payload. No intake row fetch needed (no scoring).
// Doc 13 §7.8: incrementCurrentSession called inline after UPDATE succeeds.

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  derivePosturalSubmitPayload,
  type PosturalUiState,
} from '@/content/framework/phase-1/b4-module-3-postural'
import { incrementCurrentSession } from '@/lib/framework/advance'

// ── E7 collapse helper ────────────────────────────────────────────────────────

// Yes/No → BOOLEAN (no unsure, no sometimes for M3 primary fields)
function collapseYesNo(val: string): boolean {
  return val === 'yes'
}

// ── Valid enum sets ───────────────────────────────────────────────────────────

const VALID_ASYMMETRY    = new Set(['yes', 'no'])
const VALID_CHEWING_SIDE = new Set(['left', 'right', 'no_preference'])
const VALID_SITTING      = new Set(['Less than 2', '2\u20134 hours', '4\u20136 hours', 'More than 6 hours'])
const VALID_WORK_PATTERN = new Set(['yes', 'no', 'sometimes'])
const VALID_SPORT        = new Set(['yes', 'no'])
const VALID_SIDE         = new Set(['left', 'right'])

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  console.log('[module-3] POST received')

  // 1. Auth
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  console.log('[module-3] auth', { userId: user?.id ?? null, authError })
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  // 2. Parse body
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    console.log('[module-3] 400 invalid JSON')
    return NextResponse.json({ ok: false, message: 'Invalid JSON.' }, { status: 400 })
  }

  // 3. Validate primary keys
  if (!VALID_ASYMMETRY.has(body.post_shoulder_asymmetry as string)) {
    console.log('[module-3] 400 missing key post_shoulder_asymmetry')
    return NextResponse.json({ ok: false, message: 'Missing required fields.' }, { status: 400 })
  }
  if (!VALID_CHEWING_SIDE.has(body.post_dominant_chewing_side as string)) {
    console.log('[module-3] 400 missing key post_dominant_chewing_side')
    return NextResponse.json({ ok: false, message: 'Missing required fields.' }, { status: 400 })
  }
  if (!VALID_SITTING.has(body.ui_sustained_sitting as string)) {
    console.log('[module-3] 400 missing key ui_sustained_sitting')
    return NextResponse.json({ ok: false, message: 'Missing required fields.' }, { status: 400 })
  }
  if (!VALID_WORK_PATTERN.has(body.ui_one_sided_work as string)) {
    console.log('[module-3] 400 missing key ui_one_sided_work')
    return NextResponse.json({ ok: false, message: 'Missing required fields.' }, { status: 400 })
  }
  if (!VALID_SPORT.has(body.ui_one_sided_sport as string)) {
    console.log('[module-3] 400 missing key ui_one_sided_sport')
    return NextResponse.json({ ok: false, message: 'Missing required fields.' }, { status: 400 })
  }

  // 4. Validate post_elevated_side — must be present in body; conditional on asymmetry
  if (!('post_elevated_side' in body)) {
    console.log('[module-3] 400 missing key post_elevated_side')
    return NextResponse.json({ ok: false, message: 'Missing required fields.' }, { status: 400 })
  }
  const asymmetryRaw = body.post_shoulder_asymmetry as string
  const elevatedSideRaw = body.post_elevated_side as string | null
  if (asymmetryRaw === 'yes' && !VALID_SIDE.has(elevatedSideRaw as string)) {
    console.log('[module-3] 400 invalid asymmetry side — asymmetry yes but side missing/invalid')
    return NextResponse.json({ ok: false, message: 'Invalid asymmetry side.' }, { status: 400 })
  }
  if (asymmetryRaw === 'no' && elevatedSideRaw !== null) {
    console.log('[module-3] 400 invalid asymmetry side — asymmetry no but side non-null')
    return NextResponse.json({ ok: false, message: 'Invalid asymmetry side.' }, { status: 400 })
  }

  // Narrow types after validation
  const b = body as {
    post_shoulder_asymmetry: string
    post_elevated_side: string | null
    post_dominant_chewing_side: string
    ui_sustained_sitting: string
    ui_one_sided_work: string
    ui_one_sided_sport: string
  }

  // 5. Fetch existing assessment row — 409 if missing (B.1 not completed)
  const { data: existingAssessment, error: fetchError } = await supabase
    .from('phase1_assessment')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  console.log('[module-3] assessment fetch', { found: !!existingAssessment, fetchError })

  if (fetchError) {
    console.error('[module-3] assessment fetch failed', fetchError)
    return NextResponse.json({ ok: false, message: 'Failed to load assessment.' }, { status: 500 })
  }

  if (!existingAssessment) {
    return NextResponse.json(
      { ok: false, message: 'Phase 1 has not been started.' },
      { status: 409 },
    )
  }

  // 6. Collapse + derive — build PosturalUiState and call derivePosturalSubmitPayload
  const uiState: PosturalUiState = {
    post_shoulder_asymmetry:    collapseYesNo(b.post_shoulder_asymmetry),
    post_elevated_side:         b.post_elevated_side,
    post_dominant_chewing_side: b.post_dominant_chewing_side,
    ui_sustained_sitting:       b.ui_sustained_sitting,
    ui_one_sided_work:          b.ui_one_sided_work,
    ui_one_sided_sport:         b.ui_one_sided_sport,
  }

  const updates = derivePosturalSubmitPayload(uiState)
  console.log('[module-3] derived updates', updates)

  // 7. UPDATE phase1_assessment — five post_* columns + updated_at
  const { data: updateData, error: updateError } = await supabase
    .from('phase1_assessment')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .select('user_id')

  console.log('[module-3] update result', {
    rows: updateData?.length ?? 0,
    error: updateError
      ? { code: updateError.code, message: updateError.message }
      : null,
  })

  if (updateError) {
    console.error('[module-3] update failed', updateError)
    return NextResponse.json({ ok: false, message: 'Failed to save assessment.' }, { status: 500 })
  }

  // Defensive — shouldn't fire after SELECT above succeeded
  if (!updateData || updateData.length === 0) {
    return NextResponse.json(
      { ok: false, message: 'Phase 1 has not been started.' },
      { status: 409 },
    )
  }

  // 8. Advance session 4 → 5 per Doc 13 §7.8
  try {
    await incrementCurrentSession(user.id, 1, 4)
    console.log('[module-3] session advanced')
  } catch (err) {
    console.error('[module-3] incrementCurrentSession failed', err)
    return NextResponse.json({ ok: false, message: 'Failed to advance session.' }, { status: 500 })
  }

  // 9. Success — no scores to return (M3 is unscored)
  console.log('[module-3] returning 200')
  return NextResponse.json({ ok: true, nextSession: 5 })
}
