// /content/framework/phase-5/types.ts
// ─────────────────────────────────────────────────────────────────
// Phase 5 readings extend the base ReadingSection type (defined in
// phase-3, re-exported through phase-4) with one optional flag:
//
//   noAcknowledge?: true
//     When set, Phase5ReadingList omits the acknowledge button by
//     passing onAcknowledge={undefined} to ReadingView. Reading-view
//     suppresses the button when onAcknowledge is absent.
//     Use for informational sections that require no action.
//
// Phase 4 types are not modified. Re-export ReadingSection so phase-5
// content files can import locally without crossing phase boundaries.
// ─────────────────────────────────────────────────────────────────

import type { ReadingSection } from '@/content/framework/phase-4/types'

export type { ReadingSection } from '@/content/framework/phase-4/types'

export interface Phase5ReadingSection extends ReadingSection {
  noAcknowledge?: true
}
