// Cervical raw score calculation — Document 13 §1.6 and §1.7.
// Module maximum: 25 points. 10 indicators. Every indicator is binary.
// NULL evaluates to FALSE and contributes 0 points (§1.11).
// SCM and upper trapezius share one 2-point slot (OR logic, not additive — §1.7).
//
// ERRATA E13: M3/M4/M5 switched from intake user.m3_score/m4_score/m4_asymmetric/m5_score
//   to live Phase 1 fields. V1 intake never persisted individual M/S scores — those columns
//   are always NULL for V2 members. Point values unchanged.
// ERRATA E16: Floor lying relief test removed from Module 2 entirely. Graduated scoring
//   (§1.6) no longer applies. cerv_floor_relief_test column dropped from phase1_assessment.
//   CERVICAL_MODULE_MAXIMUM updated from 28 → 25. See ERRATA_AND_BUILD_INSTRUCTIONS.md.
// Overlapping indicator rule (§1.2) stays for S7/S8 — those work correctly.
//
// Updated pseudocode:
//   FUNCTION calculateCervRawScore(assessment, user):
//     score = 0
//     IF assessment.cerv_m3_neck_curl = TRUE             score += 4
//     IF assessment.cerv_m4_head_rotation = TRUE         score += 4
//     // cerv_m4_asymmetric_side is a separate flag — does not add additional points
//     IF assessment.cerv_suboccipital_tenderness = TRUE  score += 4
//     IF assessment.cerv_worse_desk_work = TRUE          score += 3
//     IF assessment.cerv_m5_chin_tuck = TRUE             score += 2
//     IF assessment.cerv_rotation_restriction = TRUE     score += 2
//     IF assessment.cerv_scm_asymmetry = TRUE OR assessment.cerv_trap_asymmetry = TRUE  score += 2
//     IF assessment.cerv_forward_head_posture = TRUE     score += 2
//     // Overlapping indicators (§1.2):
//     IF assessment.cerv_neck_pain IS NOT NULL
//       IF assessment.cerv_neck_pain = TRUE              score += 1
//     ELSE IF user.s7_score > 0                         score += 1
//     IF assessment.cerv_cervicogenic_headaches IS NOT NULL
//       IF assessment.cerv_cervicogenic_headaches = TRUE score += 1
//     ELSE IF user.s8_score > 0                         score += 1
//     RETURN score  // Range: 0-25

import { SCORING_THRESHOLDS } from '@/content/scoring-thresholds'
import type { Phase1AssessmentRow, UserIntakeRow } from './types'

export function calculateCervRawScore(
  assessment: Phase1AssessmentRow,
  user: UserIntakeRow,
): number {
  void SCORING_THRESHOLDS.CERVICAL_MODULE_MAXIMUM // 25 — enforces import; normalise.ts uses it
  let score = 0

  // ── High specificity — 4 points each ────────────────────────────────────
  if (assessment.cerv_m3_neck_curl === true)            score += 4  // E13: live Phase 1 test
  if (assessment.cerv_m4_head_rotation === true)        score += 4  // E13: live Phase 1 test
  // cerv_m4_asymmetric_side is a separate flag for profile output — does not add points (§1.7)
  if (assessment.cerv_suboccipital_tenderness === true) score += 4

  // ── Moderate-high — 3 points ─────────────────────────────────────────────
  if (assessment.cerv_worse_desk_work === true) score += 3

  // ── Moderate — 2 points each ─────────────────────────────────────────────
  if (assessment.cerv_m5_chin_tuck === true)            score += 2  // E13: live Phase 1 test
  if (assessment.cerv_rotation_restriction === true)   score += 2

  // SCM and upper trapezius share one 2-point slot — OR, not additive.
  // Either asymmetry finding is sufficient; both together still score 2.
  if (assessment.cerv_scm_asymmetry === true || assessment.cerv_trap_asymmetry === true) {
    score += 2
  }

  if (assessment.cerv_forward_head_posture === true) score += 2

  // ── General — 1 point each (overlapping indicator rule — §1.2) ──────────
  // Neck pain: use Phase 1 answer if answered (NOT NULL), else S7 fallback.
  if (assessment.cerv_neck_pain !== null) {
    if (assessment.cerv_neck_pain === true) score += 1
  } else if ((user.s7_score ?? 0) > 0) {
    score += 1
  }

  // Cervicogenic headaches: same overlapping rule vs S8.
  if (assessment.cerv_cervicogenic_headaches !== null) {
    if (assessment.cerv_cervicogenic_headaches === true) score += 1
  } else if ((user.s8_score ?? 0) > 0) {
    score += 1
  }

  return score // range: 0–25
}
