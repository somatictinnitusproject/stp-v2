// /content/framework/phase-3/types.ts
// ─────────────────────────────────────────────────────────────────────────────
// ReadingSection type for Phase 3 orientation and framing sections.
// These are NOT exercises — they have no video, no timer, and no condensed
// view. They appear in the session list until acknowledged, then are omitted.
//
// Authority: M13l Locked Decision 1 (type shape), P3-4 (no condensed view —
// always full content on every visit before acknowledgement).
// ─────────────────────────────────────────────────────────────────────────────

import type { ContentBlock, ProfileModifier } from '@/content/exercises/_types'

// ReadingSection — one orientation/framing section in the session flow.
// kind: 'reading' is the discriminant for the (Exercise | ReadingSection)[] union
// in the session client render loop.
export interface ReadingSection {
  kind: 'reading'
  id: string                        // e.g. 'D1_phase3_opening'
  section: string                   // e.g. 'D.1'
  title: string                     // display title, verbatim from Doc 8
  estimatedMinutes: number
  content: ContentBlock[]           // may include { type: 'dynamic' } blocks for D.1
  profileModifiers?: ProfileModifier[]  // optional; same interface as Exercise profile modifiers
  acknowledgeLabel?: string         // optional; defaults to 'Acknowledge'. Phase 4 practical sections (F.3, F.4, F.6+) set this to 'Done'.
}
