// /content/framework/phase-4/f10-sleep-protocol.ts
// F.10 — Sleep Protocol
// Verbatim member-facing copy from Document 8 Part F, section F.10.
// Daily focus: "Sleep is where the nervous system either recovers
// or falls further behind"
//
// Three profile modifiers (all single-flag positive):
//   - Sleep Disruption Confirmed (ns_sleep_disruption=true)
//   - Morning Jaw Soreness Confirmed (tmj_morning_soreness=true)
//     Note: Doc 8 line 552 specifies jaw_morning_soreness — live
//     schema column is tmj_morning_soreness. Verified during M14b.
//   - Hypervigilance Confirmed (ns_hypervigilance=true)
//
// Practical section — acknowledgeLabel = 'Done'.

import type { ReadingSection } from './types'

const f10: ReadingSection = {
  kind: 'reading',
  id: 'F10_sleep_protocol',
  section: 'F.10',
  title: 'Sleep Protocol',
  estimatedMinutes: 6,
  acknowledgeLabel: 'Done',
  content: [
    {
      type: 'subhead',
      text: 'Sleep',
    },
    {
      type: 'p',
      text: 'Sleep is where the nervous system either consolidates the day’s gains or falls further behind. Poor sleep elevates baseline sympathetic tone, increases tinnitus loudness, reduces tolerance for the sound, and compromises the tissue recovery that protocol work depends on. The relationship runs in both directions: tinnitus disrupts sleep, and disrupted sleep worsens tinnitus. For members caught in that cycle, addressing sleep directly is not optional.',
    },
    {
      type: 'p',
      text: 'Phase 2 covered the mechanical foundations: sleep position, pillow height, pre-sleep jaw relaxation. This section covers what Phase 2 deliberately deferred: why tinnitus behaves as it does at night, and the specific psychological and attentional patterns that make sleep the hardest part of the day for many members.',
    },
    {
      type: 'subhead',
      text: 'Why Tinnitus Seems Loudest at Night',
    },
    {
      type: 'p',
      text: 'Tinnitus does not actually increase in volume at night. The physical signal (the DCN output driving the perception) is not louder at bedtime than during the day. What changes is the signal-to-noise ratio of the auditory environment and the attentional state of the nervous system.',
    },
    {
      type: 'p',
      text: 'During the day, competing sounds, cognitive demands, and social engagement occupy the auditory processing bandwidth that tinnitus would otherwise dominate. At night, external sounds reduce, cognitive demands disappear, and the nervous system, particularly one primed by hypervigilance, has nothing else to attend to. The tinnitus fills the available attentional space entirely. It has not got louder. It has got relatively louder in a quieter environment, and it has the nervous system’s full attention.',
    },
    {
      type: 'p',
      text: 'Understanding this clearly changes the experience. The tinnitus that feels unbearable at night is not a worsening of the condition. It is an attentional and environmental phenomenon: the same signal perceived differently under different conditions. This framing does not make it less uncomfortable. It does make it less alarming, which directly reduces the anxiety response that makes it worse.',
    },
    {
      type: 'subhead',
      text: 'The Hypervigilance Peak at Sleep Onset',
    },
    {
      type: 'p',
      text: 'For members with confirmed hypervigilance, the transition to sleep is the point where the monitoring loop runs at its most intense. The conditions that suppress it during the day (engagement, distraction, competing demands) are all absent. The nervous system, left without external input, defaults to its highest-priority monitoring task.',
    },
    {
      type: 'p',
      text: 'The response to this is not to fight it. Attempting to suppress the monitoring loop at sleep onset through effort or willpower is counterproductive; effort itself increases arousal and delays sleep further. The approach that works is reducing the perceived threat of the monitoring loop rather than trying to stop it.',
    },
    {
      type: 'p',
      text: 'Two things reduce the threat. First, understanding the mechanism: a nervous system monitoring tinnitus at night is doing exactly what it has been trained to do. It is not evidence that something is wrong. It is a habit pattern that changes slowly through the neutralisation and hypervigilance interruption work, not through force of will at bedtime. Second, having a specific response ready: a cognitive engagement technique from F.7, applied at the moment the monitoring loop is noticed, rather than waiting for it to escalate.',
    },
    {
      type: 'subhead',
      text: 'Pre-Sleep Routine',
    },
    {
      type: 'p',
      text: 'A consistent pre-sleep routine reduces the transition cost to sleep by signalling to the nervous system that the threat-monitoring mode is no longer required. The specific content matters less than the consistency; the routine works through conditioning rather than through any single element being uniquely effective.',
    },
    {
      type: 'p',
      text: 'A practical pre-sleep sequence: the breath work protocol from F.6 performed for five to ten minutes in bed, followed by the cognitive engagement technique from F.7 applied if the monitoring loop arises, with masking sound available at sleep onset if needed. Each element has a specific function: breath work reduces arousal, cognitive engagement redirects attention, masking reduces acute salience during the most vulnerable transition window.',
    },
    {
      type: 'subhead',
      text: 'Masking at Sleep Onset',
    },
    {
      type: 'p',
      text: 'As covered in F.9, masking at sleep onset is a legitimate strategic use. A few specific points for sleep use. Use a sound that is genuinely neutral: nature sounds or pink noise rather than music, which engages rather than simply occupies auditory processing. Set it to switch off after thirty to sixty minutes rather than running all night; the goal is covering the acute sleep onset window, not eliminating all quiet exposure during sleep. Keep the volume low enough that it partially masks rather than fully covers the tinnitus; full masking at high volume prevents any habituation; partial masking at low volume reduces salience while allowing some continued exposure.',
    },
    {
      type: 'subhead',
      text: 'If Tinnitus Wakes You During the Night',
    },
    {
      type: 'p',
      text: 'Waking during the night with tinnitus prominent is a specific and common problem. The response pattern in the first few minutes after waking significantly affects how long it takes to return to sleep.',
    },
    {
      type: 'p',
      text: 'The least effective response is lying awake evaluating the loudness; this immediately activates the monitoring loop in the worst possible conditions for interrupting it. The most effective response is immediate application of the cognitive engagement technique from F.7, without first checking loudness or duration. Do not assess. Redirect immediately.',
    },
    {
      type: 'p',
      text: 'If return to sleep is not achieved within twenty minutes, getting up briefly and doing something calm in low light, then returning to bed, produces better outcomes than continued lying awake. Sustained wakefulness in bed with tinnitus prominent strengthens the association between the bed environment and tinnitus distress, which compounds the sleep problem over time.',
    },
  ],
  profileModifiers: [
    {
      triggerFlag: 'ns_sleep_disruption',
      triggerValue: true,
      title: 'Sleep Disruption Confirmed',
      content: [
        {
          type: 'p',
          text: 'Your Phase 1 assessment identified significant sleep disruption as a confirmed pattern. For your profile, the sleep protocol content above warrants treating as a priority rather than supplementary reading. The pre-sleep routine, the masking guidance, and the response protocol for night waking are all specifically relevant to your pattern. Apply them consistently rather than selectively.',
        },
      ],
    },
    {
      triggerFlag: 'tmj_morning_soreness',
      triggerValue: true,
      title: 'Morning Jaw Soreness Confirmed',
      content: [
        {
          type: 'p',
          text: 'Your Phase 1 assessment identified morning jaw soreness, a sign of nocturnal clenching or bruxism. The pre-sleep jaw relaxation routine from Phase 2 is particularly important for your pattern. Performing the teeth-apart tongue-on-palate resting position check immediately before sleep, and again if you wake during the night, reduces the overnight jaw loading that contributes to morning soreness and elevated tinnitus on waking.',
        },
      ],
    },
    {
      triggerFlag: 'ns_hypervigilance',
      triggerValue: true,
      title: 'Hypervigilance Confirmed',
      content: [
        {
          type: 'p',
          text: 'Your Phase 1 assessment identified an active hypervigilance pattern. The sleep onset transition is where hypervigilance typically peaks; the conditions that suppress the monitoring loop during the day are entirely absent at night. The cognitive engagement technique from F.7 applied immediately at the moment the monitoring loop is noticed at sleep onset, not after it has been running for several minutes, is the most effective single intervention available for your pattern at this specific point in the day.',
        },
      ],
    },
  ],
}

export default f10
