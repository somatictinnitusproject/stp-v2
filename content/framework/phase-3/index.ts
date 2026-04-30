// /content/framework/phase-3/index.ts
// Re-exports Phase 3 TMJ reading sections and shared utilities.

export type { ReadingSection } from './types'
export { default as d1Opening } from './d1-opening'
export { default as d2Forewarning } from './d2-forewarning'
export { default as d3ReleaseIntro } from './d3-release-intro'

import d1 from './d1-opening'
import d2 from './d2-forewarning'
import d3 from './d3-release-intro'
import type { ReadingSection } from './types'

// Ordered manifest — D.1 first, D.3 last. Used by session builder to prepend.
export const PHASE_3_TMJ_READINGS: ReadingSection[] = [d1, d2, d3]

// Set of reading IDs for O(1) membership test when routing mixed session IDs.
export const PHASE_3_READING_IDS = new Set<string>([
  'D1_phase3_opening',
  'D2_forewarning',
  'D3_release_intro',
])
