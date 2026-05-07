// /content/framework/phase-3/d1-opening.ts
// D.1 — Phase 3 Opening and Orientation
// Verbatim member-facing copy from Document 8 Part D, section D.1.
// Daily focus: "The source, not the symptoms"
//
// Two dynamic ContentBlocks resolve at render time in ReadingView:
//   { type: 'dynamic', source: 'protocol_assignment' } — pulled from profile_type
//   { type: 'dynamic', source: 'protocol_option' }    — pulled from protocol_option (1|2|3|null)

import type { ReadingSection } from './types'

const d1: ReadingSection = {
  kind: 'reading',
  id: 'D1_phase3_opening',
  section: 'D.1',
  title: 'Phase 3 Opening and Orientation',
  estimatedMinutes: 5,
  content: [
    {
      type: 'subhead',
      text: 'Phase 3: Jaw and Masticatory System Protocol',
    },
    {
      type: 'p',
      text: 'Phase 3 is where the actual work happens. Phases 1 and 2 built the foundation: your driver profile is identified, your maintaining factors are addressed. What follows is the direct intervention. This is a structured protocol targeting your jaw and masticatory system specifically, the physical pathway your assessment identified as the source of your tinnitus. The release and retraining work that follows is aimed at reducing the abnormal input driving your DCN at its origin. Not symptom management. The source.',
    },
    {
      type: 'p',
      text: 'Read this section fully before starting your first session.',
    },
    {
      type: 'subhead',
      text: 'Your Protocol',
    },
    // Protocol assignment sentence — resolved from profile_type at render time.
    // e.g. "Full jaw release protocol (Weeks 1–2 daily) → jaw resistance..."
    {
      type: 'dynamic',
      source: 'protocol_assignment',
    },
    // Session structure option — resolved from protocol_option (1|2|3) at render time.
    // e.g. "You selected Option 3: Prioritised Parallel. Full primary protocol..."
    // Omitted silently when protocol_option is null (single-driver / low-confidence).
    {
      type: 'dynamic',
      source: 'protocol_option',
    },
    {
      type: 'subhead',
      text: 'How Phase 3 Works',
    },
    {
      type: 'p',
      text: 'The protocol has two phases that run in sequence.',
    },
    {
      type: 'p',
      text: 'The release phase comes first. Daily sessions focused on reducing tension, improving tissue mobility, and decompressing the jaw and masticatory structures that are generating abnormal input. This phase runs for a minimum of one to two weeks before any resistance work is introduced; your body needs time to respond to the release work before load is added. You decide when you are ready to progress based on how your tissues are responding, not a fixed date.',
    },
    {
      type: 'p',
      text: 'The resistance phase follows. Once the release phase has produced genuine tissue change, structured retraining and strengthening work begins. Release work continues daily as maintenance throughout; the resistance phase adds to the protocol, it does not replace what came before.',
    },
    {
      type: 'p',
      text: 'Both phases are covered in full in the sections that follow. Read everything before beginning.',
    },
    {
      type: 'acknowledge_prompt',
      text: 'I’ve read the protocol overview and I’m ready to continue.',
    },
  ],
}

export default d1
