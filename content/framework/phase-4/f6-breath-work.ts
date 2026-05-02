// /content/framework/phase-4/f6-breath-work.ts
// F.6 — Breath Work Protocol
// Verbatim member-facing copy from Document 8 Part F, section F.6.
// Daily focus: "The exhale is the intervention"
//
// No profile modifiers per Doc 8 system note — breath work
// protocol is universal regardless of driver profile or confirmed
// flags.
//
// Practical section — acknowledgeLabel = 'Done'.

import type { ReadingSection } from './types'

const f6: ReadingSection = {
  kind: 'reading',
  id: 'F6_breath_work',
  section: 'F.6',
  title: 'Breath Work Protocol',
  estimatedMinutes: 4,
  acknowledgeLabel: 'Done',
  content: [
    {
      type: 'subhead',
      text: 'Breath Work',
    },
    {
      type: 'p',
      text: 'Diaphragmatic breathing with an extended exhale is the most direct and immediately available parasympathetic activation tool in this protocol. It requires no equipment, no preparation, and produces a measurable physiological effect within minutes of practice. It is included here not as generic relaxation advice but as a mechanistically specific intervention targeting the autonomic amplification layer described in F.5.',
    },
    {
      type: 'subhead',
      text: 'The Mechanism',
    },
    {
      type: 'p',
      text: 'Breathing rate and pattern have a direct bidirectional relationship with autonomic nervous system state. Rapid, shallow breathing — the default pattern under stress — drives sympathetic activation. Slow, diaphragmatic breathing with an extended exhale drives the opposite: parasympathetic activation via the vagus nerve.',
    },
    {
      type: 'p',
      text: 'The extended exhale is the specific therapeutic element. Exhalation activates the vagal brake — a rapid parasympathetic response that reduces heart rate and lowers sympathetic tone within seconds of the exhale beginning. The longer the exhale relative to the inhale, the stronger this effect. This is why the protocol specifies an exhale of six to eight counts against an inhale of four — the ratio is not arbitrary, it is what produces the strongest vagal activation for most people.',
    },
    {
      type: 'p',
      text: 'Practised daily, this produces cumulative changes in resting autonomic tone — a gradual shift in the baseline sympathetic-parasympathetic balance that reduces the amplification the nervous system applies to the tinnitus signal throughout the day, not just during the practice session itself.',
    },
    {
      type: 'subhead',
      text: 'The Protocol',
    },
    {
      type: 'p',
      text: 'Inhale slowly through the nose for a count of four. Exhale slowly through the mouth for a count of six to eight. The exhale should feel controlled and complete — not forced or strained, but unhurried. Allow the breath to empty fully before the next inhale begins.',
    },
    {
      type: 'p',
      text: 'Ten minutes daily. The ten minutes is important — shorter sessions produce an acute relaxation response but not the cumulative autonomic recalibration that consistent daily practice develops over weeks. Ten minutes is also the threshold at which most people find the practice genuinely settling rather than effortful.',
    },
    {
      type: 'subhead',
      text: 'When to Practise',
    },
    {
      type: 'p',
      text: 'A consistent daily anchor time produces more reliable habit formation than practising reactively when stress is high. The most effective approach is to attach the practice to an existing daily anchor — immediately after waking, before bed, or at a consistent point in the working day. Reactive use during high-stress moments is also valuable but does not substitute for the daily practice session.',
    },
    {
      type: 'p',
      text: 'Lying down or seated with the spine supported are both suitable positions. Eyes closed. Hands resting on the abdomen if helpful — the rise and fall of the abdomen on each breath confirms diaphragmatic engagement rather than chest breathing.',
    },
    {
      type: 'subhead',
      text: 'What to Expect',
    },
    {
      type: 'p',
      text: 'In the first week, ten minutes will feel longer than expected and the mind will wander frequently. This is normal and not a sign the practice is not working. The physiological effect occurs regardless of whether the mind is quiet — the vagal activation is produced by the breathing pattern itself, not by achieving a meditative state. Returning attention to the breath count each time it wanders is the practice, not a failure of it.',
    },
    {
      type: 'p',
      text: 'After two to three weeks of consistent daily practice most members notice a measurable reduction in baseline stress and anxiety levels and a corresponding reduction in tinnitus variability on high-stress days. The autonomic recalibration takes time to accumulate — this is a weeks-level intervention, not a single-session fix.',
    },
  ],
}

export default f6
