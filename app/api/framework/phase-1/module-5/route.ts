// Module 5 — Asymmetry & Pattern submission handler. POST.
// Called when member clicks "Save and continue" at the bottom of Phase 1 session 6.
//
// Writes five columns to phase1_assessment:
//   asym_tinnitus_worse_ear (new answer from this module)
//   asym_jaw_drift_direction, asym_masseter_dominant_side,
//   asym_shoulder_elevated_side, asym_scm_dominant_side
//   (copied forward from M1/M2/M3 source columns — asym_contralateral_pattern
//    is NOT set here; generateAndSaveProfile computes and writes it)
//
// After UPDATE succeeds, calls generateAndSaveProfile(userId) which runs the
// full scoring pipeline: raw scores → normalise → classify → edge cases →
// profile paragraph → UPDATE phase1_assessment with profile_type, protocol
// assignments, asym_contralateral_pattern, profile_paragraph, completed_at.
//
// Doc 13 §7.8: incrementCurrentSession called inline after profile generation succeeds.

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { incrementCurrentSession } from '@/lib/framework/advance'
import { generateAndSaveProfile } from '@/lib/scoring/generate-and-save-profile'

// ── Valid enum set ────────────────────────────────────────────────────────────

const VALID_LATERALISATION = new Set(['left', 'right', 'bilateral', 'central', 'unsure'])

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  console.log('[module-5] POST received')

  // 1. Auth
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  console.log('[module-5] auth', { userId: user?.id ?? null, authError })
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  // 2. Parse body
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    console.log('[module-5] 400 invalid JSON')
    return NextResponse.json({ ok: false, message: 'Invalid JSON.' }, { status: 400 })
  }

  // 3. Validate
  if (!VALID_LATERALISATION.has(body.tinnitus_lateralisation as string)) {
    console.log('[module-5] 400 missing key tinnitus_lateralisation')
    return NextResponse.json({ ok: false, message: 'Missing required fields.' }, { status: 400 })
  }

  console.log('[module-5] validation passed')

  const b = body as Record<string, string>

  // 4. Fetch existing assessment row with source columns for asym_* writes
  const { data: assessment, error: fetchError } = await supabase
    .from('phase1_assessment')
    .select('user_id, tmj_jaw_drift_direction, tmj_masseter_dominant_side, post_elevated_side, cerv_scm_dominant_side')
    .eq('user_id', user.id)
    .maybeSingle()

  console.log('[module-5] assessment fetch', { found: !!assessment, fetchError })

  if (fetchError) {
    console.error('[module-5] assessment fetch failed', fetchError)
    return NextResponse.json({ ok: false, message: 'Failed to load assessment.' }, { status: 500 })
  }

  if (!assessment) {
    return NextResponse.json(
      { ok: false, message: 'Phase 1 has not been started.' },
      { status: 409 },
    )
  }

  // 5. Compute asym_* updates from source columns + new question answer
  // NULL source columns produce NULL asym_* values — no asymmetry recorded means no consolidated finding.
  // asym_contralateral_pattern is NOT set here; generateAndSaveProfile computes and writes it.
  const asymUpdates = {
    asym_jaw_drift_direction:    assessment.tmj_jaw_drift_direction,
    asym_masseter_dominant_side: assessment.tmj_masseter_dominant_side,
    asym_shoulder_elevated_side: assessment.post_elevated_side,
    asym_scm_dominant_side:      assessment.cerv_scm_dominant_side,
    asym_tinnitus_worse_ear:     b.tinnitus_lateralisation,
  }

  console.log('[module-5] asym updates', asymUpdates)

  // 6. UPDATE phase1_assessment
  const { data: updateData, error: updateError } = await supabase
    .from('phase1_assessment')
    .update({ ...asymUpdates, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .select('user_id')

  console.log('[module-5] update result', {
    rows: updateData?.length ?? 0,
    error: updateError
      ? { code: updateError.code, message: updateError.message }
      : null,
  })

  if (updateError) {
    console.error('[module-5] update failed', updateError)
    return NextResponse.json({ ok: false, message: 'Failed to save assessment.' }, { status: 500 })
  }

  if (!updateData || updateData.length === 0) {
    return NextResponse.json(
      { ok: false, message: 'Phase 1 has not been started.' },
      { status: 409 },
    )
  }

  // 7. Generate profile — full scoring pipeline runs after asym_* columns are persisted
  let profileType: string
  try {
    const result = await generateAndSaveProfile(user.id)
    profileType = result.profileType
    console.log('[module-5] profile generated', { profileType, assessmentId: result.assessmentId })
  } catch (err) {
    console.error('[module-5] generateAndSaveProfile failed', err)
    return NextResponse.json(
      { ok: false, message: 'Failed to generate profile.' },
      { status: 500 },
    )
  }

  // 8. Advance session 6 → 7
  try {
    await incrementCurrentSession(user.id, 1, 6)
    console.log('[module-5] session advanced')
  } catch (err) {
    console.error('[module-5] incrementCurrentSession failed', err)
    return NextResponse.json({ ok: false, message: 'Failed to advance session.' }, { status: 500 })
  }

  // 9. Success
  console.log('[module-5] returning 200')
  return NextResponse.json({ ok: true, profileType, nextSession: 7 })
}
