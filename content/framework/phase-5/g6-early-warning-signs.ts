// /content/framework/phase-5/g6-early-warning-signs.ts
// G.6 — Early Warning Signs
// Verbatim member-facing copy from Document 8 Part G, section G.6.
// Daily focus: "Catching the rebuild early means a week of targeted
// work, not a return to the start"
//
// Two profileModifiers using triggerValuesIn for profile_type family
// membership. Jaw modifier: TMJ family + mixed CERV-primary + DUAL_DRIVER.
// Cervical modifier: CERV family + mixed TMJ-primary + DUAL_DRIVER.
// Pure single-driver members see only their family's block.
// Mixed-driver and DUAL_DRIVER members see both blocks.
//
// acknowledgeLabel: 'Complete'. No acknowledgeRequires, no noAcknowledge.

import type { Phase5ReadingSection } from './types'

const g6: Phase5ReadingSection = {
  kind: 'reading',
  id: 'G6_phase5_early_warning_signs',
  section: 'G.6',
  title: 'Early Warning Signs',
  estimatedMinutes: 6,
  acknowledgeLabel: 'Complete',
  content: [
    {
      type: 'p',
      text: 'The members who handle tinnitus regression best are the ones who recognise the early signals that tension patterns are rebuilding before tinnitus has increased significantly. Early detection converts what would otherwise be a full setback requiring weeks of intensive protocol work into a one to two week targeted response — the same elements, at higher frequency, until the early signs resolve.',
    },
    {
      type: 'p',
      text: 'The warning signs below are the reliable early indicators that the system is moving in the wrong direction. None of them is an emergency. Each of them is a prompt to act now rather than later.',
    },
    {
      type: 'subhead',
      text: 'Universal Warning Signs',
    },
    {
      type: 'p',
      text: 'These apply regardless of driver profile.',
    },
    {
      type: 'list',
      items: [
        'Morning tinnitus loudness trending upward across several consecutive days — a single loud morning is noise. Three or more consecutive mornings with loudness noticeably higher than the recent baseline is a pattern worth responding to. The distinction between a bad day and a trend is what the progress tracker makes visible — daily logging is what allows this signal to be read accurately rather than estimated from memory.',
        'Stress load increasing without corresponding nervous system regulation practice — high stress periods are predictable amplifiers of tinnitus. The warning sign is not stress itself but the combination of elevated stress and reduced breath work or regulation practice. The two together reliably precede loudness increases for members with any nervous system involvement.',
        'Sleep quality deteriorating across more than a few days — sustained poor sleep elevates sympathetic tone, reduces tissue recovery, and reliably precedes tinnitus loudness increases. A run of poor sleep is a prompt to increase nervous system regulation work and review sleep protocol adherence before loudness follows.',
      ],
    },
    {
      type: 'subhead',
      text: 'Responding to Early Warning Signs',
    },
    {
      type: 'p',
      text: 'The response to any combination of the above is the same regardless of which signs are present: increase protocol frequency to daily for one to two weeks, focusing on the elements most directly related to the warning signs identified. This is not starting from scratch. It is a focused reset using the same protocol work that produced the original improvement — applied at higher frequency for a short targeted period until the warning signs resolve and the baseline restores.',
    },
    {
      type: 'p',
      text: 'Use the progress tracker to confirm resolution — return to pre-warning-sign loudness scores across several consecutive days is the objective marker that the reset has worked and maintenance frequency can reduce again.',
    },
    {
      type: 'acknowledge_prompt',
      text: 'Done',
    },
  ],
  profileModifiers: [
    {
      triggerFlag: 'profile_type',
      triggerValuesIn: [
        'TMJ_DOMINANT',
        'TMJ_PRIMARY_STRONG_SECONDARY',
        'TMJ_PRIMARY_WITH_SECONDARY',
        'CERV_PRIMARY_STRONG_SECONDARY',
        'CERV_PRIMARY_WITH_SECONDARY',
        'DUAL_DRIVER',
      ],
      title: 'Jaw-Specific Warning Signs',
      content: [
        {
          type: 'list',
          items: [
            'Jaw soreness returning on waking — the clearest early sign of increased nocturnal clenching or bruxism. Morning jaw soreness that was absent during the stable maintenance period and has returned indicates overnight jaw loading is increasing. Respond with increased masseter release frequency before loudness follows.',
            'Masseter tenderness returning on palpation — press firmly into the masseter belly as in the Phase 1 assessment. Tenderness that has returned or increased since the last check indicates resting muscle tone is rebuilding. A reliable early physical indicator that precedes tinnitus change.',
            'Jaw drift becoming more pronounced on periodic mirror check — increasing drift or returning asymmetry on the monthly jaw symmetry check indicates the muscular imbalance pattern is reasserting. A prompt to return to more frequent release work and resting position reinforcement.',
            'Teeth-together resting position habit drifting back — noticed during the regular trigger-point checks. The habit is the most persistent and the most impactful daily jaw maintaining factor — its return is worth treating as a priority signal.',
          ],
        },
      ],
    },
    {
      triggerFlag: 'profile_type',
      triggerValuesIn: [
        'CERV_DOMINANT',
        'CERV_PRIMARY_STRONG_SECONDARY',
        'CERV_PRIMARY_WITH_SECONDARY',
        'TMJ_PRIMARY_STRONG_SECONDARY',
        'TMJ_PRIMARY_WITH_SECONDARY',
        'DUAL_DRIVER',
      ],
      title: 'Cervical-Specific Warning Signs',
      content: [
        {
          type: 'list',
          items: [
            'Neck stiffness increasing — particularly morning stiffness that was absent or minimal during the stable maintenance period and has returned. Increasing morning cervical stiffness indicates overnight tension rebuild is accelerating — an early cervical pathway signal that reliably precedes tinnitus change.',
            'Suboccipital tenderness returning on palpation — the same base-of-skull palpation check from Phase 1 and Phase 3. Returning tenderness, particularly asymmetric tenderness on the previously dominant side, is one of the clearest early signs that upper cervical tension is rebuilding. A direct prompt to return to more frequent suboccipital release.',
            'Rotation range reducing or asymmetry returning — the informal rotation check from Phase 3 timeline expectations, performed periodically. Reducing range or increasing asymmetry between sides indicates upper cervical joint mechanics are deteriorating — a structural early warning sign that precedes tinnitus change.',
            'Postural drift confirmed on monthly check — forward head posture increasing, shoulder asymmetry returning, or workstation setup that has drifted from correct configuration. Postural drift is slow and cumulative — the monthly check catches it at a stage where correction is straightforward rather than after it has become an active maintaining factor again.',
          ],
        },
      ],
    },
  ],
}

export default g6
