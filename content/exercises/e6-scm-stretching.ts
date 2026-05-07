// /content/exercises/e6-scm-stretching.ts
// E.6 — SCM Stretching
// Verbatim member-facing copy from Document 8 Part E, section E.6.
//
// ProfileModifier triggers on cerv_scm_asymmetry (boolean) AND
// renders side from cerv_scm_dominant_side. Literal [left / right]
// placeholder retained per Decision 2.
//
// Pre-launch §4.2 shorter-session rotation design treats E.6 as one
// of three "Atan 2020 triumvirate" rotating cervical exercises
// (SCM, levator, upper trap). Numbering in pre-launch doc is offset
// — Doc 8 numbering authoritative.

import type { Exercise } from './_types'

const e6ScmStretching: Exercise = {
  kind: 'exercise',
  id: 'E6_scm_stretching',
  sectionRef: 'E.6',
  name: 'SCM Stretching',
  category: 'cervical-release',
  bodyRegion: 'cervical',
  libraryDurationLabel: '60 sec per side',
  estimatedMinutes: 2,
  focusLine: 'Lengthen the muscle that\'s pulling your head out of position',

  fullContent: [
    {
      type: 'p',
      text: 'The sternocleidomastoid runs diagonally from just behind your ear down to your collarbone; one on each side of the neck. When chronically hypertonic, it pulls the head into ipsilateral rotation and contralateral lateral flexion, maintaining abnormal cervical joint mechanics and continuously loading the upper cervical structures on the opposite side. It is one of the primary muscles driving lateralised cervical tension patterns.',
    },
    {
      type: 'p',
      text: 'Stretching the SCM directly lengthens the muscle and reduces its resting tone over time. Performed consistently as part of the daily release sequence, it reduces the mechanical load the SCM places on the upper cervical joints and contributes to more symmetrical cervical movement patterns.',
    },
    {
      type: 'subhead',
      text: 'Getting the Position Right',
    },
    {
      type: 'p',
      text: 'The SCM stretch requires a specific combination of movements to isolate the muscle correctly. The most common mistake is an incomplete position that targets the upper trapezius instead: the stretch will feel similar but the wrong tissue is being lengthened.',
    },
    {
      type: 'subhead',
      text: 'Technique',
    },
    {
      type: 'p',
      text: 'Sit upright in a chair with your back straight and both feet flat on the floor. To stretch the right SCM:',
    },
    {
      type: 'p',
      text: 'Tuck your chin slightly: this is a small movement, not an exaggerated chin tuck. Then rotate your head to the left, away from the side you are stretching. Then tilt your head upward and to the left , looking up and to the left. The combination of chin tuck, rotation away, and upward tilt is what isolates the SCM rather than the upper trapezius.',
    },
    {
      type: 'p',
      text: 'You should feel the stretch running from just behind your ear down toward your collarbone on the right side. If the stretch is felt primarily at the top of the shoulder or the side of the neck rather than along that diagonal line, the position needs adjustment; ensure you have rotated far enough away and added sufficient upward tilt.',
    },
    {
      type: 'p',
      text: 'Hold for 30 to 45 seconds per side. Repeat twice on each side. Do not force the range; work to the point of a firm comfortable stretch and hold there.',
    },
    {
      type: 'p',
      text: 'Repeat on the left side by reversing the direction of all movements.',
    },
    {
      type: 'emphasis',
      text: 'Watch the demonstration video carefully before your first attempt. The specific combination of movements that isolates the SCM is best learned visually; written description alone is not sufficient for correct positioning.',
    },
  ],

  condensedSummary: [
    {
      type: 'p',
      text: 'Sit upright. To stretch right SCM: chin tuck slightly, rotate head left, tilt head upward and to the left. Feel the stretch from behind your ear to your collarbone on the right. 30 to 45 seconds per side, two reps each. Reverse direction for left SCM. Do not force the range.',
    },
  ],

  videoId: null,
  commonMistakes: null,
  contraindications: null,

  profileModifiers: [
    {
      triggerFlag: 'cerv_scm_asymmetry',
      triggerValue: true,
      title: 'SCM Asymmetry Confirmed',
      content: [
        {
          type: 'p',
          text: 'Your assessment identified asymmetric SCM tone: more pronounced on your [left / right] side. Perform the standard bilateral stretch but spend an additional set on your dominant side. Three repetitions on the [left / right], two on the other. The dominant side is the one pulling your cervical mechanics furthest from neutral; it warrants the additional attention.',
        },
      ],
    },
  ],

  shorter_session_eligible: true,
  rotation_slot: null,
  timer: null,
}

export default e6ScmStretching
