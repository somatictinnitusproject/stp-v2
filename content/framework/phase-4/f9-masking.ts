// /content/framework/phase-4/f9-masking.ts
// F.9 — Masking: Strategic Use
// Verbatim member-facing copy from Document 8 Part F, section F.9.
// Daily focus: "A tool used well — not a solution used constantly"
//
// One profile modifier using triggerAnyTrue (multi-flag OR):
//   - Sleep Disruption or Hypervigilance Confirmed
//     (ns_sleep_disruption=true OR ns_hypervigilance=true)
//
// Pre-launch §3.4 hyperacusis modifier intentionally deferred —
// hyperacusis_confirmed column does not yet exist on
// phase1_assessment. M14g will add the §3.4 hyperacusis modifier
// here once §3.3 hyperacusis screening + column have shipped.
//
// Practical section — acknowledgeLabel = 'Done'.

import type { ReadingSection } from './types'

const f9: ReadingSection = {
  kind: 'reading',
  id: 'F9_masking',
  section: 'F.9',
  title: 'Masking: Strategic Use',
  estimatedMinutes: 5,
  acknowledgeLabel: 'Done',
  content: [
    {
      type: 'subhead',
      text: 'Masking',
    },
    {
      type: 'p',
      text: 'Masking — using external sound to partially or fully cover the tinnitus — is the most commonly reached-for tinnitus coping strategy. It works in the short term. It also has a specific failure mode that is worth understanding clearly before deciding how to use it.',
    },
    {
      type: 'p',
      text: 'Used correctly, masking is a legitimate and useful tool. Used as a default response to any tinnitus awareness, it becomes a dependency that actively delays the nervous system adaptation the framework is trying to produce.',
    },
    {
      type: 'subhead',
      text: 'How Masking Works',
    },
    {
      type: 'p',
      text: 'External sound — white noise, pink noise, nature sounds, music, background speech — occupies the auditory processing bandwidth that tinnitus would otherwise dominate. When the masking sound is present, the tinnitus signal competes for attention rather than having it entirely. For many people this reduces perceived loudness significantly and provides genuine relief from acute distress.',
    },
    {
      type: 'p',
      text: 'The relief is real. The limitation is that it is entirely contingent on the masking sound being present. Switch it off and the tinnitus returns to full perceived loudness — sometimes with a brief rebound effect as the auditory system readjusts. Masking produces no change in the underlying signal and no change in the nervous system’s response to it. It is symptom management in the most literal sense.',
    },
    {
      type: 'subhead',
      text: 'The Dependency Risk',
    },
    {
      type: 'p',
      text: 'The specific risk with habitual masking is that it prevents the nervous system adaptation that produces genuine long-term improvement. Habituation — the process by which the nervous system learns to classify the tinnitus sound as non-threatening and reduces its automatic response to it — requires repeated exposure to the sound in a context of calm. Masking eliminates that exposure. A nervous system that never has to process the tinnitus sound in quiet cannot habituate to it.',
    },
    {
      type: 'p',
      text: 'This is not a reason to never use masking. It is a reason to use it deliberately rather than reflexively — as a specific tool for specific situations rather than a constant background condition.',
    },
    {
      type: 'subhead',
      text: 'Strategic Use',
    },
    {
      type: 'p',
      text: 'The situations where masking earns its place are specific and limited.',
    },
    {
      type: 'p',
      text: 'Sleep onset is the clearest legitimate use. The combination of quiet, reduced distraction, and horizontal position reliably produces peak tinnitus salience for many members. Using a masking sound at sleep onset — set to switch off after thirty to sixty minutes rather than running all night — reduces the acute distress of that transition without preventing daytime habituation work. This is covered in more depth in the sleep protocol section.',
    },
    {
      type: 'p',
      text: 'High acute distress — periods where tinnitus loudness has spiked significantly due to stress, illness, or poor sleep and is producing genuine functional impairment — is a reasonable time to use masking temporarily. A tool that reduces acute distress during a setback period is being used well. The same tool used to avoid ever sitting with the sound in normal conditions is not.',
    },
    {
      type: 'p',
      text: 'High-demand work sessions where tinnitus is actively interfering with concentration represent a practical case for temporary masking. The distinction from dependency is intent and duration — a specific session, for a specific purpose, not a permanent background condition during all desk work.',
    },
    {
      type: 'subhead',
      text: 'What to Avoid',
    },
    {
      type: 'p',
      text: 'Masking all quiet time. Reaching for masking the moment tinnitus is noticed. Using masking to avoid ever being alone with the sound. These patterns prevent habituation and maintain the nervous system in a state where quiet itself becomes threatening — which produces a significant secondary problem on top of the original one.',
    },
    {
      type: 'p',
      text: 'The test for whether masking use has become counterproductive is simple: does the absence of the masking sound produce anxiety? If yes, the masking has become a safety behaviour rather than a tool — and safety behaviours maintain the anxiety they appear to relieve.',
    },
    {
      type: 'acknowledge_prompt',
      text: 'Done',
    },
  ],
  profileModifiers: [
    {
      triggerAnyTrue: ['ns_sleep_disruption', 'ns_hypervigilance'],
      title: 'Sleep Disruption or Hypervigilance Confirmed',
      content: [
        {
          type: 'p',
          text: 'Your Phase 1 assessment identified sleep disruption, hypervigilance, or both as confirmed patterns. Masking at sleep onset is a legitimate and recommended tool for your profile — the sleep protocol section covers this specifically. Outside of sleep onset, apply the strategic use framing above carefully. For your pattern in particular, the risk of masking becoming a default avoidance behaviour rather than a targeted tool is worth monitoring.',
        },
      ],
    },
  ],
}

export default f9
