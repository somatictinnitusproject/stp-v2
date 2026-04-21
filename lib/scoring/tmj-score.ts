// TMJ raw score calculation — Document 13 §1.3 and §1.4.
// Module maximum: 30 points. 11 indicators.
// NULL evaluates to FALSE and contributes 0 points (§1.11).
//
// Doc 13 §1.4 pseudocode (exact):
//   FUNCTION calculateTmjRawScore(assessment, user):
//     score = 0
//     IF assessment.tmj_jaw_drift = TRUE         score += 4
//     IF user.m1_score > 0                       score += 4
//     IF user.m2_score > 0                       score += 4
//     IF user.s5_score > 0                       score += 4
//     IF assessment.tmj_pterygoid_tenderness = TRUE  score += 4
//     IF assessment.tmj_masseter_asymmetry = TRUE    score += 2
//     IF user.s2_score > 0                       score += 2
//     IF assessment.tmj_opening_restriction = TRUE   score += 2
//     IF assessment.tmj_worse_after_chewing = TRUE   score += 2
//     // Overlapping indicators (§1.2):
//     IF assessment.tmj_daytime_clenching IS NOT NULL
//       IF assessment.tmj_daytime_clenching = TRUE   score += 1
//     ELSE IF user.s1_score > 0                  score += 1
//     IF assessment.tmj_pain_eating IS NOT NULL
//       IF assessment.tmj_pain_eating = TRUE          score += 1
//     ELSE IF user.s6_score > 0                  score += 1
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
  if (assessment.tmj_jaw_drift === true)        score += 4
  if ((user.m1_score ?? 0) > 0)                score += 4
  if ((user.m2_score ?? 0) > 0)                score += 4
  if ((user.s5_score ?? 0) > 0)                score += 4
  if (assessment.tmj_pterygoid_tenderness === true) score += 4

  // ── Moderate — 2 points each ─────────────────────────────────────────────
  if (assessment.tmj_masseter_asymmetry === true)   score += 2
  if ((user.s2_score ?? 0) > 0)                     score += 2
  if (assessment.tmj_opening_restriction === true)  score += 2
  if (assessment.tmj_worse_after_chewing === true)  score += 2

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
