// Cervical raw score calculation — Document 13 §1.6 and §1.7.
// Module maximum: 28 points. 11 indicators.
// NULL evaluates to FALSE and contributes 0 points (§1.11).
// cerv_floor_relief_test is VARCHAR(10) per ERRATA A1 — graduated scoring.
// SCM and upper trapezius share one 2-point slot (OR logic, not additive — §1.7).
//
// Doc 13 §1.7 pseudocode (exact):
//   FUNCTION calculateCervRawScore(assessment, user):
//     score = 0
//     IF user.m3_score > 0                           score += 4
//     IF user.m4_score > 0                           score += 4
//     // m4_asymmetric is a separate flag — does not add additional points
//     IF assessment.cerv_suboccipital_tenderness = TRUE  score += 4
//     IF assessment.cerv_floor_relief_test = 'clear'     score += 3
//     ELSE IF assessment.cerv_floor_relief_test = 'slight'  score += 1
//     // 'none' or NULL: score += 0
//     IF assessment.cerv_worse_desk_work = TRUE       score += 3
//     IF user.m5_score > 0                           score += 2
//     IF assessment.cerv_rotation_restriction = TRUE  score += 2
//     IF assessment.cerv_scm_asymmetry = TRUE OR assessment.cerv_trap_asymmetry = TRUE  score += 2
//     IF assessment.cerv_forward_head_posture = TRUE  score += 2
//     // Overlapping indicators (§1.2):
//     IF assessment.cerv_neck_pain IS NOT NULL
//       IF assessment.cerv_neck_pain = TRUE           score += 1
//     ELSE IF user.s7_score > 0                      score += 1
//     IF assessment.cerv_cervicogenic_headaches IS NOT NULL
//       IF assessment.cerv_cervicogenic_headaches = TRUE  score += 1
//     ELSE IF user.s8_score > 0                      score += 1
//     RETURN score  // Range: 0-28

import { SCORING_THRESHOLDS } from '@/content/scoring-thresholds'
import type { Phase1AssessmentRow, UserIntakeRow } from './types'

export function calculateCervRawScore(
  assessment: Phase1AssessmentRow,
  user: UserIntakeRow,
): number {
  void SCORING_THRESHOLDS.CERVICAL_MODULE_MAXIMUM // 28 — enforces import; normalise.ts uses it
  let score = 0

  // ── High specificity — 4 points each ────────────────────────────────────
  if ((user.m3_score ?? 0) > 0)                        score += 4
  if ((user.m4_score ?? 0) > 0)                        score += 4
  // m4_asymmetric is a separate flag for profile output — does not add points (§1.7 note)
  if (assessment.cerv_suboccipital_tenderness === true) score += 4

  // ── Floor lying relief test — graduated, mutually exclusive (§1.6) ───────
  if (assessment.cerv_floor_relief_test === 'clear') {
    score += 3
  } else if (assessment.cerv_floor_relief_test === 'slight') {
    score += 1
  }
  // 'none' or NULL: score += 0

  // ── Moderate-high — 3 points ─────────────────────────────────────────────
  if (assessment.cerv_worse_desk_work === true) score += 3

  // ── Moderate — 2 points each ─────────────────────────────────────────────
  if ((user.m5_score ?? 0) > 0)                        score += 2
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

  return score // range: 0–28
}
