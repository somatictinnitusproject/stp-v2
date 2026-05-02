// /content/exercises/e14-cervical-rotation-holds.ts
// E.14 — Cervical Rotation Holds
// Verbatim member-facing copy from Document 8 Part E, section E.14.
//
// Pairs with E.15 — both share the cerv_rotation_restriction
// profile modifier trigger but apply the asymmetric finding
// differently: E.14 emphasises restricted-first ordering and an
// additional repetition on the restricted side; E.15 emphasises
// proprioceptive error correlation with the restriction.
//
// ProfileModifier triggers on cerv_rotation_restriction (boolean)
// and renders side from cerv_restricted_side. Literal [left / right]
// placeholder retained per Decision 2.

import type { Exercise } from './_types'

const e14CervicalRotationHolds: Exercise = {
  kind: 'exercise',
  id: 'E14_cervical_rotation_holds',
  sectionRef: 'E.14',
  name: 'Cervical Rotation Holds',
  category: 'resistance-training',
  estimatedMinutes: 4,
  focusLine: 'Retrain control at the ranges where the dysfunction lives',

  fullContent: [
    {
      type: 'p',
      text: 'Cervical rotation is the movement most directly loaded by the upper cervical joint mechanics implicated in somatic tinnitus. The C1-C2 joint provides the majority of cervical rotation range — it is the segment most directly involved in upper cervical afferent input, and restricted or asymmetric rotation is one of the clearest functional indicators of upper cervical dysfunction identified in Phase 1.',
    },
    {
      type: 'p',
      text: 'This exercise builds controlled strength and motor stability at end-range rotation — the position where the upper cervical joints are most loaded and where dysfunctional movement patterns are most likely to produce abnormal input. Isometric holds at end range train the deep cervical stabilisers to maintain joint position under load rather than allowing the joint to drift into compensatory positions. Over time this produces more stable, controlled rotation mechanics and reduces the abnormal loading pattern at C1-C2.',
    },
    {
      type: 'emphasis',
      text: 'This is not a stretching exercise. The goal is not to increase rotation range through passive lengthening — it is to build active neuromuscular control throughout the available range, particularly at its limit.',
    },
    {
      type: 'subhead',
      text: 'Technique',
    },
    {
      type: 'p',
      text: 'Sit upright in a chair with your spine neutral and your shoulders relaxed. Perform a gentle chin tuck to establish the correct starting position — this ensures the rotation occurs at the cervical spine rather than being driven by compensatory head movement.',
    },
    {
      type: 'p',
      text: 'From the chin tuck position, rotate your head slowly to one side — moving through the full comfortable range until you reach the natural end of your rotation. Do not force beyond comfortable end range. Do not allow the chin to protrude forward or the head to tilt as you rotate — maintain the retracted position throughout the movement.',
    },
    {
      type: 'p',
      text: 'At end range, hold the position isometrically for 10 seconds. The hold should feel like controlled effort — the muscles maintaining the position against the natural tendency to drift back toward neutral. Breathe normally throughout the hold.',
    },
    {
      type: 'p',
      text: 'Return slowly to centre with control. Do not allow the head to spring back — the return movement should take the same time as the rotation out.',
    },
    {
      type: 'p',
      text: 'Repeat to the other side. That is one full repetition.',
    },
    {
      type: 'p',
      text: 'Five repetitions per side per session. As control improves and the holds feel stable, progress to 20 to 30 second holds before increasing repetitions.',
    },
    {
      type: 'p',
      text: 'The common mistake is rotating too quickly and relying on momentum rather than controlled muscular effort. The movement should be slow enough that you are aware of the muscular activity maintaining it throughout — not a quick turn to end range and a passive hold.',
    },
    {
      type: 'emphasis',
      text: 'Watch the demonstration video before your first attempt. The chin tuck starting position and the controlled return movement are best confirmed visually.',
    },
  ],

  condensedSummary: [
    {
      type: 'p',
      text: 'Sit upright, gentle chin tuck. Slowly rotate head to one side through full comfortable range — maintain chin tuck throughout, do not let chin protrude or head tilt. Hold end range isometrically for 10 seconds. Return slowly with control — same time as the rotation out. Repeat other side. Five reps per side. Slow controlled movement, not momentum. Progress to 20 to 30 second holds before adding reps.',
    },
  ],

  videoId: null,
  commonMistakes: null,
  contraindications: null,

  profileModifiers: [
    {
      triggerFlag: 'cerv_rotation_restriction',
      triggerValue: true,
      title: 'Rotation Restriction Confirmed',
      content: [
        {
          type: 'p',
          text: 'Your assessment identified restricted rotation on your [left / right] side. Begin each set on your restricted side — working the more challenging direction first when the muscles are freshest. Perform an additional repetition on the restricted side: six repetitions to the [left / right], five to the other. Track the restricted side as your primary progress indicator — increasing end range and reducing the effort required to hold there over time is the clearest functional sign the retraining phase is working.',
        },
      ],
    },
  ],

  shorter_session_eligible: true,
  rotation_slot: null,
  timer: null,
}

export default e14CervicalRotationHolds
