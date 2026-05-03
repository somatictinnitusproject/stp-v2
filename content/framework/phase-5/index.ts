// /content/framework/phase-5/index.ts
// ─────────────────────────────────────────────────────────────────
// Phase 5 readings registry. Content series complete with M15g.
// G.1 (M15c) opening + outcome selection.
// G.2/G.3/G.4 (M15d) outcome-type sections.
// G.5 (M15e) maintenance protocol with profile_variant.
// G.6/G.7 (M15f) warning signs + setback management.
// G.8/G.9 (M15g) habit integration + framework close.
// ─────────────────────────────────────────────────────────────────

import type { Phase5ReadingSection } from './types'
import g1 from './g1-opening'
import g2 from './g2-full-resolution'
import g3 from './g3-significant-improvement'
import g4 from './g4-plateau'
import g5 from './g5-maintenance-protocol'
import g6 from './g6-early-warning-signs'
import g7 from './g7-setback-management'
import g8 from './g8-long-term-habit-integration'
import g9 from './g9-knowing-when-done'

export type { Phase5ReadingSection } from './types'

export const PHASE_5_READINGS: Phase5ReadingSection[] = [g1, g2, g3, g4, g5, g6, g7, g8, g9]
