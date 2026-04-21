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

// Doc 13 §2.2 pseudocode (exact):
//
//   FUNCTION classifyProfileType(tmjNorm, cervNorm):
//     // ── Single driver — checked first ──────────────────────────────────
//     // Clean single-driver cases take priority. A member with TMJ 65%
//     // and cervical 35% would technically satisfy "primary with strong
//     // secondary" but is correctly classified as TMJ_DOMINANT first.
//     IF tmjNorm > SINGLE_DRIVER_HIGH_THRESHOLD  // > 60
//       AND cervNorm < PROTOCOL_ASSIGNMENT_MINIMUM  // < 20
//       RETURN "TMJ_DOMINANT"
//     IF cervNorm > SINGLE_DRIVER_HIGH_THRESHOLD  // > 60
//       AND tmjNorm < PROTOCOL_ASSIGNMENT_MINIMUM  // < 20
//       RETURN "CERV_DOMINANT"
//     // ── Dual driver ────────────────────────────────────────────────────
//     // Both scores meaningful AND close together.
//     IF tmjNorm > DUAL_DRIVER_MIN_SCORE  // > 30
//       AND cervNorm > DUAL_DRIVER_MIN_SCORE  // > 30
//       AND ABS(tmjNorm - cervNorm) <= DUAL_DRIVER_MAX_DIFFERENCE  // <= 15
//       RETURN "DUAL_DRIVER"
//     // ── Primary with strong secondary ──────────────────────────────────
//     // One score clearly leads (> 50%), secondary is substantial (30–50%).
//     IF tmjNorm > PRIMARY_STRONG_SECONDARY_LEAD  // > 50
//       AND cervNorm >= PRIMARY_STRONG_SECONDARY_MIN  // >= 30
//       AND cervNorm <= PRIMARY_STRONG_SECONDARY_MAX  // <= 50
//       RETURN "TMJ_PRIMARY_STRONG_SECONDARY"
//     IF cervNorm > PRIMARY_STRONG_SECONDARY_LEAD  // > 50
//       AND tmjNorm >= PRIMARY_STRONG_SECONDARY_MIN  // >= 30
//       AND tmjNorm <= PRIMARY_STRONG_SECONDARY_MAX  // <= 50
//       RETURN "CERV_PRIMARY_STRONG_SECONDARY"
//     // ── Primary with secondary ─────────────────────────────────────────
//     // One score leads (> 30%), secondary present but minor (20–30%).
//     IF tmjNorm > DUAL_DRIVER_MIN_SCORE  // > 30
//       AND cervNorm >= PROTOCOL_ASSIGNMENT_MINIMUM  // >= 20
//       AND cervNorm < PRIMARY_STRONG_SECONDARY_MIN  // < 30
//       RETURN "TMJ_PRIMARY_WITH_SECONDARY"
//     IF cervNorm > DUAL_DRIVER_MIN_SCORE  // > 30
//       AND tmjNorm >= PROTOCOL_ASSIGNMENT_MINIMUM  // >= 20
//       AND tmjNorm < PRIMARY_STRONG_SECONDARY_MIN  // < 30
//       RETURN "CERV_PRIMARY_WITH_SECONDARY"
//     // ── Fallback ───────────────────────────────────────────────────────
//     // Reached only when both scores are below all meaningful thresholds.
//     // In practice: both scores below 20%. Assign whichever is higher.
//     // This case also triggers the low-confidence edge case in Section 3.
//     // If both are identical, TMJ_DOMINANT by convention.
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

  // Dual driver
  if (
    tmjNorm > DUAL_DRIVER_MIN_SCORE &&
    cervNorm > DUAL_DRIVER_MIN_SCORE &&
    Math.abs(tmjNorm - cervNorm) <= DUAL_DRIVER_MAX_DIFFERENCE
  )
    return 'DUAL_DRIVER'

  // Primary with strong secondary
  if (
    tmjNorm > PRIMARY_STRONG_SECONDARY_LEAD &&
    cervNorm >= PRIMARY_STRONG_SECONDARY_MIN &&
    cervNorm <= PRIMARY_STRONG_SECONDARY_MAX
  )
    return 'TMJ_PRIMARY_STRONG_SECONDARY'
  if (
    cervNorm > PRIMARY_STRONG_SECONDARY_LEAD &&
    tmjNorm >= PRIMARY_STRONG_SECONDARY_MIN &&
    tmjNorm <= PRIMARY_STRONG_SECONDARY_MAX
  )
    return 'CERV_PRIMARY_STRONG_SECONDARY'

  // Primary with secondary
  if (
    tmjNorm > DUAL_DRIVER_MIN_SCORE &&
    cervNorm >= PROTOCOL_ASSIGNMENT_MINIMUM &&
    cervNorm < PRIMARY_STRONG_SECONDARY_MIN
  )
    return 'TMJ_PRIMARY_WITH_SECONDARY'
  if (
    cervNorm > DUAL_DRIVER_MIN_SCORE &&
    tmjNorm >= PROTOCOL_ASSIGNMENT_MINIMUM &&
    tmjNorm < PRIMARY_STRONG_SECONDARY_MIN
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
