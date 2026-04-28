import { PHASE_2_NUDGES } from '@/content/framework/phase-2/nudges'
import type { NudgeData, NudgeId } from '@/content/framework/phase-2/nudges'
import { countNsFlags } from '@/content/framework/phase-2/c4-habits-audit-systemic'
import { SCORING_THRESHOLDS } from '@/content/scoring-thresholds'

// Section IDs that can trigger Phase 2 nudges.
type Phase2NudgeSection = 'C2' | 'C7' | 'C8'

// Shape of assessment fields needed for nudge eligibility checks.
// page.tsx fetches these columns per-branch as part of assessment queries.
export type NudgeAssessmentInput = {
  post_sustained_desk_load: boolean | null
  cerv_forward_head_posture: boolean | null
  ns_sleep_disruption: boolean | null
  ns_stress_tinnitus_correlation: boolean | null
  ns_hypervigilance: boolean | null
  ns_anxiety_loop: boolean | null
}

// Shape of the dismissed map from framework_progress.nudges_dismissed.
// Keys are nudge IDs; values are true (or absent if not dismissed).
type DismissedMap = Partial<Record<NudgeId, boolean>>

/**
 * Returns the eligible nudge for a Phase 2 section, or null.
 * - Returns null if the relevant nudge has been dismissed.
 * - Returns null if trigger conditions aren't met.
 * - Returns the NudgeData if conditions met AND not dismissed.
 *
 * Per-section rules per Doc 13 §9.2:
 *   C2 -> phase4_workstation if post_sustained_desk_load OR cerv_forward_head_posture
 *   C7 -> phase4_sleep if ns_sleep_disruption
 *   C8 -> phase4_breathwork if countNsFlags >= HIGH_NS_FLAG_THRESHOLD (3)
 */
export function getEligibleNudge(
  sectionId: Phase2NudgeSection,
  assessment: NudgeAssessmentInput | null,
  dismissed: DismissedMap,
): NudgeData | null {
  if (!assessment) return null

  let candidateId: NudgeId | null = null
  let conditionMet = false

  switch (sectionId) {
    case 'C2':
      candidateId = 'phase4_workstation'
      conditionMet =
        assessment.post_sustained_desk_load === true ||
        assessment.cerv_forward_head_posture === true
      break
    case 'C7':
      candidateId = 'phase4_sleep'
      conditionMet = assessment.ns_sleep_disruption === true
      break
    case 'C8':
      candidateId = 'phase4_breathwork'
      conditionMet =
        countNsFlags(assessment) >= SCORING_THRESHOLDS.HIGH_NS_FLAG_THRESHOLD
      break
  }

  if (!candidateId || !conditionMet) return null
  if (dismissed[candidateId] === true) return null

  return PHASE_2_NUDGES[candidateId]
}
