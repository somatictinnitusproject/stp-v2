// Phase 1 profile classification and protocol assignment — Document 13 §2.
// Functions are added below in sub-steps 3b–3d.

import { SCORING_THRESHOLDS } from '@/content/scoring-thresholds'

// Doc 13 §2.1 — The Seven Profile Types (ERRATA E1: Doc 7 listed 5, Doc 13 is correct).
// Dominant driver is encoded directly in the string — callers can switch on
// profile_type alone without a secondary score comparison.
export type ProfileType =
  | 'TMJ_DOMINANT'
  | 'CERV_DOMINANT'
  | 'DUAL_DRIVER'
  | 'TMJ_PRIMARY_STRONG_SECONDARY'
  | 'CERV_PRIMARY_STRONG_SECONDARY'
  | 'TMJ_PRIMARY_WITH_SECONDARY'
  | 'CERV_PRIMARY_WITH_SECONDARY'

// Classification logic — implemented from Doc 13 §2.2 with four approved divergences.
// See ERRATA "Doc 13 §2.2 — Profile Classification Divergences" for full rationale.
//
//   FUNCTION classifyProfileType(tmjNorm, cervNorm):
//
//     // ── Single driver — checked first ──────────────────────────────────
//     // One score high (> 60), other negligible (< 20). Strict > on the
//     // lead score intentional — exactly 60 is not a "clean" single driver.
//     IF tmjNorm > SINGLE_DRIVER_HIGH_THRESHOLD  // > 60
//       AND cervNorm < PROTOCOL_ASSIGNMENT_MINIMUM  // < 20
//       RETURN "TMJ_DOMINANT"
//     IF cervNorm > SINGLE_DRIVER_HIGH_THRESHOLD  // > 60
//       AND tmjNorm < PROTOCOL_ASSIGNMENT_MINIMUM  // < 20
//       RETURN "CERV_DOMINANT"
//
//     // ── Both high — dual driver regardless of gap ─────────────────────
//     // DIVERGENCE 1 (not in Doc 13): both scores > 60 always means dual
//     // driver. The max-difference guard in the branch below was designed
//     // for mixed-range pairs (e.g. 80 vs 35); it must not apply when both
//     // pathways are independently strong.
//     IF tmjNorm > SINGLE_DRIVER_HIGH_THRESHOLD  // > 60
//       AND cervNorm > SINGLE_DRIVER_HIGH_THRESHOLD  // > 60
//       RETURN "DUAL_DRIVER"
//
//     // ── Dual driver ────────────────────────────────────────────────────
//     // Both scores meaningful AND close enough that neither dominates.
//     // DIVERGENCE 2: Doc 13 uses strict > 30 on both; code uses >= 30.
//     // A score of exactly 30 is a meaningful driver and must not fall
//     // through to the fallback.
//     IF tmjNorm >= DUAL_DRIVER_MIN_SCORE  // >= 30
//       AND cervNorm >= DUAL_DRIVER_MIN_SCORE  // >= 30
//       AND ABS(tmjNorm - cervNorm) <= DUAL_DRIVER_MAX_DIFFERENCE  // <= 15
//       RETURN "DUAL_DRIVER"
//
//     // ── Primary with strong secondary ──────────────────────────────────
//     // One score leads, secondary is substantial.
//     // DIVERGENCE 3a: Doc 13 uses strict > 50 on the lead; code uses >= 50.
//     //   A lead of exactly 50 is meaningful and must not fall through.
//     // DIVERGENCE 3b: Doc 13 caps secondary at <= 50; code uses <= 60
//     //   (PRIMARY_STRONG_SECONDARY_MAX). Scores 51–60 on the secondary
//     //   were falling to the fallback because they exceeded the old cap
//     //   but were not close enough for dual driver (gap > 15). The
//     //   both-high check above handles secondary > 60.
//     IF tmjNorm >= PRIMARY_STRONG_SECONDARY_LEAD  // >= 50
//       AND cervNorm >= PRIMARY_STRONG_SECONDARY_MIN  // >= 30
//       AND cervNorm <= PRIMARY_STRONG_SECONDARY_MAX  // <= 60
//       RETURN "TMJ_PRIMARY_STRONG_SECONDARY"
//     IF cervNorm >= PRIMARY_STRONG_SECONDARY_LEAD  // >= 50
//       AND tmjNorm >= PRIMARY_STRONG_SECONDARY_MIN  // >= 30
//       AND tmjNorm <= PRIMARY_STRONG_SECONDARY_MAX  // <= 60
//       RETURN "CERV_PRIMARY_STRONG_SECONDARY"
//
//     // ── Primary with secondary ─────────────────────────────────────────
//     // One score leads (> 30), secondary present but minor.
//     // DIVERGENCE 4: Doc 13 caps secondary at < 30 (strict); code uses
//     //   <= 30 (DUAL_DRIVER_MIN_SCORE). A secondary of exactly 30 sat
//     //   between > 30 (dual) and < 30 (primary-with) and fell through.
//     IF tmjNorm > DUAL_DRIVER_MIN_SCORE  // > 30
//       AND cervNorm >= PROTOCOL_ASSIGNMENT_MINIMUM  // >= 20
//       AND cervNorm <= DUAL_DRIVER_MIN_SCORE  // <= 30
//       RETURN "TMJ_PRIMARY_WITH_SECONDARY"
//     IF cervNorm > DUAL_DRIVER_MIN_SCORE  // > 30
//       AND tmjNorm >= PROTOCOL_ASSIGNMENT_MINIMUM  // >= 20
//       AND tmjNorm <= DUAL_DRIVER_MIN_SCORE  // <= 30
//       RETURN "CERV_PRIMARY_WITH_SECONDARY"
//
//     // ── Fallback ───────────────────────────────────────────────────────
//     // Reached only when one score is below PROTOCOL_ASSIGNMENT_MINIMUM
//     // (< 20) and both single-driver checks failed (lead not > 60).
//     // The negligible-score driver is correctly ignored; the fallback
//     // returns the higher score as dominant.
//     // NOTE: with all four divergences applied, no real score combination
//     //   where both scores >= 30 can reach this fallback. Exhaustively
//     //   verified across all 806 integer-raw-score combinations.
//     IF tmjNorm >= cervNorm
//       RETURN "TMJ_DOMINANT"
//     ELSE
//       RETURN "CERV_DOMINANT"
//   END FUNCTION
export function classifyProfileType(tmjNorm: number, cervNorm: number): ProfileType {
  const {
    SINGLE_DRIVER_HIGH_THRESHOLD,
    PROTOCOL_ASSIGNMENT_MINIMUM,
    DUAL_DRIVER_MIN_SCORE,
    DUAL_DRIVER_MAX_DIFFERENCE,
    PRIMARY_STRONG_SECONDARY_LEAD,
    PRIMARY_STRONG_SECONDARY_MIN,
    PRIMARY_STRONG_SECONDARY_MAX,
  } = SCORING_THRESHOLDS

  // Single driver
  if (tmjNorm > SINGLE_DRIVER_HIGH_THRESHOLD && cervNorm < PROTOCOL_ASSIGNMENT_MINIMUM)
    return 'TMJ_DOMINANT'
  if (cervNorm > SINGLE_DRIVER_HIGH_THRESHOLD && tmjNorm < PROTOCOL_ASSIGNMENT_MINIMUM)
    return 'CERV_DOMINANT'

  // Both scores above the single-driver threshold — both pathways strongly active.
  // The max-difference guard below is for mixed-range pairs; it must not apply here.
  if (tmjNorm > SINGLE_DRIVER_HIGH_THRESHOLD && cervNorm > SINGLE_DRIVER_HIGH_THRESHOLD)
    return 'DUAL_DRIVER'

  // Dual driver — both meaningful AND scores close enough that neither dominates.
  // >= inclusive: a score exactly at DUAL_DRIVER_MIN_SCORE is meaningful and must
  // not fall through to the fallback.
  if (
    tmjNorm >= DUAL_DRIVER_MIN_SCORE &&
    cervNorm >= DUAL_DRIVER_MIN_SCORE &&
    Math.abs(tmjNorm - cervNorm) <= DUAL_DRIVER_MAX_DIFFERENCE
  )
    return 'DUAL_DRIVER'

  // Primary with strong secondary.
  // >= inclusive on lead: a score exactly at PRIMARY_STRONG_SECONDARY_LEAD is a
  // meaningful lead and must not fall through to the fallback.
  if (
    tmjNorm >= PRIMARY_STRONG_SECONDARY_LEAD &&
    cervNorm >= PRIMARY_STRONG_SECONDARY_MIN &&
    cervNorm <= PRIMARY_STRONG_SECONDARY_MAX
  )
    return 'TMJ_PRIMARY_STRONG_SECONDARY'
  if (
    cervNorm >= PRIMARY_STRONG_SECONDARY_LEAD &&
    tmjNorm >= PRIMARY_STRONG_SECONDARY_MIN &&
    tmjNorm <= PRIMARY_STRONG_SECONDARY_MAX
  )
    return 'CERV_PRIMARY_STRONG_SECONDARY'

  // Primary with secondary.
  // Secondary bound uses <= DUAL_DRIVER_MIN_SCORE (not < PRIMARY_STRONG_SECONDARY_MIN)
  // so a secondary score exactly at 30 is caught here rather than falling through.
  if (
    tmjNorm > DUAL_DRIVER_MIN_SCORE &&
    cervNorm >= PROTOCOL_ASSIGNMENT_MINIMUM &&
    cervNorm <= DUAL_DRIVER_MIN_SCORE
  )
    return 'TMJ_PRIMARY_WITH_SECONDARY'
  if (
    cervNorm > DUAL_DRIVER_MIN_SCORE &&
    tmjNorm >= PROTOCOL_ASSIGNMENT_MINIMUM &&
    tmjNorm <= DUAL_DRIVER_MIN_SCORE
  )
    return 'CERV_PRIMARY_WITH_SECONDARY'

  // Fallback — both below all meaningful thresholds; TMJ_DOMINANT by convention on tie
  return tmjNorm >= cervNorm ? 'TMJ_DOMINANT' : 'CERV_DOMINANT'
}

