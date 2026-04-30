// /content/framework/phase-3/d2-forewarning.ts
// D.2 — Forewarning: What to Expect in the First Week
// Verbatim member-facing copy from Document 8 Part D, section D.2.
// Daily focus: "Tissue response is progress, even when it doesn't feel like it"
//
// Profile modifier: triggers when tmj_morning_soreness === true (morning jaw
// soreness is the Phase 1 Module 1 indicator for nocturnal clenching/bruxism).

import type { ReadingSection } from './types'

const d2: ReadingSection = {
  kind: 'reading',
  id: 'D2_forewarning',
  section: 'D.2',
  title: 'Forewarning: What to Expect in the First Week',
  estimatedMinutes: 4,
  content: [
    {
      type: 'subhead',
      text: 'Before You Begin — Read This First',
    },
    {
      type: 'p',
      text: 'There is something important to understand before your first session, and it is worth reading carefully.',
    },
    {
      type: 'p',
      text: 'Tinnitus may temporarily increase during the first week or two of release work. This is expected, it is normal, and it is not a sign that the protocol is making things worse.',
    },
    {
      type: 'p',
      text: 'Here is why it happens.',
    },
    {
      type: 'p',
      text: 'The release work actively works into tissues that have been under chronic tension — often for months or years. In the early sessions that tissue is being compressed, mobilised, and asked to change. The inflammatory response that follows — the same response that follows any effective manual therapy — temporarily increases the sensitivity of the local nervous system, including the trigeminal pathway feeding into your DCN. The result is a short-term increase in the signal that produces tinnitus before that signal begins to reduce.',
    },
    {
      type: 'p',
      text: 'This is the same mechanism that makes muscles sore after the first session of a new exercise programme. The soreness is not damage — it is adaptation beginning. The temporary tinnitus increase is not worsening — it is the early phase of the same process.',
    },
    {
      type: 'subhead',
      text: 'What This Looks Like in Practice',
    },
    {
      type: 'list',
      items: [
        'Tinnitus may feel louder or more intrusive during or immediately after sessions, particularly in the first few days.',
        'It may feel worse on waking during the first one to two weeks.',
        'It may fluctuate more than usual rather than following its previous pattern.',
      ],
    },
    {
      type: 'subhead',
      text: 'What to Do',
    },
    {
      type: 'p',
      text: 'Continue the protocol. Reducing pressure during a session if tenderness is significant is fine — the technique instructions note appropriate pressure levels throughout. Stopping the protocol because tinnitus has temporarily increased is the one response that guarantees the increase continues.',
    },
    {
      type: 'p',
      text: 'The members who abandon the protocol in the first week do so at exactly the wrong moment — when the tissue is actively responding and the process has genuinely begun.',
    },
    {
      type: 'p',
      text: 'If tinnitus increase persists beyond two to three weeks of consistent release work without any settling, that is worth noting in your progress tracker and reviewing. A sustained increase beyond that window is not the expected pattern.',
    },
    {
      type: 'emphasis',
      text: 'I understand that temporary tinnitus increase is a normal part of the early release phase and I will not use morning loudness as my primary progress indicator during this period.',
    },
  ],
  profileModifiers: [
    {
      // Triggers when morning jaw soreness confirmed in phase1_assessment Module 1.
      // Morning soreness is the Phase 1 indicator for nocturnal clenching/bruxism.
      triggerFlag: 'tmj_morning_soreness',
      triggerValue: true,
      title: 'Profile Modifier — Nocturnal Clenching or Morning Soreness Confirmed',
      content: [
        {
          type: 'p',
          text: 'Morning loudness is particularly unreliable as a progress indicator during release work if you clench or grind during sleep. The jaw loads overnight for hours uninterrupted — morning readings during active release work reflect that accumulated overnight load on freshly worked tissues, not your underlying trajectory. Do not use morning loudness as your primary indicator during this phase.',
        },
      ],
    },
  ],
}

export default d2
