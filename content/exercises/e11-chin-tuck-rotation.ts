// /content/exercises/e11-chin-tuck-rotation.ts
// E.11 — Controlled Chin-Tuck-Rotation
// Authored from Document 8 Part E §E.11 (anatomical framing only) and
// pre-launch §1.8 (technique replacement spec).
//
// Pre-launch §1.8 replaces Doc 8's SNAG-style upper cervical
// mobilisation entirely with chin-tuck-rotation. Self-administered
// SNAGs at C1-C2 carry meaningful risk (vertebrobasilar concerns,
// undiagnosed instability) — risk/reward unfavourable for a
// self-directed platform. Chin-tuck-rotation produces upper cervical
// motion through member-generated force only, much safer, and
// mechanistically consistent.
//
// Anatomical framing retained from Doc 8 source (C0-C1, C1-C2,
// upper cervical afferent pathway, DCN convergence). SNAG-specific
// paragraphs removed. Vertebral artery warning callout softened to
// match the lower-risk technique — kept as callout: warning rather
// than dropped, because gentle upper cervical work can still produce
// vertebrobasilar symptoms in members with undiagnosed instability.
//
// ProfileModifier triggers on cerv_rotation_restriction (boolean)
// and renders side from cerv_restricted_side. Wording rewritten to
// match the chin-tuck-rotation technique — extra reps + longer hold
// on restricted side rather than the SNAG-specific rotation bias.
// Literal [left / right] placeholder retained per Decision 2.

import type { Exercise } from './_types'

const e11ChinTuckRotation: Exercise = {
  kind: 'exercise',
  id: 'E11_chin_tuck_rotation',
  sectionRef: 'E.11',
  name: 'Controlled Chin-Tuck-Rotation',
  category: 'cervical-release',
  estimatedMinutes: 2,
  focusLine: 'Mobilise the joints closest to the source',

  fullContent: [
    {
      type: 'p',
      text: 'The exercises up to this point have worked on the muscles and soft tissues surrounding the upper cervical joints. This exercise works on the joints themselves — specifically C0-C1 and C1-C2, the two uppermost cervical segments that sit directly at the convergence point of the upper cervical afferent pathway feeding into your DCN.',
    },
    {
      type: 'p',
      text: 'Restricted mobility at these joints means the surrounding muscles must work harder to compensate, maintaining elevated tone in the very structures the protocol is working to release. Gentle self-mobilisation at these segments reduces that restriction directly, complements the soft tissue work done in the rest of the session, and allows the release gains to hold more durably between sessions.',
    },
    {
      type: 'p',
      text: 'This is a gentle self-mobilisation that produces movement at the upper cervical joints through your own active muscle work, rather than the applied-force techniques used in clinical mobilisation. The clinical version is more targeted, but requires hands-on training to do safely. If you have access to a physiotherapist experienced in cervical dysfunction, they can deliver the more specific version. The home version below is the safe self-administered alternative.',
    },
    {
      type: 'subhead',
      text: 'Technique',
    },
    {
      type: 'p',
      text: 'Sit upright with shoulders relaxed. Perform a chin tuck — drawing your chin straight back, not down. The chin tuck repositions the upper cervical segments before the rotation engages them.',
    },
    {
      type: 'p',
      text: 'While maintaining the chin tuck, slowly rotate your head to one side until you feel a gentle stretch sensation in the upper neck. Hold for 5 seconds. Return slowly to neutral, releasing the chin tuck only after the head returns to centre.',
    },
    {
      type: 'p',
      text: 'Repeat to the other side. The rotation is gentle — work to the point of a comfortable stretch, not to maximum range. Forced end-range rotation is not the goal.',
    },
    {
      type: 'p',
      text: 'Five to eight repetitions per side. The sensation should be a gentle stretch or mild mobilisation feeling at the base of the skull. The chin tuck is what targets the upper cervical segments specifically — without it, the rotation engages the lower cervical spine instead.',
    },
    {
      type: 'callout',
      tone: 'warning',
      text: 'Dizziness, nausea, or visual disturbance during this exercise are uncommon with the gentle chin-tuck-rotation technique but can occur in some members, particularly those with undiagnosed cervical instability. Stop immediately if these sensations appear and consult a physiotherapist before resuming. They must not be ignored.',
    },
    {
      type: 'emphasis',
      text: 'Watch the demonstration video before your first attempt. The combination of chin tuck and rotation that targets the upper cervical segments specifically is best confirmed visually.',
    },
  ],

  condensedSummary: [
    {
      type: 'p',
      text: 'Sit upright. Chin tuck (draw chin straight back, not down). Maintain the tuck while slowly rotating head to one side until gentle stretch in upper neck. Hold 5 seconds. Return slowly. Repeat to other side. Five to eight reps per side. Gentle stretch only — not forced end-range. Stop and consult physiotherapist if dizziness, nausea, or visual disturbance occur.',
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
          text: 'Your assessment identified restricted rotation — more limited on your [left / right] side. Perform an extra repetition on your restricted side: seven to eight repetitions on the [left / right], five to six on the other. Hold the rotation slightly longer on the restricted side — seven seconds instead of five. Track rotation range across sessions on the restricted side as a primary progress indicator for this exercise.',
        },
      ],
    },
  ],

  shorter_session_eligible: true,
  rotation_slot: null,
  timer: null,
}

export default e11ChinTuckRotation
