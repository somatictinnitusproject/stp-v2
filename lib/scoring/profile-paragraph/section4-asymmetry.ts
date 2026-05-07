import type { Phase1AssessmentRow } from '../types'
import type { AsymmetryPattern } from '../edge-cases'
import { getDominantSide } from './placeholders'
import type { ParagraphContext } from './types'

// Doc 13 §4.5 pseudocode (exact):
//   // Section 4 — Asymmetry output
//   FUNCTION generateSection4_AsymmetryOutput(assessment, edgeCaseFlags):
//     baseText = asymmetryTextByPattern(edgeCaseFlags.asymmetryPattern)
//     IF edgeCaseFlags.contralateralPattern = TRUE
//       baseText += contralateralPatternText(
//         assessment.asym_jaw_drift_direction,
//         assessment.asym_tinnitus_worse_ear
//       )
//     RETURN baseText
//   END FUNCTION
//
// Doc 13 §3.4 asymmetry pattern descriptions (used to derive output text below):
//   UNILATERAL_COHERENT — all findings same side + unilateral tinnitus matches
//   STRUCTURAL_ASYMMETRY — all findings same side, tinnitus not clearly lateralised
//   MIXED_ASYMMETRY — findings on both sides, no consistent pattern
//   SINGLE_FINDING — only one asymmetric finding
//   NO_ASYMMETRY — no significant asymmetric findings
//
// Implementation note: Doc 13 pseudocode passes (assessment, edgeCaseFlags) as individual
// args. We pass ParagraphContext so asymmetryTextByPattern can read assessment data.
// contralateralPatternText resolves its own placeholders inline (drift direction / worse ear
// are specific to this text block — not handled by the §4.4 generic resolvePlaceholders).

export function generateSection4_AsymmetryOutput(ctx: ParagraphContext): string {
  const { assessment, edgeCaseFlags } = ctx

  let baseText = asymmetryTextByPattern(edgeCaseFlags.asymmetryPattern, assessment)

  if (edgeCaseFlags.contralateralPattern === true) {
    baseText += '\n\n' + contralateralPatternText(
      assessment.asym_jaw_drift_direction,
      assessment.asym_tinnitus_worse_ear,
    )
  }

  return baseText
}

// ── Asymmetry findings helpers ───────────────────────────────────────────────

function getAsymmetryFindingsForSide(assessment: Phase1AssessmentRow, side: string): string {
  const findings: string[] = []
  if (assessment.asym_jaw_drift_direction === side)   findings.push('jaw drift')
  if (assessment.asym_masseter_dominant_side === side) findings.push('masseter dominance')
  if (assessment.asym_shoulder_elevated_side === side) findings.push('elevated shoulder')
  if (assessment.asym_scm_dominant_side === side)      findings.push('SCM dominance')
  return findings.length > 0 ? findings.join(', ') : 'asymmetric findings'
}

function getAllAsymmetryFindingsWithSides(assessment: Phase1AssessmentRow): string {
  const findings: string[] = []
  if (assessment.asym_jaw_drift_direction !== null)
    findings.push(`jaw drift (${assessment.asym_jaw_drift_direction})`)
  if (assessment.asym_masseter_dominant_side !== null)
    findings.push(`masseter dominance (${assessment.asym_masseter_dominant_side})`)
  if (assessment.asym_shoulder_elevated_side !== null)
    findings.push(`elevated shoulder (${assessment.asym_shoulder_elevated_side})`)
  if (assessment.asym_scm_dominant_side !== null)
    findings.push(`SCM dominance (${assessment.asym_scm_dominant_side})`)
  return findings.length > 0 ? findings.join(', ') : 'the asymmetric findings identified'
}

function getSingleAsymmetryFinding(assessment: Phase1AssessmentRow): string {
  if (assessment.asym_jaw_drift_direction !== null)
    return `jaw drift to the ${assessment.asym_jaw_drift_direction}`
  if (assessment.asym_masseter_dominant_side !== null)
    return `masseter dominance on the ${assessment.asym_masseter_dominant_side}`
  if (assessment.asym_shoulder_elevated_side !== null)
    return `elevated shoulder on the ${assessment.asym_shoulder_elevated_side}`
  if (assessment.asym_scm_dominant_side !== null)
    return `SCM dominance on the ${assessment.asym_scm_dominant_side}`
  return 'one asymmetric finding'
}

