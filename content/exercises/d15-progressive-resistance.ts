// /content/exercises/d15-progressive-resistance.ts
// D.15 — Progressive Resistance Exercises
// Verbatim member-facing copy from Document 8 Part D, section D.15.
//
// Three sub-techniques: Resisted Opening, Resisted Closing, Resisted
// Lateral Movement. Each rendered as a subhead with technique
// paragraphs and rep count.
//
// No profile modifiers — resistance work is bilateral and uniform
// across all profiles per Doc 8.
//
// Midline tracking prerequisite rendered as emphasis block —
// informational guidance, not a gated barrier. Members are trusted
// to self-assess readiness based on Doc 8 framing.

import type { Exercise } from './_types'

const d15ProgressiveResistance: Exercise = {
  kind: 'exercise',
  id: 'D15_progressive_resistance',
  sectionRef: 'D.15',
  name: 'Progressive Resistance Exercises',
  category: 'resistance-training',
  bodyRegion: 'jaw',
  libraryDurationLabel: '8–10 reps each',
  estimatedMinutes: 3,
  focusLine: 'Load the pattern you have retrained',

  fullContent: [
    {
      type: 'p',
      text: 'Symmetry retraining corrected the movement pattern. Progressive resistance builds the strength and stability that makes that pattern durable under daily load.',
    },
    {
      type: 'p',
      text: 'The jaw responds to progressive loading — appropriate resistance stimulates the masticatory muscles to develop the strength and endurance needed to maintain correct mechanics during eating, speaking, and sustained jaw use. Without this stage the retraining gains from symmetry work are real but fragile — the pattern holds under controlled low-load conditions and degrades under the loading of normal daily function.',
    },
    {
      type: 'emphasis',
      text: 'Do not begin this section until midline tracking in symmetry retraining is reliably established. Loading a movement pattern before it is neurologically consolidated reinforces the compensatory pattern rather than the corrected one.',
    },
    {
      type: 'subhead',
      text: 'Resisted Opening',
    },
    {
      type: 'p',
      text: 'Place your thumb under the chin, providing light upward resistance. Open the jaw slowly against this resistance through the full comfortable range, maintaining midline tracking throughout. The resistance should be light — enough to create effort without disrupting the movement pattern. Close slowly with control.',
    },
    {
      type: 'p',
      text: 'Eight to ten repetitions. Increase resistance gradually across sessions as control is maintained.',
    },
    {
      type: 'subhead',
      text: 'Resisted Closing',
    },
    {
      type: 'p',
      text: 'Place your thumb on the lower front teeth, providing light downward resistance. Close the jaw slowly against this resistance from mid-open position to teeth-apart rest position. Control the closing movement — do not let the jaw snap closed against the resistance.',
    },
    {
      type: 'p',
      text: 'Eight to ten repetitions.',
    },
    {
      type: 'subhead',
      text: 'Resisted Lateral Movement',
    },
    {
      type: 'p',
      text: 'Place two fingers against the side of the chin, providing light resistance to lateral movement. Move the jaw slowly to one side against resistance, return to centre, repeat to the other side. Bilateral — equal repetitions each direction.',
    },
    {
      type: 'p',
      text: 'Six to eight repetitions each side.',
    },
    {
      type: 'subhead',
      text: 'Progression',
    },
    {
      type: 'p',
      text: 'Increase resistance gradually — only when current resistance level can be completed with full midline control and no drift recurrence. If drift returns under load, reduce resistance and consolidate at the lower level before progressing again. Drift returning under load means the pattern is not yet consolidated enough to support that resistance level — reduce and rebuild.',
    },
  ],

  condensedSummary: [
    {
      type: 'p',
      text: 'Resisted opening: thumb under chin, light upward resistance, eight to ten reps. Resisted closing: thumb on lower front teeth, light downward resistance, eight to ten reps. Resisted lateral: two fingers against side of chin, six to eight reps each direction. Increase resistance gradually — only when current level is controlled with no drift recurrence. If drift returns under load, reduce and rebuild.',
    },
  ],

  videoId: null,
  commonMistakes: null,
  contraindications: null,
  profileModifiers: [],

  shorter_session_eligible: true,
  rotation_slot: null,
  timer: null,
}

export default d15ProgressiveResistance
