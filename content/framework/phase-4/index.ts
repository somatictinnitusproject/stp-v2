// /content/framework/phase-4/index.ts
// ─────────────────────────────────────────────────────────────────
// Phase 4 readings registry. Empty during M14a (access surface
// only). F.1 onwards added in subsequent M14 sub-steps.
// ─────────────────────────────────────────────────────────────────

import type { ReadingSection } from './types'
import f1 from './f1-opening'
import f2 from './f2-postural-framing'
import f3 from './f3-workstation-setup'
import f4 from './f4-movement-pattern-integration'
import f5 from './f5-ns-framing'
import f6 from './f6-breath-work'

export type { ReadingSection } from './types'

export const PHASE_4_READINGS: ReadingSection[] = [f1, f2, f3, f4, f5, f6]
