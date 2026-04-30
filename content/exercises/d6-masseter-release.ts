// /content/exercises/d6-masseter-release.ts
// D.6 — Masseter Release
// Verbatim member-facing copy from Document 8 Part D, section D.6.
// Primary jaw closing muscle; most important single exercise in the release phase.
//
// Pre-launch corrections applied:
//   §1.6 — 'Golgi tendon organ feedback' replaces 'autogenic inhibition' mechanism reference
//   §1.2 — final emphasis uses 'less consistent' framing (not 'threshold not guideline')
//   Daily focus line softened from Doc 8's '90s threshold not guideline' per §1.2
//
// ProfileModifier: triggers on tmj_masseter_asymmetry. Side-templating via {dominant_side}
// placeholder is DEFERRED — ProfileModifier type has no sideField key (follow-up M13m+).
// Content uses literal '[left / right]' per spec Decision 2.

import type { Exercise } from './_types'

const d6MasseterRelease: Exercise = {
  kind: 'exercise',
  id: 'D6_masseter_release',
  sectionRef: 'D.6',
  name: 'Masseter Release',
  category: 'jaw-release',
  estimatedMinutes: 6,
  focusLine: 'Hold steady — sustained pressure produces release',

  fullContent: [
    {
      type: 'p',
      text: 'The masseter is the primary jaw closing muscle — the thick muscle you can feel bulging at the sides of your jaw when you clench. In people with jaw-driven tinnitus it is almost universally the most significant site of chronic tension. Sustained masseter hypertonicity compresses the TMJ, loads the auriculotemporal nerve, and continuously drives afferent signalling into the trigeminal pathway.',
    },
    {
      type: 'emphasis',
      text: 'This is the most important single exercise in the release phase. Do it every session without exception.',
    },
    {
      type: 'subhead',
      text: 'Technique',
    },
    {
      type: 'p',
      text: 'Locate the masseter by placing your fingertips just below and in front of each ear and gently clenching — you will feel the muscle harden under your fingers. The muscle runs from this upper area down to the lower jaw along the angle of the mandible.',
    },
    {
      type: 'p',
      text: 'Apply sustained pressure into the muscle belly using your fingertips or thumb. Hold each position for a full 90 seconds before moving. Work through three positions — the origin at the upper attachment near the cheekbone, the belly of the muscle in the middle, and the insertion at the lower jaw angle.',
    },
    {
      type: 'p',
      text: 'The sensation under pressure should be a significant dull ache — the masseter in chronic tension is almost always tender on sustained palpation. That tenderness is the finding that confirms you are in the right tissue and working at the right depth. Over weeks of consistent release work that tenderness will reduce — tracking this change is one of your clearest indicators of protocol progress.',
    },
    {
      type: 'emphasis',
      text: 'Ninety seconds per position is the duration we recommend. Sustained pressure for 90 seconds reliably produces tissue release through Golgi tendon organ feedback — the neurological response that instructs the muscle to reduce its resting tone. Shorter durations can produce some effect but the response is less consistent.',
    },
  ],

  condensedSummary: [
    {
      type: 'p',
      text: 'Apply sustained pressure into the masseter muscle belly using your fingertips or thumb for 90 seconds per position. Three positions — origin near cheekbone, belly in the middle, insertion at jaw angle. Both sides.',
    },
  ],

  videoId: null,
  commonMistakes: null,
  contraindications: null,

  profileModifiers: [
    {
      // Side templating deferred — ProfileModifier has no sideField key (follow-up M13m+).
      // '[left / right]' is the Doc 8 literal placeholder per spec Decision 2.
      triggerFlag: 'tmj_masseter_asymmetry',
      triggerValue: true,
      title: 'Masseter Asymmetry Confirmed',
      content: [
        {
          type: 'p',
          text: 'Your assessment identified your [left / right] masseter as the dominant side — more developed or higher resting tone than the opposite side. Apply asymmetric emphasis to this side: spend additional time on each position on the [left / right], and begin each position on the dominant side before moving to the other. The bilateral work continues — the dominant side receives more attention within it.',
        },
      ],
    },
  ],

  shorter_session_eligible: true,
  rotation_slot: null,
  timer: null,
}

export default d6MasseterRelease
