// /content/framework/phase-5/types.ts
// ─────────────────────────────────────────────────────────────────
// Phase 5 readings extend the base ReadingSection type (defined in
// phase-3, re-exported through phase-4) with two optional fields:
//
//   noAcknowledge?: true
//     When set, Phase5ReadingList omits the acknowledge button.
//
//   acknowledgeRequires?: 'phase5_outcome_type'
//     When set, the acknowledge button is suppressed until the
//     named value has been selected. Used by G.1 to gate the Done
//     button on outcome selection.
//
// Phase5OutcomeType and PHASE5_OUTCOME_VALUES define the valid
// values for phase5_outcome_type on framework_progress. The CHECK
// constraint in supabase/migrations/20260503000000_phase5_outcome_type_check.sql
// enforces the same set at the DB level.
//
// Phase 4 types are not modified. Re-export ReadingSection so phase-5
// content files can import locally without crossing phase boundaries.
// ─────────────────────────────────────────────────────────────────

import type { ReadingSection } from '@/content/framework/phase-4/types'

export type { ReadingSection } from '@/content/framework/phase-4/types'

export interface Phase5ReadingSection extends ReadingSection {
  noAcknowledge?: true
  acknowledgeRequires?: 'phase5_outcome_type'
}

export const PHASE5_OUTCOME_VALUES = [
  'full_resolution',
  'significant_improvement',
  'plateau',
] as const

export type Phase5OutcomeType = (typeof PHASE5_OUTCOME_VALUES)[number]