// ── Pattern → output text mapping ───────────────────────────────────────────
//
// Output 1 (UNILATERAL_COHERENT) and Output 3 (MIXED_ASYMMETRY) and Output 4
// (NO_ASYMMETRY) are verbatim from Doc 8 Module 5 "Pattern Analysis" section,
// with [left/right] and [list findings] placeholders resolved inline.
//
// STRUCTURAL_ASYMMETRY and SINGLE_FINDING have no explicit Doc 8 output text —
// proposed texts flagged and approved in M5b pre-work.

function asymmetryTextByPattern(pattern: AsymmetryPattern, assessment: Phase1AssessmentRow): string {
  switch (pattern) {
    case 'UNILATERAL_COHERENT': {
      // Doc 8 Module 5 — Output 1: Consistent Ipsilateral Pattern
      const side = getDominantSide(assessment) ?? 'one'
      const findingsOnSide = getAsymmetryFindingsForSide(assessment, side)
      return `Your assessment shows a consistent pattern on your ${side} side: ${findingsOnSide}. Your tinnitus being worse in the same ear is consistent with this pattern. Ipsilateral patterns suggest the dominant physical driver is on the same side as the louder tinnitus, which is the more straightforward presentation mechanistically. Be aware of this pattern as you work through Phase 3 release exercises.`
    }

    case 'STRUCTURAL_ASYMMETRY': {
      // No explicit Doc 8 output — proposed text (pre-work approved): same-side findings
      // without matching tinnitus lateralisation.
      const side = getDominantSide(assessment) ?? 'one'
      const findingsOnSide = getAsymmetryFindingsForSide(assessment, side)
      return `Your assessment shows a consistent structural pattern on your ${side} side: ${findingsOnSide}. Your tinnitus presentation does not clearly lateralise to match this pattern, which limits the confidence of the lateralisation; the structural findings are real and your protocol will apply side-specific emphasis where relevant throughout Phase 3.`
    }

    case 'MIXED_ASYMMETRY': {
      // Doc 8 Module 5 — Output 3: Mixed Asymmetric Pattern
      const findingsWithSides = getAllAsymmetryFindingsWithSides(assessment)
      return `Your assessment identified asymmetric findings across multiple structures without a single consistent pattern: ${findingsWithSides}. This is common and doesn't indicate a problem with your assessment. Mixed asymmetry often reflects the accumulated history of different physical stressors over time rather than a single lateralised driver. Your protocol addresses each finding specifically rather than treating the pattern as a whole. Side-specific emphasis will be applied throughout Phase 3 based on the individual findings identified.`
    }

    case 'SINGLE_FINDING': {
      // No explicit Doc 8 output — proposed text (pre-work approved): one finding noted.
      const finding = getSingleAsymmetryFinding(assessment)
      return `Your assessment identified one asymmetric finding: ${finding}. A single finding is noted and will influence your protocol where relevant, but does not establish a strong lateralised pattern overall.`
    }

    case 'NO_ASYMMETRY':
    default:
      // Doc 8 Module 5 — Output 4: No Significant Asymmetry
      return `Your assessment did not identify significant asymmetric patterns. Your tinnitus presentation is bilateral or central, which is consistent with a more symmetrical driver pattern. Your Phase 3 protocol will be bilateral throughout ; both sides worked equally rather than one side prioritised.`
  }
}

// ── Contralateral pattern additive text ──────────────────────────────────────
//
// Doc 13 §3.3 output text (verbatim). Appended on top of the base pattern text
// when edgeCaseFlags.contralateralPattern is true.
// [left/right], [right/left], and [drift side] resolved inline — not §4.4 tokens.

function contralateralPatternText(
  driftDirection: string | null,
  worseEar: string | null,
): string {
  const drift = driftDirection ?? ''
  const ear   = worseEar ?? ''
  return `Your assessment identified a potentially significant asymmetric pattern: your jaw drifts to the ${drift} on opening, and your tinnitus is louder in the ${ear} ear, the opposite side. There is a plausible mechanism for this pattern through lateralised pterygoid overactivity generating asymmetric trigeminal input to the dorsal cochlear nucleus. However, this specific pattern has not been systematically studied and its consistency across individuals is not established. Treat this as a finding worth exploring rather than a confirmed mechanism. Your Phase 3 jaw protocol applies asymmetric emphasis toward the ${drift} side regardless; this finding reinforces that emphasis.`
}
