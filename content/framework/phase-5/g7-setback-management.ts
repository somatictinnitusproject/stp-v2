// /content/framework/phase-5/g7-setback-management.ts
// G.7 — Setback Management
// Verbatim member-facing copy from Document 8 Part G, section G.7.
// Daily focus: "A spike is the system under temporary strain — not
// evidence that the gains have gone"
//
// 20 content blocks. No profileModifiers.
// acknowledgeLabel: 'Complete'. No acknowledgeRequires, no noAcknowledge.

import type { Phase5ReadingSection } from './types'

const g7: Phase5ReadingSection = {
  kind: 'reading',
  id: 'G7_phase5_setback_management',
  section: 'G.7',
  title: 'Setback Management',
  estimatedMinutes: 8,
  acknowledgeLabel: 'Complete',
  content: [
    {
      type: 'p',
      text: 'Tinnitus will spike during periods of high stress, illness, significant sleep disruption, or physical strain — regardless of how effectively the framework has worked and regardless of how long the improvement has been stable. This is normal. It is expected. It is not evidence that progress has reversed or that the gains achieved through the protocol are fragile.',
    },
    {
      type: 'p',
      text: 'The difference between members who handle setbacks well and those who do not is almost entirely framing. A member who understands that a spike means the system is under temporary strain responds with a targeted protocol reset and returns to baseline within one to two weeks. A member who interprets the same spike as evidence that all progress has been lost responds with anxiety — which activates the anxiety-tinnitus loop, amplifies the perceived loudness further, and converts a temporary strain response into a sustained regression. The setback itself is rarely the problem. The catastrophising response to it is.',
    },
    {
      type: 'subhead',
      text: 'What a Setback Actually Is',
    },
    {
      type: 'p',
      text: 'A tinnitus spike during a setback period is the DCN responding to a temporary increase in input or a temporary reduction in its threshold. Illness elevates systemic inflammation and sensitises central neural pathways. High stress elevates sympathetic tone and increases muscle tension in the jaw and cervical structures simultaneously. Significant sleep disruption reduces central inhibitory tone, lowering the threshold at which DCN activity produces conscious tinnitus perception. In each case the underlying mechanism is temporary and resolves when the precipitating condition resolves — provided the anxiety response does not extend and amplify it beyond that window.',
    },
    {
      type: 'p',
      text: 'The protocol gains are not lost during a setback. The tissue changes produced by weeks and months of consistent release and retraining work do not reverse in a week of high stress or illness. What changes temporarily is the system’s operating conditions — the threshold and amplification environment — not the structural foundation the protocol has built.',
    },
    {
      type: 'subhead',
      text: 'Identifying the Trigger',
    },
    {
      type: 'p',
      text: 'Where possible, identify what produced the setback before responding to it. The response is the same regardless of trigger, but understanding the cause reduces the alarm response and makes the timeline expectation more accurate.',
    },
    {
      type: 'p',
      text: 'Common setback triggers and their typical resolution windows:',
    },
    {
      type: 'list',
      items: [
        'Illness — elevated tinnitus during and immediately after illness, particularly respiratory illness or anything producing systemic inflammation, is extremely common. Resolution typically follows illness resolution by one to two weeks as inflammation subsides and central sensitisation reduces.',
        'High stress event — a sustained high-stress period produces elevated loudness that typically begins resolving within one to two weeks of stress reduction, provided nervous system regulation work is maintained or increased during the period.',
        'Sleep disruption — a run of significantly poor sleep produces loudness increases that resolve as sleep quality restores. The sleep protocol from F.10 applied consistently is the primary response alongside the protocol reset.',
        'Physical strain — significant physical exertion, postural strain from travel, or a period of increased desk load can temporarily increase cervical or jaw tension beyond the maintenance protocol’s capacity to manage. Resolution follows reduction of the precipitating load combined with increased release work frequency.',
      ],
    },
    {
      type: 'subhead',
      text: 'The Setback Response Protocol',
    },
    {
      type: 'p',
      text: 'The response to a confirmed setback is structured and specific. It is not a return to Phase 1. It is a focused reset using the protocol work already established.',
    },
    {
      type: 'p',
      text: 'Return to daily release work immediately. Do not wait to see if the spike resolves on its own. The release phase exercises — suboccipital release, masseter release, or both depending on profile — returned to daily frequency for one to two weeks. Full duration. Correct technique.',
    },
    {
      type: 'p',
      text: 'Increase nervous system regulation work. Breath work daily without exception during the setback period. If hypervigilance interruption or neutralisation practice has reduced during the stable maintenance period, return to consistent daily use. The autonomic amplification layer is most active during setback conditions — this is precisely when nervous system regulation work has the highest leverage.',
    },
    {
      type: 'p',
      text: 'Address the trigger directly where possible. If the trigger is ongoing — sustained work stress, continuing sleep disruption, ongoing illness — the protocol reset produces partial improvement that is limited until the trigger resolves. Managing the trigger is part of the response, not separate from it.',
    },
    {
      type: 'p',
      text: 'Do not catastrophise. The anxiety response to a setback is the primary risk factor for converting a temporary spike into a sustained regression. The framing that works: this is a temporary strain response with a known mechanism, a known response protocol, and a known resolution window. The progress tracker data from the stable period before the setback is the objective evidence that the baseline is recoverable — it has been achieved before and will be achieved again.',
    },
    {
      type: 'p',
      text: 'Use the tracker to confirm resolution. Return to pre-setback loudness scores across several consecutive days is the objective marker that the reset has worked. Do not reduce protocol frequency back to maintenance level until the tracker data confirms resolution rather than estimating recovery from how things feel on a given day.',
    },
    {
      type: 'subhead',
      text: 'If a Setback Does Not Resolve',
    },
    {
      type: 'p',
      text: 'If a full two weeks of daily protocol work and increased nervous system regulation has not produced return toward the pre-setback baseline, the setback has become something more than a temporary strain response. At that point the guidance in G.4 — professional input for a genuine plateau — is the appropriate next step. A physiotherapist assessment to identify whether a new or worsened structural factor is present, and audiological review if tinnitus character has changed, are both warranted.',
    },
    {
      type: 'p',
      text: 'This is uncommon. The majority of setbacks in members who respond promptly with the protocol above resolve within the expected window. The two week threshold is the point at which continuing to self-manage without professional input stops being the right approach.',
    },
    {
      type: 'acknowledge_prompt',
      text: 'Done',
    },
  ],
}

export default g7
