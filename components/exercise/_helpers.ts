// /components/exercise/_helpers.ts
// Shared helpers for exercise and reading view components.

import type { ProfileModifier } from '@/content/exercises/_types'
import type { Phase1AssessmentRow } from '@/lib/scoring/types'

/**
 * Filter profile modifiers to those whose triggerFlag strictly equals
 * triggerValue on the given phase1 row.
 *
 * Per errata P3-13: flags missing from phase1_assessment resolve to
 * undefined at runtime. undefined !== any triggerValue → silently omitted.
 * No error, no warning, no UI artifact.
 */
export function filterQualifyingModifiers(
  modifiers: ProfileModifier[],
  phase1: Phase1AssessmentRow,
): ProfileModifier[] {
  return modifiers.filter(
    (mod) => (phase1 as unknown as Record<string, unknown>)[mod.triggerFlag] === mod.triggerValue,
  )
}
