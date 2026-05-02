// /content/framework/phase-4/f1-opening.ts
// F.1 — Phase 4 Opening and Orientation
// Verbatim member-facing copy from Document 8 Part F, section F.1.
// Daily focus: "The habits that reload the tension your protocol
// is releasing"
//
// Pre-launch §1.10 applied: PMR reference removed from the
// nervous-system summary paragraph under "What Phase 4 Covers".
//
// Dynamic ContentBlock { type: 'dynamic', source:
// 'phase4_confirmed_flags' } resolves at render time in
// ReadingView — renders the confirmed maintaining-factor list
// from phase1, or the no-flags fallback paragraph.
//
// Note: Doc 8 F.1 system note specifies a first_view boolean
// controlling whether subsequent visits skip orientation text.
// Phase 4 uses the inline-expand reviewMode pattern instead
// (decided in M14b.0) — first_view does not apply. Full content
// always renders when expanded; acknowledge button hidden once
// exercises_viewed[id] = true.

import type { ReadingSection } from './types'

const f1: ReadingSection = {
  kind: 'reading',
  id: 'F1_phase4_opening',
  section: 'F.1',
  title: 'Phase 4 Opening and Orientation',
  estimatedMinutes: 5,
  content: [
    {
      type: 'subhead',
      text: 'Phase 4 — Maintaining Factors',
    },
    {
      type: 'p',
      text: 'Phase 3 addresses the source of the abnormal input driving your tinnitus — the specific physical pathways generating the signal. Phase 4 addresses something equally important: the daily patterns that continuously reload tension into those same structures between sessions.',
    },
    {
      type: 'p',
      text: 'The two phases work together. Protocol work releases tension that has accumulated. Daily habits either slow that accumulation or accelerate it. Someone running an effective cervical protocol while spending eight hours daily in forward head posture is releasing tension in the evening and rebuilding it the next morning. Someone doing excellent jaw release work while habitually clenching through every desk session is doing the same thing in reverse. Phase 4 exists to close that gap.',
    },
    {
      type: 'subhead',
      text: 'When to Engage With Phase 4',
    },
    {
      type: 'p',
      text: 'Phase 4 is available to read at any point from Phase 2 onwards. The framing and nervous system content can be useful context at any stage. The postural and workstation content is most productive once Phase 3 is underway — addressing the daily patterns that reload tension is most relevant once the protocol work releasing that tension has begun. If you are reading this before or early in Phase 3, take in what is here and return to the practical work once your protocol is established.',
    },
    {
      type: 'subhead',
      text: 'What Phase 4 Covers',
    },
    {
      type: 'p',
      text: 'Phase 4 is split into two areas.',
    },
    {
      type: 'p',
      text: 'The first is postural — workstation setup and movement pattern integration. These are the daily mechanical patterns that load or protect the cervical and jaw structures your protocol is working on.',
    },
    {
      type: 'p',
      text: 'The second is nervous system and psychological — breath work, hypervigilance interruption, masking guidance, tinnitus neutralisation, sleep, and professional support signposting. These address the autonomic amplification layer that sits on top of the physical driver signal.',
    },
    {
      type: 'subhead',
      text: 'Your Phase 4 Profile',
    },
    // Dynamic block — resolved in ReadingView's phase4_confirmed_flags
    // branch. Renders preamble + bulleted list when flags qualify, or
    // fallback paragraph when none do.
    {
      type: 'dynamic',
      source: 'phase4_confirmed_flags',
    },
    {
      type: 'p',
      text: 'The sections most relevant to your specific pattern are highlighted in your Phase 4 navigation. Work through the content at your own pace — there is no fixed order and no minimum duration. The goal is genuine integration, not completion for its own sake.',
    },
    {
      type: 'acknowledge_prompt',
      text: 'I understand what Phase 4 covers and how it fits alongside my protocol work',
    },
  ],
}

export default f1
