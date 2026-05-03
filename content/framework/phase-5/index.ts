// /content/framework/phase-5/index.ts
// ─────────────────────────────────────────────────────────────────
// Phase 5 readings registry. G.1 ships in M15c. G.2/G.3/G.4
// ship in M15d. G.5 ships in M15e. G.6/G.7 ship in M15f
// (this milestone). G.8/G.9 ship in M15g.
// ─────────────────────────────────────────────────────────────────

import type { Phase5ReadingSection } from './types'
import g1 from './g1-opening'
import g2 from './g2-full-resolution'
import g3 from './g3-significant-improvement'
import g4 from './g4-plateau'
import g5 from './g5-maintenance-protocol'
import g6 from './g6-early-warning-signs'
import g7 from './g7-setback-management'

export type { Phase5ReadingSection } from './types'

export const PHASE_5_READINGS: Phase5ReadingSection[] = [g1, g2, g3, g4, g5, g6, g7]
