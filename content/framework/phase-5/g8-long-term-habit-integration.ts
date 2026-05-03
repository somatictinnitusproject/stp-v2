// /content/framework/phase-5/g8-long-term-habit-integration.ts
// G.8 — Long-Term Habit Integration
// Verbatim member-facing copy from Document 8 Part G, section G.8.
// Daily focus: "The protocol becomes invisible when it becomes habit"
//
// 14 content blocks. No profileModifiers, no acknowledgeRequires,
// no noAcknowledge.
// acknowledgeLabel: 'Complete'.
// marksPhaseCompleteFlag: 'phase5_completed_at' — acknowledging G.8
// fires markPhase5Complete in addition to the standard exercises_viewed
// write. G.8 is the last section before the intentionally un-ackable G.9.

import type { Phase5ReadingSection } from './types'

const g8: Phase5ReadingSection = {
  kind: 'reading',
  id: 'G8_phase5_long_term_habit_integration',
  section: 'G.8',
  title: 'Long-Term Habit Integration',
  estimatedMinutes: 7,
  acknowledgeLabel: 'Complete',
  marksPhaseCompleteFlag: 'phase5_completed_at',
  content: [
    {
      type: 'p',
      text: 'The active protocol phase required conscious daily effort — specific exercises at specific durations, deliberate attention to resting position, scheduled breath work, intentional movement pattern correction. That level of conscious engagement was necessary to produce change. It is not the level required to maintain it.',
    },
    {
      type: 'p',
      text: 'By Phase 5, the most impactful protocol elements should be transitioning from conscious daily tasks to automatic background habits. The transition is gradual and different for every member — some elements become automatic quickly, others require longer conscious reinforcement before they embed. The goal of this section is to help identify where you are in that transition and how to complete it for the elements still requiring conscious effort.',
    },
    {
      type: 'subhead',
      text: 'What Automatic Actually Means',
    },
    {
      type: 'p',
      text: 'An automatic habit is not one that never requires attention. It is one that runs correctly by default — where the conscious correction is the exception rather than the rule, and where deviation from the habit produces a noticeable sense that something is off rather than passing unnoticed.',
    },
    {
      type: 'p',
      text: 'Resting jaw position is automatic when you notice teeth contact at rest and release without deliberate effort — the correction happens before conscious attention is directed at it. Workstation posture is integrated when sitting incorrectly at a desk feels wrong rather than normal. Breath work is habitual when skipping it feels like skipping something important rather than an easily overlooked optional task.',
    },
    {
      type: 'p',
      text: 'The test for any element is simple: does deviation from it produce a noticeable signal, or does it pass unnoticed? If it passes unnoticed, the habit is not yet fully integrated and still requires the conscious trigger-based correction approach from Phase 4.',
    },
    {
      type: 'subhead',
      text: 'The Elements That Should Be Automatic by Phase 5',
    },
    {
      type: 'p',
      text: 'These are the protocol elements with the highest daily impact and the most direct relevance to long-term stability. Each one is worth assessing honestly against the automatic habit test above.',
    },
    {
      type: 'list',
      items: [
        'Resting jaw position — teeth apart, tongue on palate, lips together. The single highest-frequency jaw habit in the protocol. Every waking hour spent in correct resting position is an hour of reduced masseter and pterygoid activation. By Phase 5 this should require no deliberate effort in most conditions — deviation should feel noticeable.',
        'Sleep position — side or back sleeping with appropriate cervical support. Stomach sleeping should be absent or rare. The position you wake in most mornings is the position your body has defaulted to — it is a reliable indicator of whether this habit is genuinely embedded.',
        'Workstation posture — screen height, chair position, keyboard distance. These are fixed environmental conditions rather than movement habits — once correctly configured they require no ongoing effort. The habit component is noticing and correcting when configuration drifts, and applying the screen height principle to new environments — hotel rooms, shared desks, new equipment.',
        'Phone and screen position — raising the device to eye level rather than dropping the head to it. This is one of the slower habits to embed because the habitual pattern is deeply ingrained and the correction feels unnatural for longer than most. If it still requires deliberate conscious effort at Phase 5, continue the trigger-based approach — applying the correction at the start of every phone use rather than attempting continuous monitoring.',
        'Periodic suboccipital and masseter self-check — not a daily protocol exercise at maintenance level but a periodic palpation check that has become reflexive. Members who have fully integrated this element find themselves briefly checking suboccipital tenderness after a stressful week or a run of poor sleep without it feeling like a protocol task — it has become a natural self-monitoring response.',
        'Breath work — the parasympathetic activation practice from F.6. The integration marker here is not automaticity in the same sense as postural habits — it is consistent daily practice that feels like a genuine priority rather than an obligation. Members who have fully integrated breath work protect the ten minutes the way they protect other non-negotiable daily practices. Members who have not yet integrated it find it the first thing dropped when the day gets busy.',
      ],
    },
    {
      type: 'subhead',
      text: 'Working Through What Remains',
    },
    {
      type: 'p',
      text: 'For each element above that has not yet become automatic, the approach is the same as Phase 4: trigger-based conscious correction applied consistently at specific anchor points until the habit embeds. The trigger points that work best are the ones already identified as reliable in Phase 4 — the start of desk sessions, leaving rooms, picking up a phone. Continuing to apply them consistently is what closes the remaining gap between deliberate correction and automatic habit.',
    },
    {
      type: 'p',
      text: 'The realistic timeline for full habit integration varies considerably between members and between elements. Resting jaw position and workstation setup tend to embed within weeks of consistent application. Sleep position and phone use can take months. Breath work as a genuine daily priority is a long-term practice for most members — one that deepens rather than becomes invisible.',
    },
    {
      type: 'p',
      text: 'There is no completion point for habit integration in the way there is for the active protocol phases. It is an ongoing process of consolidation that continues well beyond Phase 5 — the framework’s role here is to identify the elements worth consolidating and give members the tools to do it. The rest is time and consistency.',
    },
    {
      type: 'acknowledge_prompt',
      text: 'Done',
    },
  ],
}

export default g8
