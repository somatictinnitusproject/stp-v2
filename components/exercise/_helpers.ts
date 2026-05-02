// /components/exercise/_helpers.ts
// Shared helpers for exercise and reading view components.

import type { ProfileModifier } from '@/content/exercises/_types'
import type { Phase1AssessmentRow } from '@/lib/scoring/types'

/**
 * Filter profile modifiers to those whose trigger condition matches the
 * given phase1 row. Three variants:
 *   - triggerFlag + triggerValue: strict equality on one column.
 *   - triggerAllFalse: every named column must strictly === false.
 *     null does NOT qualify (column must be explicitly recorded as false).
 *   - triggerAnyTrue: any named column strictly === true.
 *
 * Per errata P3-13: flags missing from phase1_assessment resolve to
 * undefined at runtime. undefined !== any triggerValue → silently omitted.
 * No error, no warning, no UI artifact.
 */
export function filterQualifyingModifiers(
  modifiers: ProfileModifier[],
  phase1: Phase1AssessmentRow,
): ProfileModifier[] {
  const phase1Record = phase1 as unknown as Record<string, unknown>
  return modifiers.filter((mod) => {
    if ('triggerFlag' in mod) {
      // Single-flag strict equality (existing pattern).
      return phase1Record[mod.triggerFlag] === mod.triggerValue
    }
    if ('triggerAllFalse' in mod) {
      // All named flags must strictly === false.
      // null does NOT qualify — column must be explicitly recorded as false.
      return mod.triggerAllFalse.every((flag) => phase1Record[flag] === false)
    }
    if ('triggerAnyTrue' in mod) {
      // Any named flag strictly === true.
      return mod.triggerAnyTrue.some((flag) => phase1Record[flag] === true)
    }
    return false
  })
}
