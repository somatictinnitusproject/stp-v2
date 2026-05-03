// /content/framework/phase-5/g1-opening.ts
// G.1 — Phase 5 Opening: What Resolution Actually Looks Like
// Verbatim member-facing copy from Document 8 Part G, section G.1.
// Daily focus: "The goal is not that tinnitus never occurs — it is
// that it stops being a significant part of daily life"
//
// acknowledgeRequires: 'phase5_outcome_type' — the acknowledge button
// is suppressed until the member selects one of the three outcome
// options via the single_select ContentBlock (block 11).
// setPhase5OutcomeType server action writes the selection to
// framework_progress.phase5_outcome_type.
//
// No profile modifiers — G.1 is universal across all member profiles
// per Doc 8 G.1 system notes.

import type { Phase5ReadingSection } from './types'

const g1: Phase5ReadingSection = {
  kind: 'reading',
  id: 'G1_phase5_opening',
  section: 'G.1',
  title: 'What Resolution Actually Looks Like',
  estimatedMinutes: 6,
  acknowledgeRequires: 'phase5_outcome_type',
  content: [
    {
      type: 'p',
      text: 'You have reached Phase 5 by completing the active protocol work. What follows is not more treatment — it is the transition from active intervention to stable, maintained improvement.',
    },
    {
      type: 'p',
      text: 'Before that transition begins, it is worth being precise about what resolution actually looks like. Managing expectations carefully here is one of the most important things the framework does — not to temper enthusiasm, but because members who have an accurate picture of what success looks like are better equipped to recognise it when it arrives and to sustain it once it does.',
    },
    {
      type: 'subhead',
      text: 'Three Honest Outcomes',
    },
    {
      type: 'p',
      text: 'Members who complete the framework with consistent engagement tend to fall into one of three outcome categories. All three are valid. All three represent meaningful progress. None of them is a failure.',
    },
    {
      type: 'p',
      text: 'Full resolution — tinnitus has become inaudible or nearly so in most daily conditions. Awareness of it is rare and no longer attention-capturing. This outcome is real and has been achieved. It is not guaranteed for everyone and presenting it as the only success would be dishonest.',
    },
    {
      type: 'p',
      text: 'Significant improvement with residual — tinnitus is present but is no longer intrusive, no longer attention-capturing in normal daily conditions, and no longer a significant organising factor in daily life. Loudness has reduced meaningfully from baseline. Stress-related flare-ups occur but resolve quickly and are recognised as temporary. This is the most common good outcome and it is a genuinely life-changing one.',
    },
    {
      type: 'p',
      text: 'Plateau requiring professional input — consistent protocol engagement has not produced meaningful improvement, or progress has stalled before reaching a satisfactory level. This outcome indicates that additional factors are present beyond what the self-directed framework can address — not that the somatic component is absent, but that professional assessment is needed to identify what is limiting progress.',
    },
    {
      type: 'subhead',
      text: 'Where You Are Now',
    },
    {
      type: 'p',
      text: 'The sections that follow address each outcome type directly and then cover the maintenance protocol, early warning signs, setback management, and long-term habit integration that apply regardless of which outcome category you are in.',
    },
    {
      type: 'p',
      text: 'Read G.2, G.3, and G.4 and navigate to the one that most accurately reflects your current experience. If you are genuinely between categories — significant improvement but uncertain whether you have reached your ceiling — G.3 is the right starting point.',
    },
    {
      type: 'single_select',
      source: 'phase5_outcome_type',
      prompt: 'Which outcome best describes where you are right now?',
      options: [
        {
          value: 'full_resolution',
          label: 'Full resolution',
          description: 'Tinnitus is no longer present or no longer noticeable in daily life',
        },
        {
          value: 'significant_improvement',
          label: 'Significant improvement with residual',
          description: 'Meaningful reduction, tinnitus present but no longer intrusive',
        },
        {
          value: 'plateau',
          label: 'Plateau',
          description: 'Consistent engagement has not produced the improvement I was hoping for',
        },
      ],
    },
    {
      type: 'acknowledge_prompt',
      text: 'I understand the three outcome types and I’m ready to navigate to the one that reflects my experience',
    },
  ],
}

export default g1
