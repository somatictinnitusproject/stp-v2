// /content/framework/phase-5/g2-full-resolution.ts
// G.2 — Full Resolution
// Verbatim member-facing copy from Document 8 Part G, section G.2.
// Daily focus: "The signal has reduced — now the task is keeping it that way"
//
// No acknowledgeRequires, no noAcknowledge, no profileModifiers.
// Standard acknowledge button (label defaults to "Acknowledge").

import type { Phase5ReadingSection } from './types'

const g2: Phase5ReadingSection = {
  kind: 'reading',
  id: 'G2_phase5_full_resolution',
  section: 'G.2',
  title: 'Full Resolution',
  estimatedMinutes: 5,
  content: [
    {
      type: 'p',
      text: 'If tinnitus has become inaudible or nearly so in most daily conditions — if awareness of it is now rare, and when it does arise it no longer captures attention or triggers anxiety — you have achieved what the framework sets out to produce. That is worth acknowledging clearly before moving on to maintenance.',
    },
    {
      type: 'p',
      text: 'What has happened mechanistically is genuine. DCN hypersensitivity has reduced to the point where the auditory system is no longer interpreting the residual somatosensory input as sound at a level that reaches conscious awareness under normal conditions. The physical driver has not necessarily disappeared entirely — the jaw or cervical structures may still have some residual involvement — but the signal they are producing is no longer sufficient to drive the DCN above the threshold of perception in everyday life. This is a real biological change, not a shift in coping strategy.',
    },
    {
      type: 'subhead',
      text: 'What to Expect Going Forward',
    },
    {
      type: 'p',
      text: 'Full resolution does not mean tinnitus will never be noticed again. Under specific conditions — high stress, illness, significant sleep disruption, or a period of physical strain — the system may briefly produce awareness of the sound again. This is normal, expected, and not evidence that progress has reversed.',
    },
    {
      type: 'p',
      text: 'The DCN, once sensitised, retains some residual susceptibility to re-sensitisation under load. A brief period of tinnitus awareness during a high-stress week or during illness is the system temporarily exceeding its threshold under unusual conditions — not a return to the original state. Members who understand this in advance handle these moments without alarm. Members who do not understand it can interpret a brief stress-related recurrence as a catastrophic reversal — which triggers exactly the anxiety response that amplifies it further.',
    },
    {
      type: 'p',
      text: 'The appropriate response to a brief recurrence is the same as the response to any setback — covered in full in G.7. The short version: it is temporary, it has a cause, and it resolves with a brief targeted response rather than a return to the full starting protocol.',
    },
    {
      type: 'subhead',
      text: 'The Maintenance Requirement',
    },
    {
      type: 'p',
      text: 'Resolution does not mean the maintenance protocol can be abandoned entirely. The tension patterns that produced the original dysfunction were years in the making — they have a natural tendency to rebuild slowly if the structures and habits that produced them are left unaddressed. The maintenance protocol in G.5 is the minimum effective dose that keeps the system stable without requiring ongoing active treatment. It is light, it is specific, and it is worth treating as a permanent background habit rather than optional now that things have improved.',
    },
    {
      type: 'p',
      text: 'Think of it the way a recovered athlete thinks of mobility work — not because there is currently a problem, but because the alternative is a slow regression that eventually produces one.',
    },
    {
      type: 'acknowledge_prompt',
      text: 'I’ve read the full resolution framing and I’m ready to continue to the maintenance protocol',
    },
  ],
}

export default g2
