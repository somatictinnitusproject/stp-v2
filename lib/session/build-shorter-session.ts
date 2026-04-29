// /lib/session/build-shorter-session.ts
// ─────────────────────────────────────────────────────────────────────────────
// Pure helper: returns the fixed shorter-session exercise list for a
// Phase 3 member based on their protocol assignments.
//
// No day-of-week rotation (M13i locked decision). Each profile gets one
// fixed list of highest-evidence anchor exercises:
//
//   TMJ-only:    masseter + intraoral pterygoid           (~7 min)
//   Cervical:    suboccipital + SCM + levator scapulae    (~13 min)
//   Dual-driver: masseter + suboccipital                  (~10 min)
//
// Resistance work and Phase 4 add-ons are NOT included in shorter sessions.
//
// Low-confidence members: both tmj_protocol_assigned and cerv_protocol_assigned
// are TRUE at runtime per P3-12, so the dual-driver branch covers them —
// no separate low-confidence handling needed here.
// ─────────────────────────────────────────────────────────────────────────────

import type { FrameworkProgressRow, Phase1AssessmentRow } from '@/lib/scoring/types'

export function buildShorterSessionExerciseList(
  framework: FrameworkProgressRow,
  assessment: Phase1AssessmentRow,
): string[] {
  const tmjAssigned = assessment.tmj_protocol_assigned === true
  const cervAssigned = assessment.cerv_protocol_assigned === true

  if (tmjAssigned && cervAssigned) {
    // Dual-driver (and low-confidence, which sets both true at runtime per P3-12)
    return [
      'D6_masseter_release',
      'E5_suboccipital_tennis_ball',
    ]
  }

  if (tmjAssigned) {
    return [
      'D6_masseter_release',
      'D7_intraoral_pterygoid_release',
    ]
  }

  if (cervAssigned) {
    return [
      'E5_suboccipital_tennis_ball',
      'E6_scm_stretching',
      'E7_levator_scapulae_stretching',
    ]
  }

  // Defensive: no protocol assigned — return empty list
  // (shouldn't happen for any seeded test user)
  return []
}

/**
 * Override estimatedMinutes for the shorter-session context.
 * E5 (suboccipital tennis ball) drops to 5 min in shorter sessions
 * (down from the full-session 10 min). All other exercises use their
 * lookup-defined duration.
 */
export function getShorterSessionDuration(exerciseId: string, defaultMinutes: number): number {
  if (exerciseId === 'E5_suboccipital_tennis_ball') return 5
  return defaultMinutes
}
