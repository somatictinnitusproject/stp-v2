// /content/framework/phase-4/index.ts
// ─────────────────────────────────────────────────────────────────
// Phase 4 readings registry. Empty during M14a (access surface
// only). F.1 onwards added in subsequent M14 sub-steps.
// ─────────────────────────────────────────────────────────────────

import type { ReadingSection } from './types'
import f1 from './f1-opening'

export type { ReadingSection } from './types'

export const PHASE_4_READINGS: ReadingSection[] = [f1]
