// /content/exercises/e7-levator-scapulae-stretching.ts
// E.7 — Levator Scapulae Stretching
// Verbatim member-facing copy from Document 8 Part E, section E.7.
//
// ProfileModifier triggers on post_shoulder_asymmetry (boolean) AND
// renders side from post_elevated_side. Literal [left / right]
// placeholder retained per Decision 2.
//
// Pre-launch correction: rotation direction was inverted in original Doc 8 source.
// Levator scapulae stretch requires contralateral rotation (rotate AWAY from
// stretching side), not ipsilateral. Disambiguation from E.6 SCM is via scapular
// anchor and side-flexion plane, not rotation direction (both rotate away).

import type { Exercise } from './_types'

const e7LevatorScapulaeStretching: Exercise = {
  kind: 'exercise',
  id: 'E7_levator_scapulae_stretching',
  sectionRef: 'E.7',
  name: 'Levator Scapulae Stretching',
  category: 'cervical-release',
  bodyRegion: 'cervical',
  libraryDurationLabel: '60 sec per side',
  estimatedMinutes: 2,
  focusLine: 'Release the muscle connecting your shoulder to your upper cervical spine',

  fullContent: [
    {
      type: 'p',
      text: 'The levator scapulae runs from the upper cervical transverse processes (the bony projections on the sides of C1 through C4) down to the upper inner corner of the shoulder blade. Its job is to elevate the scapula. When chronically tight, it does two things simultaneously: it pulls the shoulder blade upward, producing the elevated shoulder pattern identified in Phase 1, and it loads the upper cervical joints directly at the attachment points where upper cervical afferent input originates.',
    },
    {
      type: 'p',
      text: 'This makes it one of the more mechanically direct contributors to cervical driver tinnitus; chronic levator tension is continuously pulling on the very cervical structures the protocol is working to decompress. Stretching it consistently reduces that continuous load.',
    },
    {
      type: 'p',
      text: 'The stretch position requires care. The levator scapulae and upper trapezius run close to each other, and an incomplete position will target the upper trap instead. Two things isolate the levator: anchoring the shoulder blade firmly down on the side being stretched, and combining contralateral head rotation with forward diagonal flexion toward the opposite shoulder rather than the upward extension used for the SCM.',
    },
    {
      type: 'subhead',
      text: 'Technique',
    },
    {
      type: 'p',
      text: 'Sit upright in a chair. To stretch the right levator scapulae:',
    },
    {
      type: 'p',
      text: 'First, anchor the right shoulder blade down: reach your right arm behind your back or tuck your right hand under your thigh. This prevents the shoulder from shrugging upward during the stretch, which would slacken the muscle rather than lengthen it. Keeping the shoulder anchored is what makes this stretch effective.',
    },
    {
      type: 'p',
      text: 'With the shoulder anchored, drop your chin toward your chest. Then rotate your head away from the side you are stretching — for the right levator, rotate your head to the left. Then tilt your head forward and down toward the opposite shoulder, bringing your nose toward your left knee. The combination of chin drop, contralateral rotation, and forward diagonal tilt isolates the levator scapulae.',
    },
    {
      type: 'p',
      text: 'You should feel the stretch deep in the back of the neck on the right side, running diagonally from the base of the skull down toward the shoulder blade on the anchored side. If the stretch is felt primarily at the top of the shoulder, the anchor is insufficient or the rotation is incomplete.',
    },
    {
      type: 'p',
      text: 'Hold for 30 to 45 seconds per side. Repeat twice on each side.',
    },
  ],

  condensedSummary: [
    {
      type: 'p',
      text: 'Sit upright. To stretch right levator: anchor right shoulder blade down (arm behind back or hand under thigh), drop chin to chest, rotate head left (away from the stretching side), tilt forward and down toward your left knee. Feel stretch deep in back of right neck, base of skull to shoulder blade. 30 to 45 seconds per side, two reps each.',
    },
  ],

  videoId: null,
  commonMistakes: null,
  contraindications: null,

  profileModifiers: [
    {
      triggerFlag: 'post_shoulder_asymmetry',
      triggerValue: true,
      title: 'Elevated Shoulder Confirmed',
      content: [
        {
          type: 'p',
          text: 'Your assessment identified an elevated shoulder on your [left / right] side. The levator scapulae on that side is chronically shortened; it is the primary muscle maintaining that elevation pattern. Perform an additional set on your elevated side: three repetitions on the [left / right], two on the other. Reducing tone on that side specifically is one of the most direct interventions available for your asymmetric pattern.',
        },
      ],
    },
  ],

  shorter_session_eligible: true,
  rotation_slot: null,
  timer: null,
}

export default e7LevatorScapulaeStretching
