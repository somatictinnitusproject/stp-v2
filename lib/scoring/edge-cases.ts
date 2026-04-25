// Edge case checks and asymmetry pattern logic — Document 13 §3.
// Four checks run at profile generation, after module scores are calculated,
// before profile type is finalised. Functions are added below in sub-steps 4b–4f.

import { SCORING_THRESHOLDS } from '@/content/scoring-thresholds'
import type { Phase1AssessmentRow, UserIntakeRow } from './types'

// ── Type exports ─────────────────────────────────────────────────────────────

export type LowConfidenceFlag =
  | 'LOW_CONFIDENCE_SYMPTOM_DOMINANT'
  | 'LOW_CONFIDENCE_LOW_ALL'

export type AsymmetryPattern =
  | 'UNILATERAL_COHERENT'
  | 'STRUCTURAL_ASYMMETRY'
  | 'MIXED_ASYMMETRY'
  | 'SINGLE_FINDING'
  | 'NO_ASYMMETRY'

export interface SingleStrongMovement {
  tmj: string[]
  cerv: string[]
}

export interface EdgeCaseFlags {
  lowConfidence: LowConfidenceFlag | null
  strongSingleFindings: SingleStrongMovement
  contralateralPattern: boolean
  asymmetryPattern: AsymmetryPattern
}

// ── §3.1 — checkLowConfidenceEdgeCase ────────────────────────────────────────
//
// Doc 13 §3.1 pseudocode (exact):
//   FUNCTION checkLowConfidenceEdgeCase(tmjNorm, cervNorm, user):
//     IF tmjNorm < PROTOCOL_ASSIGNMENT_MINIMUM // < 20
//       AND cervNorm < PROTOCOL_ASSIGNMENT_MINIMUM // < 20
//       // Sub-case A: symptoms suggest somatic involvement despite low physical scores
//       IF user.symptom_score >= LOW_CONFIDENCE_SYMPTOM_THRESHOLD // >= 6
//         RETURN "LOW_CONFIDENCE_SYMPTOM_DOMINANT"
//       // Sub-case B: low signal across the board
//       ELSE
//         RETURN "LOW_CONFIDENCE_LOW_ALL"
//     RETURN NULL // No low-confidence condition
//   END FUNCTION
export function checkLowConfidenceEdgeCase(
  tmjNorm: number,
  cervNorm: number,
  user: UserIntakeRow,
): LowConfidenceFlag | null {
  const { PROTOCOL_ASSIGNMENT_MINIMUM, LOW_CONFIDENCE_SYMPTOM_THRESHOLD } = SCORING_THRESHOLDS

  if (tmjNorm < PROTOCOL_ASSIGNMENT_MINIMUM && cervNorm < PROTOCOL_ASSIGNMENT_MINIMUM) {
    // null symptom_score treated as 0 — below threshold, sub-case B
    if ((user.symptom_score ?? 0) >= LOW_CONFIDENCE_SYMPTOM_THRESHOLD)
      return 'LOW_CONFIDENCE_SYMPTOM_DOMINANT'
    return 'LOW_CONFIDENCE_LOW_ALL'
  }
  return null
}

