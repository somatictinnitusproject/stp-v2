// /content/framework/phase-4/f2-postural-framing.ts
// F.2 — Postural Correction Framing
// Verbatim member-facing copy from Document 8 Part F, section F.2.
// Daily focus: "Posture is where Phase 3 gains are either
// consolidated or gradually reversed"
//
// Two profile modifiers:
//   - Sustained Desk Load Confirmed (post_sustained_desk_load=true)
//   - Cervical-Dominant Profile (profile_type='CERV_DOMINANT')
//
// The cervical-dominant modifier uses the strict-reading decision
// (M14b.2): fires only on CERV_DOMINANT. DUAL_DRIVER members do
// not see this modifier — their cervical work is one of two
// co-primary drivers, not the standalone primary driver.

import type { ReadingSection } from './types'

const f2: ReadingSection = {
  kind: 'reading',
  id: 'F2_postural_framing',
  section: 'F.2',
  title: 'Postural Correction Framing',
  estimatedMinutes: 4,
  content: [
    {
      type: 'subhead',
      text: 'Why Posture Matters for Your Tinnitus',
    },
    {
      type: 'p',
      text: 'The postural content in Phase 4 is not generic wellness advice. It has a specific mechanical purpose: reducing the daily load that continuously feeds tension back into the same structures your Phase 3 protocol is working to release.',
    },
    {
      type: 'p',
      text: 'Consider what the cervical and jaw structures are absorbing during a typical working day. Eight hours of forward head posture places continuous compressive load on the upper cervical joints and suboccipital muscles. A workstation that forces the head down and forward is not a neutral background condition; it is an active mechanical input into the same pathway the cervical protocol is targeting. Phase 3 drains the accumulated tension. Poor daily posture refills it.',
    },
    {
      type: 'p',
      text: 'This is why postural correction is a direct extension of Phase 3 work rather than a separate concern. The protocol and the postural work are addressing the same structures from two different directions — one through direct tissue release and retraining, the other through reducing the daily mechanical load those structures are absorbing.',
    },
    {
      type: 'subhead',
      text: 'The Goal',
    },
    {
      type: 'p',
      text: 'Postural correction is not about achieving perfect posture permanently. That framing sets up failure — no one maintains perfect posture throughout a full working day, and pursuing it as a standard produces frustration rather than improvement.',
    },
    {
      type: 'p',
      text: 'The realistic goal is reducing the cumulative daily mechanical load on the structures generating your primary driver signal. Workstation changes that eliminate the worst sustained positions. Movement habits that carry postural awareness into daily activity rather than confining it to a dedicated exercise window. Small reductions in sustained mechanical load, compounded across every working day, produce meaningful structural change over weeks and months.',
    },
    {
      type: 'acknowledge_prompt',
      text: 'I understand why daily posture matters for my tinnitus and what the correction work is trying to achieve',
    },
  ],
  profileModifiers: [
    {
      triggerFlag: 'post_sustained_desk_load',
      triggerValue: true,
      title: 'Sustained Desk Load Confirmed',
      content: [
        {
          type: 'p',
          text: 'Your Phase 1 assessment identified sustained desk load as a confirmed maintaining factor in your specific case. For your pattern, the postural content that follows is not supplementary; it is addressing one of the primary reasons tension continues to rebuild between protocol sessions. Workstation setup in particular warrants treating as a priority rather than an optional addition.',
        },
      ],
    },
    {
      triggerFlag: 'profile_type',
      triggerValue: 'CERV_DOMINANT',
      title: 'Cervical-Dominant Profile',
      content: [
        {
          type: 'p',
          text: 'For cervical-dominant members, postural correction has direct primary driver relevance. Forward head posture and sustained desk load are continuously reloading the same upper cervical structures Phase 3 is targeting. Reducing that daily reload is one of the most direct things you can do to support your protocol progress.',
        },
      ],
    },
  ],
}

export default f2
