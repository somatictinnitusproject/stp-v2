// /content/exercises/e5-suboccipital-tennis-ball.ts
// E.5 — Suboccipital Tennis Ball Release
// Verbatim member-facing copy from Document 8 Part E, section E.5.
//
// "Before you begin" warmth preamble paragraph from Doc 8 source
// omitted entirely — D.4 Heat Application supersedes it as the
// unified heat preparation step at the top of every session.
//
// Sharp pain warning rendered as callout: warning. The watch
// demonstration framing rendered as emphasis (matches d10 pattern).
//
// ProfileModifier triggers on cerv_suboccipital_asymmetric (boolean)
// and renders the side from cerv_suboccipital_tender_side. Doc 8
// references "cerv_suboccipital_dominant_side" — live schema uses
// tender_side. Literal [left / right] placeholder retained per
// Decision 2 (direction templating deferred to a future sub-step).
//
// timer: null per errata P3-17 (SustainedPressureTimer deferred).
// Member sees "Hold for 10 minutes" as text in technique paragraph.

import type { Exercise } from './_types'

const e5SuboccipitalTennisBall: Exercise = {
  kind: 'exercise',
  id: 'E5_suboccipital_tennis_ball',
  sectionRef: 'E.5',
  name: 'Suboccipital Tennis Ball Release',
  category: 'cervical-release',
  bodyRegion: 'cervical',
  libraryDurationLabel: '10 minutes',
  estimatedMinutes: 10,
  focusLine: 'The tension at the base of your skull is the signal — this is how you reduce it',

  fullContent: [
    {
      type: 'p',
      text: 'The suboccipital muscles are four pairs of small muscles sitting at the base of your skull, connecting the top of the cervical spine to the occiput. Despite their small size, they have a disproportionate influence on your tinnitus — they contain the highest density of sensory receptors of any muscle in the body relative to their size. When they are chronically compressed or hypertonic, the sensory output they send into the brainstem is unusually powerful. Reducing tension here is one of the most reliably impactful things this protocol does.',
    },
    {
      type: 'p',
      text: 'This exercise uses sustained gravity-loaded compression to allow the suboccipital muscles to gradually release. The weight of your head provides consistent, passive pressure over the full duration — no active effort required. This allows the muscles to relax fully into the compression rather than bracing against it, producing a deeper and more complete release than shorter or active techniques.',
    },
    {
      type: 'subhead',
      text: 'Equipment',
    },
    {
      type: 'p',
      text: 'Two tennis balls. Place them in a sock or tie them together with a rubber band so they sit side by side — this creates a channel for the spine and allows the balls to contact the suboccipital muscles on both sides simultaneously without pressing directly onto the vertebrae.',
    },
    {
      type: 'subhead',
      text: 'Technique',
    },
    {
      type: 'p',
      text: 'Lie on your back on a firm surface — the floor is ideal. Place the paired tennis balls at the base of your skull, positioning them so the bony ridge of the occiput rests in the channel between the two balls. The balls should sit just below the skull, not under it — you are targeting the suboccipital muscles in the hollow between the base of the skull and the top of the cervical spine.',
    },
    {
      type: 'p',
      text: 'Allow your head to rest fully onto the balls. Do not hold your head up — the weight of your head provides the compression. Let gravity do the work.',
    },
    {
      type: 'p',
      text: 'Hold for 10 minutes. Breathe slowly and allow the muscles to relax progressively into the pressure. The sensation will typically be significant in the first few minutes and ease gradually as the tissue releases. A deep ache or pressure is normal and expected.',
    },
    {
      type: 'callout',
      tone: 'warning',
      text: 'The sensation should be significant but not sharp. A deep ache, pressure, or dull discomfort is correct. Sharp, shooting, or radiating pain — particularly down into the arms or producing numbness or tingling — means the position is incorrect. Reposition before continuing.',
    },
    {
      type: 'emphasis',
      text: 'Watch the demonstration video before your first attempt. Correct ball placement and head positioning is best learned visually.',
    },
  ],

  condensedSummary: [
    {
      type: 'p',
      text: 'Two tennis balls in a sock, side by side. Lie on a firm surface, balls at the base of the skull in the channel between the two balls — just below the skull, not under it. Let head rest fully, gravity does the work. Hold 10 minutes, breathe slowly. Deep ache or pressure is correct; sharp or radiating pain means reposition.',
    },
  ],

  videoId: null,
  commonMistakes: null,
  contraindications: null,

  profileModifiers: [
    {
      triggerFlag: 'cerv_suboccipital_asymmetric',
      triggerValue: true,
      title: 'Asymmetric Suboccipital Tenderness Confirmed',
      content: [
        {
          type: 'p',
          text: 'Your assessment identified asymmetric suboccipital tenderness — more pronounced on your [left / right] side. Both sides are worked simultaneously in this exercise. Use the tenderness difference between sides as your primary progress indicator — reducing asymmetry in suboccipital tenderness over time is one of the clearest signs the release phase is working on the right side of your pattern.',
        },
      ],
    },
  ],

  shorter_session_eligible: true,
  rotation_slot: null,
  timer: null,
}

export default e5SuboccipitalTennisBall
