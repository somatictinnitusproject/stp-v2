import type { Phase1AssessmentRow } from '../types'
import type { ParagraphContext } from './types'

// Doc 13 §4.4 pseudocode (exact):
//   FUNCTION resolvePlaceholders(template, assessment):
//     // [primary driver]    → jaw or cervical — from profile_type
//     // [secondary driver]  → opposite of primary
//     // [drift direction]   → assessment.tmj_jaw_drift_direction
//     // [worse ear]         → assessment.asym_tinnitus_worse_ear
//     // [dominant side]     → most consistently flagged side across findings
//     //   (count 'left' vs 'right' across asym_jaw_drift_direction,
//     //    asym_masseter_dominant_side, asym_scm_dominant_side,
//     //    asym_shoulder_elevated_side; return majority; on tie return null)
//     // [specific findings] → handled at section-3 generation time, NOT here
//     RETURN template with all placeholders resolved
//   END FUNCTION

export function getPrimaryDriver(profileType: string | null): 'jaw' | 'cervical' {
  if (profileType?.startsWith('TMJ'))  return 'jaw'
  if (profileType?.startsWith('CERV')) return 'cervical'
  // DUAL_DRIVER has no single primary; 'jaw' is a defensive default.
  // In practice [primary driver] does not appear in DUAL_DRIVER templates (§4.2).
  return 'jaw'
}

export function getSecondaryDriver(profileType: string | null): 'jaw' | 'cervical' {
  return getPrimaryDriver(profileType) === 'jaw' ? 'cervical' : 'jaw'
}

export function getDominantSide(assessment: Phase1AssessmentRow): 'left' | 'right' | null {
  const sides = [
    assessment.asym_jaw_drift_direction,
    assessment.asym_masseter_dominant_side,
    assessment.asym_scm_dominant_side,
    assessment.asym_shoulder_elevated_side,
  ].filter((s): s is string => s !== null)

  const left  = sides.filter(s => s === 'left').length
  const right = sides.filter(s => s === 'right').length

  if (left === right) return null   // tie (including 0-0) — caller must handle
  return left > right ? 'left' : 'right'
}

export function resolvePlaceholders(template: string, ctx: ParagraphContext): string {
  const { assessment } = ctx
  const primary     = getPrimaryDriver(assessment.profile_type)
  const secondary   = getSecondaryDriver(assessment.profile_type)
  const dominantSide = getDominantSide(assessment)

  return template
    .replace(/\[primary driver\]/g,   primary)
    .replace(/\[secondary driver\]/g, secondary)
    .replace(/\[drift direction\]/g,  assessment.tmj_jaw_drift_direction ?? '')
    .replace(/\[worse ear\]/g,        assessment.asym_tinnitus_worse_ear ?? '')
    .replace(/\[dominant side\]/g,    dominantSide ?? '')
  // [specific findings] is NOT resolved here — handled in section3-paragraphs.ts (M5b)
}
