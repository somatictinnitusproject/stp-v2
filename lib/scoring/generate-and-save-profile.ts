// Phase 1 completion orchestrator. Called by an API route handler (built in E1b)
// after the user clicks "Confirm profile" at the end of Module 5. Runs the full
// scoring → classification → edge cases → paragraph → persistence pipeline in one
// logical transaction. Does NOT touch framework_progress — that is the Phase 1
// advancement action's job (Doc 13 §7.2), built separately in E1b.
//
// Takes userId as input; auth is the route handler's responsibility (see
// advance-session/route.ts for the pattern). Uses the RLS-scoped authenticated
// client — never service role.

import { createClient } from '@/lib/supabase/server'
import { SCORING_THRESHOLDS } from '@/content/scoring-thresholds'
import { calculateTmjRawScore } from './tmj-score'
import { calculateCervRawScore } from './cerv-score'
import { normaliseTmj, normaliseCerv } from './normalise'
import { classifyProfileType } from './classify'
import type { ProfileType } from './classify'
import { runAllEdgeCaseChecks } from './edge-cases'
import { generateProfileParagraph } from './profile-paragraph'
import type { UserIntakeRow } from './types'
import { triggerPhaseCompletionEmail } from '@/lib/email/phase-emails'

// generateAndSaveProfile — five-step orchestration:
//   1. Load in-progress phase1_assessment row + user intake scores
//   2. Compute raw scores, normalisations, profile type, edge case flags, protocol
//      assignment (with low-confidence override), profile paragraph
//   3. UPDATE phase1_assessment with all computed columns + completed_at
//   4. Fire email stub (fire-and-forget, never awaited)
//   5. Return { profileType, assessmentId }
//
// Errors bubble up. Caller is responsible for HTTP response mapping.

export async function generateAndSaveProfile(
  userId: string,
): Promise<{ profileType: ProfileType; assessmentId: string }> {
  const supabase = await createClient()

  // Step 1 — Load inputs

  const { data: assessments, error: assessmentError } = await supabase
    .from('phase1_assessment')
    .select('*')
    .eq('user_id', userId)
    .is('completed_at', null)

  if (assessmentError) throw assessmentError
  if (!assessments || assessments.length === 0) {
    throw new Error('No in-progress Phase 1 assessment found for user')
  }
  if (assessments.length > 1) {
    throw new Error('Multiple in-progress Phase 1 assessments — data integrity issue')
  }
  const assessment = assessments[0]

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('symptom_score') // E20: s1/s6/s7/s8 also never existed on users — V1 intake only persisted aggregates. Granular intake columns Doc 7 specified were never built. symptom_score exists and is read by checkLowConfidenceEdgeCase; everything else is dead.
    .eq('id', userId)
    .maybeSingle()

  if (userError) throw userError
  if (!user) throw new Error('User row not found')

  // E20: s1/s6/s7/s8 columns never existed on users — V1 intake only persisted
  //   aggregate scores. The S-column intake fallbacks in tmj-score.ts and
  //   cerv-score.ts are dead code post-erratum (Phase 1 routes validate the
  //   overlapping-indicator questions, so the NULL-in-assessment fallback
  //   path no longer fires in practice). Setting all S-columns to null below.
  //   symptom_score is the only intake field still read (by checkLowConfidenceEdgeCase).
  const userIntake: UserIntakeRow = {
    m1_score:      null,
    m2_score:      null,
    m3_score:      null,
    m4_score:      null,
    m4_asymmetric: null,
    m5_score:      null,
    s1_score:      null,
    s2_score:      null,
    s5_score:      null,
    s6_score:      null,
    s7_score:      null,
    s8_score:      null,
    symptom_score: user.symptom_score ?? null,
  }

  // Step 2 — Compute derived values

  const tmjRaw  = calculateTmjRawScore(assessment, userIntake)
  const cervRaw = calculateCervRawScore(assessment, userIntake)
  const tmjNorm  = normaliseTmj(tmjRaw)
  const cervNorm = normaliseCerv(cervRaw)
  const profileType = classifyProfileType(tmjNorm, cervNorm)
  const edgeCaseFlags = runAllEdgeCaseChecks(assessment, userIntake, tmjNorm, cervNorm)

  const tmjProtocolAssigned = edgeCaseFlags.lowConfidence !== null
    ? true
    : tmjNorm >= SCORING_THRESHOLDS.PROTOCOL_ASSIGNMENT_MINIMUM

  const cervProtocolAssigned = edgeCaseFlags.lowConfidence !== null
    ? true
    : cervNorm >= SCORING_THRESHOLDS.PROTOCOL_ASSIGNMENT_MINIMUM

  // Overlay newly-computed fields onto assessment for paragraph generation.
  // These overlay fields are what Section 1-6 generators read; writing them
  // directly to the local object avoids a round-trip through the DB.
  const assessmentForParagraph = {
    ...assessment,
    profile_type: profileType,
    tmj_protocol_assigned: tmjProtocolAssigned,
    cerv_protocol_assigned: cervProtocolAssigned,
    asym_contralateral_pattern: edgeCaseFlags.contralateralPattern,
  }

  const paragraph = generateProfileParagraph({
    assessment: assessmentForParagraph,
    user: userIntake,
    tmjNorm,
    cervNorm,
    edgeCaseFlags,
  })

  // Step 3 — Persist. Single UPDATE. user_id filter is defensive — RLS already
  // scopes this client to the user's own rows.

  const { data: updated, error: updateError } = await supabase
    .from('phase1_assessment')
    .update({
      tmj_raw_score: tmjRaw,
      tmj_normalised_score: tmjNorm,
      cerv_raw_score: cervRaw,
      cerv_normalised_score: cervNorm,
      profile_type: profileType,
      tmj_protocol_assigned: tmjProtocolAssigned,
      cerv_protocol_assigned: cervProtocolAssigned,
      asym_contralateral_pattern: edgeCaseFlags.contralateralPattern,
      profile_paragraph: paragraph,
      completed_at: new Date().toISOString(),
    })
    .eq('id', assessment.id)
    .eq('user_id', userId)
    .select('id')
    .single()

  if (updateError) throw updateError
  if (!updated) throw new Error('Assessment update returned no row')

  // Step 4 — Fire email stub. Never awaited; never allowed to throw out of this
  // function. Phase I will replace the stub; signature is stable.

  void triggerPhaseCompletionEmail(userId, 1).catch(err => {
    console.warn('[generate-and-save-profile] phase completion email failed', err)
  })

  // Step 5 — Return

  return { profileType, assessmentId: updated.id }
}
