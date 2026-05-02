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
import f7 from './f7-hypervigilance-interruption'
// F.8 (Tinnitus Neutralisation) deferred to M14g — depends on
// §3.3 hyperacusis screening + column landing first.
import f9 from './f9-masking'
import f10 from './f10-sleep-protocol'
import f11 from './f11-professional-support'

export type { ReadingSection } from './types'

export const PHASE_4_READINGS: ReadingSection[] = [f1, f2, f3, f4, f5, f6, f7, f9, f10, f11]