// ── §3.2 — checkSingleStrongMovement ─────────────────────────────────────────
//
// Doc 13 §3.2 pseudocode (updated per ERRATA E13/E14):
//   FUNCTION checkSingleStrongMovement(assessment, user, tmjNorm, cervNorm):
//     result = { tmj: [], cerv: [] }
//     // Check for strong TMJ indicators within a lower overall score
//     IF tmjNorm < SINGLE_DRIVER_HIGH_THRESHOLD // < 60
//       IF assessment.tmj_jaw_drift = TRUE            result.tmj.push("jaw_drift")
//       IF assessment.tmj_m1_jaw_opening = TRUE       result.tmj.push("M1")      // E14
//       IF assessment.tmj_m2_jaw_protrusion = TRUE    result.tmj.push("M2")      // E14
//       IF assessment.tmj_pterygoid_tenderness = TRUE result.tmj.push("pterygoid_tenderness")
//     // Check for strong cervical indicators within a lower overall score
//     IF cervNorm < SINGLE_DRIVER_HIGH_THRESHOLD // < 60
//       IF assessment.cerv_m3_neck_curl = TRUE            result.cerv.push("M3") // E13
//       IF assessment.cerv_m4_head_rotation = TRUE        result.cerv.push("M4") // E13
//       IF assessment.cerv_suboccipital_tenderness = TRUE result.cerv.push("suboccipital_tenderness")
//     RETURN result // Empty arrays = flag does not fire
//   END FUNCTION
export function checkSingleStrongMovement(
  assessment: Phase1AssessmentRow,
  user: UserIntakeRow,
  tmjNorm: number,
  cervNorm: number,
): SingleStrongMovement {
  void user // user retained in signature; no intake reads remain (E13/E14)
  const { SINGLE_DRIVER_HIGH_THRESHOLD } = SCORING_THRESHOLDS
  const result: SingleStrongMovement = { tmj: [], cerv: [] }

  if (tmjNorm < SINGLE_DRIVER_HIGH_THRESHOLD) {
    if (assessment.tmj_jaw_drift === true)            result.tmj.push('jaw_drift')
    if (assessment.tmj_m1_jaw_opening === true)       result.tmj.push('M1')  // E14: live Phase 1 test
    if (assessment.tmj_m2_jaw_protrusion === true)    result.tmj.push('M2')  // E14: live Phase 1 test
    if (assessment.tmj_pterygoid_tenderness === true) result.tmj.push('pterygoid_tenderness')
  }

  if (cervNorm < SINGLE_DRIVER_HIGH_THRESHOLD) {
    if (assessment.cerv_m3_neck_curl === true)            result.cerv.push('M3')  // E13: live Phase 1 test
    if (assessment.cerv_m4_head_rotation === true)        result.cerv.push('M4')  // E13: live Phase 1 test
    if (assessment.cerv_suboccipital_tenderness === true) result.cerv.push('suboccipital_tenderness')
  }

  return result
}

// ── §3.3 — checkContralateralPattern ─────────────────────────────────────────
//
// Doc 13 §3.3 pseudocode (exact):
//   FUNCTION checkContralateralPattern(assessment):
//     IF assessment.tmj_jaw_drift != TRUE   RETURN FALSE
//     IF assessment.asym_tinnitus_worse_ear IS NULL   RETURN FALSE
//     IF assessment.asym_tinnitus_worse_ear = 'bilateral'   RETURN FALSE
//     contralateral = (assessment.asym_jaw_drift_direction = 'left'
//                      AND assessment.asym_tinnitus_worse_ear = 'right')
//                  OR (assessment.asym_jaw_drift_direction = 'right'
//                      AND assessment.asym_tinnitus_worse_ear = 'left')
//     IF contralateral = TRUE
//       SET assessment.asym_contralateral_pattern = TRUE
//       RETURN TRUE
//     RETURN FALSE
//   END FUNCTION
//
// Deviation from pseudocode: pseudocode mutates assessment.asym_contralateral_pattern.
// We return the boolean instead so the DB write happens in one transaction at
// profile generation time (M6).
export function checkContralateralPattern(assessment: Phase1AssessmentRow): boolean {
  if (assessment.tmj_jaw_drift !== true)             return false
  if (assessment.asym_tinnitus_worse_ear === null)   return false
  if (assessment.asym_tinnitus_worse_ear === 'bilateral') return false

  return (
    (assessment.asym_jaw_drift_direction === 'left'  && assessment.asym_tinnitus_worse_ear === 'right') ||
    (assessment.asym_jaw_drift_direction === 'right' && assessment.asym_tinnitus_worse_ear === 'left')
  )
}

