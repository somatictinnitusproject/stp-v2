// /content/exercises/d10-tmj-distraction.ts
// D.10 — TMJ Distraction
// Verbatim member-facing copy from Document 8 Part D, section D.10.
//
// Pre-launch §1.6 correction applied: clinician-delivered vs. self-administered
// framing added as the FIRST paragraph, before the existing opening paragraph.
//
// ProfileModifiers: two modifiers (tmj_joint_sounds, tmj_opening_restriction).
// Both can render simultaneously if both flags are true.
// Contraindications: callout warning block for active inflammatory flare.

import type { Exercise } from './_types'

const d10TmjDistraction: Exercise = {
  kind: 'exercise',
  id: 'D10_tmj_distraction',
  sectionRef: 'D.10',
  name: 'TMJ Distraction',
  category: 'jaw-release',
  estimatedMinutes: 2,
  focusLine: 'Decompress the joint the tension has been loading',

  fullContent: [
    {
      type: 'p',
      text: 'If you have access to a physiotherapist or dental specialist trained in manual therapy, this is something they can deliver more effectively than you can self-administer. The home version below is a gentler self-administered approximation that may produce some benefit but is not equivalent to clinician-delivered distraction.',
    },
    {
      type: 'p',
      text: 'Every exercise in the release phase up to this point has worked on the muscles and nerves surrounding the TMJ. This exercise works on the joint itself.',
    },
    {
      type: 'p',
      text: "TMJ distraction applies gentle traction to the jaw joint — a controlled inferior and slightly forward pull on the mandible that separates the joint surfaces briefly, decompresses the disc space, and reduces the intracapsular pressure that accumulates under chronic muscular loading. Performed consistently over time it contributes to disc repositioning and reduces the compressive load on the posterior capsule where the auriculotemporal nerve's articular branches are most concentrated.",
    },
    {
      type: 'p',
      text: 'This is a simplified version of a technique used in physiotherapy TMJ treatment. The home version produces a genuine decompressive effect when performed correctly.',
    },
    {
      type: 'subhead',
      text: 'Technique',
    },
    {
      type: 'p',
      text: 'Sit upright with your head in a neutral position. Place both thumbs on the lower back molars — one thumb on each side, resting on the chewing surface of the last molar you can comfortably reach. Your fingers rest under the chin for stability.',
    },
    {
      type: 'p',
      text: 'Apply gentle, sustained downward pressure through your thumbs — drawing the lower jaw slowly and evenly downward. The movement is small — a few millimetres of separation is sufficient. You are not trying to open the mouth wide. You are creating a gentle sustained traction force that decompresses the joint space.',
    },
    {
      type: 'p',
      text: 'Hold the traction for 30 to 45 seconds. Release slowly — do not let the jaw snap back. Repeat three times.',
    },
    {
      type: 'p',
      text: 'The sensation should be one of gentle decompression or mild stretch at the joint — often producing an immediate sense of relief around the ear and jaw area. If you feel pain rather than relief, reduce the traction force significantly.',
    },
    {
      type: 'emphasis',
      text: 'Watch the demonstration video before your first attempt.',
    },
  ],

  condensedSummary: [
    {
      type: 'p',
      text: 'Sit upright with thumbs on the lower back molars and fingers under the chin for stability. Apply gentle sustained downward pressure for 30 to 45 seconds — a few millimetres of separation is sufficient. Release slowly. Repeat three times.',
    },
  ],

  videoId: null,
  commonMistakes: null,

  contraindications: [
    {
      type: 'callout',
      tone: 'warning',
      text: 'Do not perform this exercise during an active TMJ inflammatory flare. If your jaw joint is acutely painful, swollen, or significantly more restricted than usual, skip this exercise until the flare settles. Distraction during active inflammation can temporarily increase joint pain. All other release exercises can continue during a flare.',
    },
  ],

  profileModifiers: [
    {
      triggerFlag: 'tmj_joint_sounds',
      triggerValue: true,
      title: 'Joint Sounds Confirmed',
      content: [
        {
          type: 'p',
          text: 'Your assessment identified joint sounds — clicking or popping — in your Phase 1 assessment. TMJ distraction is particularly relevant to your presentation. The disc displacement that produces these findings is directly addressed by this exercise. You may notice an immediate reduction in joint sounds after distraction sessions as the protocol progresses.',
        },
      ],
    },
    {
      triggerFlag: 'tmj_opening_restriction',
      triggerValue: true,
      title: 'Restricted Opening Confirmed',
      content: [
        {
          type: 'p',
          text: 'Your assessment identified restricted opening in your Phase 1 assessment. TMJ distraction is particularly relevant to your presentation. The intracapsular compression that limits opening range is directly addressed by this exercise. You may notice a sense of increased ease of opening after distraction sessions as the protocol progresses.',
        },
      ],
    },
  ],

  shorter_session_eligible: true,
  rotation_slot: null,
  timer: null,
}

export default d10TmjDistraction
