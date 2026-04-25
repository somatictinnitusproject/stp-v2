// TMJ raw score calculation — Document 13 §1.3 and §1.4.
// Module maximum: 30 points. 11 indicators.
// NULL evaluates to FALSE and contributes 0 points (§1.11).
//
// ERRATA E9: M1/M2 switched from intake user.m1_score/m2_score to live Phase 1 fields.
// ERRATA E12: S5 (joint sounds) and S2 (morning soreness) switched from intake
//   user.s5_score/s2_score to live Phase 1 fields. V1 intake never persisted individual
//   M/S scores — those columns are always NULL for V2 members. Point values unchanged.
// Overlapping indicator rule (§1.2) stays for S1/S6 — those work correctly.
//
// Updated pseudocode:
//   FUNCTION calculateTmjRawScore(assessment, user):
//     score = 0
//     IF assessment.tmj_jaw_drift = TRUE              score += 4
//     IF assessment.tmj_m1_jaw_opening = TRUE         score += 4
//     IF assessment.tmj_m2_jaw_protrusion = TRUE      score += 4
//     IF assessment.tmj_joint_sounds = TRUE           score += 4
//     IF assessment.tmj_pterygoid_tenderness = TRUE   score += 4
//     IF assessment.tmj_masseter_asymmetry = TRUE     score += 2
//     IF assessment.tmj_morning_soreness = TRUE       score += 2
//     IF assessment.tmj_opening_restriction = TRUE    score += 2
//     IF assessment.tmj_worse_after_chewing = TRUE    score += 2
//     // Overlapping indicators (§1.2):
//     IF assessment.tmj_daytime_clenching IS NOT NULL
//       IF assessment.tmj_daytime_clenching = TRUE    score += 1
//     ELSE IF user.s1_score > 0                       score += 1
//     IF assessment.tmj_pain_eating IS NOT NULL
//       IF assessment.tmj_pain_eating = TRUE          score += 1
//     ELSE IF user.s6_score > 0                       score += 1
//     RETURN score  // Range: 0-30

import { SCORING_THRESHOLDS } from '@/content/scoring-thresholds'
import type { Phase1AssessmentRow, UserIntakeRow } from './types'

export function calculateTmjRawScore(
  assessment: Phase1AssessmentRow,
  user: UserIntakeRow,
): number {
  void SCORING_THRESHOLDS.TMJ_MODULE_MAXIMUM // 30 — enforces import; normalise.ts uses it
  let score = 0

  // ── High specificity — 4 points each ────────────────────────────────────
  if (assessment.tmj_jaw_drift === true)              score += 4
  if (assessment.tmj_m1_jaw_opening === true)         score += 4  // D1: live Phase 1 test
  if (assessment.tmj_m2_jaw_protrusion === true)      score += 4  // D1: live Phase 1 test
  if (assessment.tmj_joint_sounds === true)            score += 4  // E12: live Phase 1 test
  if (assessment.tmj_pterygoid_tenderness === true)   score += 4

  // ── Moderate — 2 points each ─────────────────────────────────────────────
  if (assessment.tmj_masseter_asymmetry === true)     score += 2
  if (assessment.tmj_morning_soreness === true)        score += 2  // E12: live Phase 1 test
  if (assessment.tmj_opening_restriction === true)    score += 2
  if (assessment.tmj_worse_after_chewing === true)    score += 2

  // ── General — 1 point each (overlapping indicator rule — §1.2) ──────────
  // Daytime clenching: use Phase 1 answer if answered (NOT NULL), else S1 fallback.
  // Phase 1 FALSE overrides a positive S1 — no double-counting.
  if (assessment.tmj_daytime_clenching !== null) {
    if (assessment.tmj_daytime_clenching === true) score += 1
  } else if ((user.s1_score ?? 0) > 0) {
    score += 1
  }

  // Jaw pain eating/yawning: same overlapping rule vs S6.
  if (assessment.tmj_pain_eating !== null) {
    if (assessment.tmj_pain_eating === true) score += 1
  } else if ((user.s6_score ?? 0) > 0) {
    score += 1
  }

  return score // range: 0–30
}