// ── §3.4 — classifyAsymmetryPattern ──────────────────────────────────────────
//
// Doc 13 §3.4 pseudocode (exact):
//   FUNCTION classifyAsymmetryPattern(assessment):
//     findings = []
//     IF assessment.asym_jaw_drift_direction IS NOT NULL
//       findings.push({ structure: 'jaw_drift', side: asym_jaw_drift_direction })
//     IF assessment.asym_masseter_dominant_side IS NOT NULL
//       findings.push({ structure: 'masseter', side: asym_masseter_dominant_side })
//     IF assessment.asym_shoulder_elevated_side IS NOT NULL
//       findings.push({ structure: 'shoulder', side: asym_shoulder_elevated_side })
//     IF assessment.asym_scm_dominant_side IS NOT NULL
//       findings.push({ structure: 'scm', side: asym_scm_dominant_side })
//     IF findings.length = 0   RETURN 'NO_ASYMMETRY'
//     tinnitusUnilateral = assessment.asym_tinnitus_worse_ear IS NOT NULL
//                          AND assessment.asym_tinnitus_worse_ear != 'bilateral'
//     sides = findings.map(f => f.side)
//     allSameSide = sides.every(s => s = sides[0])   // pseudocode typo: = is assignment
//     IF allSameSide AND findings.length >= 2
//       IF tinnitusUnilateral   RETURN 'UNILATERAL_COHERENT'
//       ELSE                    RETURN 'STRUCTURAL_ASYMMETRY'
//     IF NOT allSameSide AND findings.length >= 2
//       RETURN 'MIXED_ASYMMETRY'
//     RETURN 'SINGLE_FINDING'
//     // Note: CONTRALATERAL_PATTERN is not returned here — it is an additive flag.
//   END FUNCTION
export function classifyAsymmetryPattern(assessment: Phase1AssessmentRow): AsymmetryPattern {
  const findings: Array<{ structure: string; side: string }> = []

  if (assessment.asym_jaw_drift_direction !== null)
    findings.push({ structure: 'jaw_drift',  side: assessment.asym_jaw_drift_direction })
  if (assessment.asym_masseter_dominant_side !== null)
    findings.push({ structure: 'masseter',   side: assessment.asym_masseter_dominant_side })
  if (assessment.asym_shoulder_elevated_side !== null)
    findings.push({ structure: 'shoulder',   side: assessment.asym_shoulder_elevated_side })
  if (assessment.asym_scm_dominant_side !== null)
    findings.push({ structure: 'scm',        side: assessment.asym_scm_dominant_side })

  if (findings.length === 0) return 'NO_ASYMMETRY'

  const tinnitusUnilateral =
    assessment.asym_tinnitus_worse_ear !== null &&
    assessment.asym_tinnitus_worse_ear !== 'bilateral'

  const sides = findings.map(f => f.side)
  const allSameSide = sides.every(s => s === sides[0]) // pseudocode used = (assignment typo) — corrected to ===

  if (allSameSide && findings.length >= 2)
    return tinnitusUnilateral ? 'UNILATERAL_COHERENT' : 'STRUCTURAL_ASYMMETRY'

  if (!allSameSide && findings.length >= 2)
    return 'MIXED_ASYMMETRY'

  return 'SINGLE_FINDING'
}

// ── §3.5 — runAllEdgeCaseChecks ───────────────────────────────────────────────
//
// Doc 13 §3.5 pseudocode (exact):
//   FUNCTION runAllEdgeCaseChecks(assessment, user, tmjNorm, cervNorm):
//     flags = {}
//     // 1. Low confidence — may override protocol assignment
//     flags.lowConfidence = checkLowConfidenceEdgeCase(tmjNorm, cervNorm, user)
//     // 2. Single strong movement — adds note to findings summary
//     flags.strongSingleFindings = checkSingleStrongMovement(assessment, user, tmjNorm, cervNorm)
//     // 3. Contralateral pattern — set on assessment row, read here
//     flags.contralateralPattern = assessment.asym_contralateral_pattern
//     // 4. Asymmetry pattern classification
//     flags.asymmetryPattern = classifyAsymmetryPattern(assessment)
//     RETURN flags
//   END FUNCTION
//
// Deviation on flag 3: pseudocode reads assessment.asym_contralateral_pattern assuming
// checkContralateralPattern already mutated it. Since we do not mutate (see §3.3),
// we call checkContralateralPattern(assessment) directly here instead.
export function runAllEdgeCaseChecks(
  assessment: Phase1AssessmentRow,
  user: UserIntakeRow,
  tmjNorm: number,
  cervNorm: number,
): EdgeCaseFlags {
  return {
    lowConfidence:        checkLowConfidenceEdgeCase(tmjNorm, cervNorm, user),
    strongSingleFindings: checkSingleStrongMovement(assessment, user, tmjNorm, cervNorm),
    contralateralPattern: checkContralateralPattern(assessment),
    asymmetryPattern:     classifyAsymmetryPattern(assessment),
  }
}