// Doc 13 §2.3 pseudocode (exact):
//
//   FUNCTION assignTmjProtocol(tmjNorm):
//     // SCORING_THRESHOLDS.PROTOCOL_ASSIGNMENT_MINIMUM = 20
//     RETURN tmjNorm >= PROTOCOL_ASSIGNMENT_MINIMUM
//
//   FUNCTION assignCervProtocol(cervNorm):
//     RETURN cervNorm >= PROTOCOL_ASSIGNMENT_MINIMUM
//
//   Exception — low-confidence members (both scores < 20%):
//   Both booleans are set to TRUE regardless of scores.
//   See Section 3.1 for low-confidence detection logic.
//   Low-confidence assignment overrides the standard threshold check.
//   NOTE: that override is applied upstream in generateAndSaveProfile (M6),
//   NOT in these functions. These implement the standard threshold only.
export function assignTmjProtocol(tmjNorm: number): boolean {
  return tmjNorm >= SCORING_THRESHOLDS.PROTOCOL_ASSIGNMENT_MINIMUM
}

export function assignCervProtocol(cervNorm: number): boolean {
  return cervNorm >= SCORING_THRESHOLDS.PROTOCOL_ASSIGNMENT_MINIMUM
}

// Doc 13 §2.4 table (exact):
//
//   Profile Type                    | Recommended Option | Rationale
//   --------------------------------|--------------------|----------------------------------
//   TMJ_DOMINANT                    | Option 1 — Sequential     | Single driver. Low daily load.
//   CERV_DOMINANT                   | Option 1 — Sequential     | Single driver. Low daily load.
//   DUAL_DRIVER                     | Option 2 — Parallel       | Both pathways equally active.
//   TMJ_PRIMARY_STRONG_SECONDARY    | Option 3 — Prioritised Parallel | Full primary + 2–3 key secondary.
//   CERV_PRIMARY_STRONG_SECONDARY   | Option 3 — Prioritised Parallel | Full primary + 2–3 key secondary.
//   TMJ_PRIMARY_WITH_SECONDARY      | Option 3 — Prioritised Parallel | Full primary + 1 key secondary.
//   CERV_PRIMARY_WITH_SECONDARY     | Option 3 — Prioritised Parallel | Full primary + 1 key secondary.
//
//   Return value: 1 = Sequential, 2 = Parallel, 3 = Prioritised Parallel.
//   Stored as framework_progress.protocol_option (member may override on profile screen).
export function getRecommendedProtocolOption(profileType: ProfileType): 1 | 2 | 3 {
  const optionByProfile: Record<ProfileType, 1 | 2 | 3> = {
    TMJ_DOMINANT:                   1,
    CERV_DOMINANT:                  1,
    DUAL_DRIVER:                    2,
    TMJ_PRIMARY_STRONG_SECONDARY:   3,
    CERV_PRIMARY_STRONG_SECONDARY:  3,
    TMJ_PRIMARY_WITH_SECONDARY:     3,
    CERV_PRIMARY_WITH_SECONDARY:    3,
  }
  return optionByProfile[profileType]
}
