// /content/framework/phase-5/index.ts
// ─────────────────────────────────────────────────────────────────
// Phase 5 readings registry. G.1 ships in M15c. G.2/G.3/G.4
// ship in M15d (this milestone). Remaining sections G.5–G.9
// ship in M15e–M15g.
// ─────────────────────────────────────────────────────────────────

import type { Phase5ReadingSection } from './types'
import g1 from './g1-opening'
import g2 from './g2-full-resolution'
import g3 from './g3-significant-improvement'
import g4 from './g4-plateau'

export type { Phase5ReadingSection } from './types'

export const PHASE_5_READINGS: Phase5ReadingSection[] = [g1, g2, g3, g4]
