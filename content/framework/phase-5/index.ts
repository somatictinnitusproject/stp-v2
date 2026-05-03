// /content/framework/phase-5/index.ts
// ─────────────────────────────────────────────────────────────────
// Phase 5 readings registry. Empty during M15a (scaffold only).
// G.1 onwards added in subsequent M15 sub-steps.
// ─────────────────────────────────────────────────────────────────

import type { Phase5ReadingSection } from './types'
import g1 from './g1-opening'

export type { Phase5ReadingSection } from './types'

export const PHASE_5_READINGS: Phase5ReadingSection[] = [g1]
