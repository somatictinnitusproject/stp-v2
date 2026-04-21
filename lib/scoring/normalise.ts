// Doc 13 §1.5 pseudocode (TMJ):
//   normalisedScore = (tmjRawScore / TMJ_MODULE_MAXIMUM) * 100
//   RETURN ROUND(normalisedScore, 2)   -- stored as NUMERIC(5,2), e.g. 66.67
//
// Doc 13 §1.8 pseudocode (Cervical):
//   normalisedScore = (cervRawScore / CERVICAL_MODULE_MAXIMUM) * 100
//   RETURN ROUND(normalisedScore, 2)
//
// Implementation: multiply by 10000, round to integer, divide by 100.
// This avoids toFixed() returning a string and avoids floating-point
// representation issues at the rounding step.

import { SCORING_THRESHOLDS } from '@/content/scoring-thresholds'

export function normaliseTmj(raw: number): number {
  return clamp(Math.round((raw / SCORING_THRESHOLDS.TMJ_MODULE_MAXIMUM) * 10000) / 100)
}

export function normaliseCerv(raw: number): number {
  return clamp(Math.round((raw / SCORING_THRESHOLDS.CERVICAL_MODULE_MAXIMUM) * 10000) / 100)
}

// Math.min/max are type-agnostic — work correctly with decimal values.
function clamp(n: number): number {
  return Math.max(0, Math.min(100, n))
}
