// /content/framework/phase-3/d13-resistance-intro.ts
// D.13 — Resistance Phase Introduction
// Verbatim member-facing copy from Document 8 Part D, section D.13.
// No pre-launch corrections for this section.
//
// Acknowledgement of this reading is the resistance phase unlock event:
// /api/session/complete writes resistance_phase_start = NOW() on first acknowledge.
// A 7-day minimum from phase2_completed_at is enforced server-side (§4.3).

import type { ReadingSection } from './types'

const d13: ReadingSection = {
  kind: 'reading',
  id: 'D13_resistance_intro',
  section: 'D.13',
  title: 'Resistance Phase Introduction',
  estimatedMinutes: 4,
  content: [
    {
      type: 'subhead',
      text: 'The Resistance Phase',
    },
    {
      type: 'p',
      text: 'If you are reading this, your release phase has done its job. The tension that was loading your jaw and masticatory system has reduced, your tissues are responding, and the foundation is in place for the next stage of work.',
    },
    {
      type: 'p',
      text: 'The resistance phase introduces structured retraining and strengthening: neuromuscular retraining first, progressive load second. The sequence within this phase matters as much as the sequence between phases: you retrain the movement pattern before you load it, and you load it progressively rather than all at once.',
    },
    {
      type: 'subhead',
      text: 'Release Work Continues',
    },
    {
      type: 'emphasis',
      text: 'The release phase does not stop here. From this point forward the release exercises shift from the primary daily focus to a maintenance role, performed before each resistance session in the same order, at the same durations. The resistance phase adds to your protocol. It does not replace what came before.',
    },
    {
      type: 'p',
      text: 'The reason is mechanical: resistance work loads the same tissues the release work manages. If release stops when resistance begins, tension rebuilds faster than the strengthening benefit accumulates and the protocol works against itself. Release as maintenance is not optional; it is what makes the resistance work sustainable.',
    },
    {
      type: 'subhead',
      text: 'How the Resistance Phase is Structured',
    },
    {
      type: 'p',
      text: 'The work moves through a clear progression:',
    },
    {
      type: 'list',
      items: [
        'Neuromuscular retraining comes first: jaw symmetry retraining and proprioception work that corrects the movement pattern before load is introduced. You cannot retrain a movement pattern under load. Pattern correction precedes strengthening.',
        'Progressive resistance follows once the movement pattern is established: resisted opening, closing, lateral movement, and eccentric jaw control. Load increases gradually over time as the jaw adapts.',
        'Condylar repositioning is introduced later in the resistance phase for members with relevant joint findings; more advanced work that builds on the foundation the earlier exercises establish.',
        'Functional integration runs throughout, applying the retraining to how your jaw actually works during eating, speaking, and daily use.',
      ],
    },
    {
      type: 'subhead',
      text: 'Pacing',
    },
    {
      type: 'p',
      text: 'There is no fixed timeline within the resistance phase. Progress through the exercises at the rate your jaw allows. Neuromuscular retraining should feel established: movement pattern more controlled, drift reduced or absent on mirror check — before progressive resistance begins. Let the tissue and the mirror guide the pace, not a calendar.',
    },
    {
      type: 'subhead',
      text: 'How to Work Through These Sessions',
    },
    {
      type: 'p',
      text: 'The exercises in your resistance phase sessions are presented in a specific order. Work through them in sequence.',
    },
    {
      type: 'p',
      text: 'Deep Cervical Flexor Training and Jaw Symmetry Training appear first. These are motor control exercises — they activate the deep stabilising muscles of your neck and jaw. The deep cervical flexors in particular are typically underactive in people with somatic tinnitus, with the superficial muscles (SCM, scalenes, upper trapezius) compensating. Starting each session by activating the deep stabilisers means the heavier resistance work that follows loads a coordinated system rather than reinforcing the compensation pattern.',
    },
    {
      type: 'p',
      text: 'The progressive resistance exercises follow. Start at light intensity in the first week. Build load gradually as the motor control work becomes more controlled. By the second week of resistance phase, the progressive resistance exercises will be working with the foundation the motor control work has built rather than against it.',
    },
    {
      type: 'p',
      text: 'Take the order seriously. It matters more than how hard you push on any individual exercise.',
    },
    {
      type: 'acknowledge_prompt',
      text: "I understand the structure of the resistance phase and I'm ready to begin.",
    },
  ],
  profileModifiers: [],
}

export default d13
