// /content/exercises/d7-intraoral-pterygoid-release.ts
// D.7 — Intraoral Pterygoid Release
// Verbatim member-facing copy from Document 8 Part D, section D.7.
// Intraoral access to medial pterygoid — only effective approach to this tissue.
//
// ProfileModifiers: two modifiers (pterygoid tenderness, jaw drift).
// Side templating via {dominant_side}/{drift_direction} placeholders is DEFERRED —
// ProfileModifier type has no sideField key (follow-up M13m+).
// Content uses literal '[left / right]' per spec Decision 2.
// Note on jaw drift modifier: 'same side as / opposite side from' comparison is
// currently inert literal text — comparison logic is downstream work.

import type { Exercise } from './_types'

const d7IntraoralPterygoidRelease: Exercise = {
  kind: 'exercise',
  id: 'D7_intraoral_pterygoid_release',
  sectionRef: 'D.7',
  name: 'Intraoral Pterygoid Release',
  category: 'jaw-release',
  bodyRegion: 'jaw',
  libraryDurationLabel: '60 sec per position',
  estimatedMinutes: 2,
  focusLine: "The tissue you can't reach any other way",

  fullContent: [
    {
      type: 'p',
      text: 'The pterygoid muscles (medial and lateral) sit deep inside the jaw, connecting the skull base to the mandible. They are responsible for jaw opening, lateral movement, and protrusion, and the lateral pterygoid is the primary muscle responsible for jaw deviation on opening. When chronically overactive or asymmetrically loaded, the pterygoids generate significant trigeminal afferent input and directly produce the jaw drift pattern identified in your Phase 1 assessment.',
    },
    {
      type: 'p',
      text: 'These muscles cannot be effectively reached through external palpation; the masseter and zygomatic arch sit in the way. The intraoral approach gives direct access to the medial pterygoid and internal masseter from inside the mouth, reaching tissue that no external technique can adequately address.',
    },
    {
      type: 'subhead',
      text: 'Before You Begin',
    },
    {
      type: 'p',
      text: 'Wash your hands thoroughly. Use a clean disposable glove if preferred; either is acceptable. Your fingernail on the working finger should be short and smooth.',
    },
    {
      type: 'subhead',
      text: 'Technique',
    },
    {
      type: 'p',
      text: 'Open your mouth to a comfortable mid-range position, not forced wide open. Using your index finger, reach inside the mouth along the inner surface of the lower back teeth toward the back of the jaw on one side. The target tissue is the medial pterygoid: felt as a firm ridge of muscle running along the inner surface of the jaw angle, behind the last molar.',
    },
    {
      type: 'p',
      text: 'Apply sustained inward pressure against this tissue. The sensation will be significant: the medial pterygoid in chronic tension is often acutely tender on direct palpation. Hold for 60 seconds per position, working from the lower attachment upward along the muscle. Release and repeat on the opposite side.',
    },
    {
      type: 'p',
      text: 'Do not force the finger too far back; you do not need to reach the full muscle origin. Work within comfortable access range and let sustained pressure do the work.',
    },
  ],

  condensedSummary: [
    {
      type: 'p',
      text: 'Reach inside the mouth along the inner surface of the lower back teeth, behind the last molar. Apply sustained inward pressure against the medial pterygoid for 60 seconds per position, working from lower attachment upward. Both sides.',
    },
  ],

  videoId: null,
  commonMistakes: null,
  contraindications: null,

  profileModifiers: [
    {
      // Side templating deferred — ProfileModifier has no sideField key (follow-up M13m+).
      triggerFlag: 'tmj_pterygoid_tenderness',
      triggerValue: true,
      title: 'Pterygoid Tenderness Confirmed',
      content: [
        {
          type: 'p',
          text: 'Your assessment identified pterygoid tenderness on the [left / right] side. Apply asymmetric emphasis to this side; begin on the [left / right] and spend additional time there before working the opposite side. Tenderness reducing on palpation over weeks is one of your clearest progress indicators for this exercise.',
        },
      ],
    },
    {
      // Side templating deferred — ProfileModifier has no sideField key (follow-up M13m+).
      // 'same side as / opposite side from' comparison is inert literal text — downstream work.
      triggerFlag: 'tmj_jaw_drift',
      triggerValue: true,
      title: 'Jaw Drift Confirmed',
      content: [
        {
          type: 'p',
          text: 'Your assessment identified jaw drift to the [left / right]. Drift direction indicates the [left / right] lateral pterygoid is the overactive side. This corresponds to the same side as or the opposite side from your tenderness finding: your protocol applies emphasis accordingly.',
        },
      ],
    },
  ],

  shorter_session_eligible: true,
  rotation_slot: null,
  timer: null,
}

export default d7IntraoralPterygoidRelease
