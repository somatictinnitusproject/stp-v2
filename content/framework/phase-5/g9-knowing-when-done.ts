// /content/framework/phase-5/g9-knowing-when-done.ts
// G.9 — Knowing When You Are Done
// Verbatim member-facing copy from Document 8 Part G, section G.9.
// Daily focus: "Done is not a moment — it is a state you will
// recognise when you are in it"
//
// The closing section of the framework. Unique properties:
//   - noAcknowledge: true — no Complete/Acknowledge button.
//   - No acknowledge_prompt block in content array.
//   - Never shows ✓ Read badge in the reading list (intentional
//     — the section content actively says "no button to press"
//     and the absent badge reinforces that framing).
//
// No profileModifiers, no acknowledgeRequires.

import type { Phase5ReadingSection } from './types'

const g9: Phase5ReadingSection = {
  kind: 'reading',
  id: 'G9_phase5_knowing_when_done',
  section: 'G.9',
  title: 'Knowing When You Are Done',
  estimatedMinutes: 5,
  noAcknowledge: true,
  content: [
    {
      type: 'p',
      text: 'Phase 5 unlocks when you manually mark Phase 3 as complete — when you have worked through the active protocol to the point where you are ready to transition from intensive daily work to maintenance and stabilisation. That is the platform’s marker for entering this phase. It is not the same as being done with the framework entirely, and it is worth being clear about the difference.',
    },
    {
      type: 'p',
      text: 'Marking Phase 3 complete means the active release and retraining work has run its course for now — the tissues have responded, the pattern has changed, and continuing at full protocol intensity is no longer the right approach. It does not mean the work is finished. Phase 5 is where the work consolidates into something permanent rather than something that requires ongoing active effort to maintain.',
    },
    {
      type: 'p',
      text: 'Being genuinely done — in the fuller sense — is a different threshold. There is no single moment where it arrives. There is no button to press and no certificate to receive. What happens instead is a gradual shift in which the framework recedes from the foreground of daily life and the habits it has built become the background.',
    },
    {
      type: 'subhead',
      text: 'What Done Feels Like',
    },
    {
      type: 'p',
      text: 'Tinnitus is present or it is not — but either way it is no longer a significant organising factor in daily experience. It does not shape decisions. It does not structure the day around managing it. It does not capture attention automatically when it arises. The maintenance protocol takes fifteen minutes a few times a week and feels like a background practice rather than an active treatment.',
    },
    {
      type: 'p',
      text: 'The progress tracker, if still used, shows loudness scores that are consistently low and no longer correlate meaningfully with daily stress or tension fluctuations. This is the most objective available marker — when the loudness-stress correlation that was present at the start of the framework has genuinely flattened, DCN hypersensitivity has reduced rather than being managed by compensatory strategies. The signal has changed, not just the response to it.',
    },
    {
      type: 'p',
      text: 'The early warning signs from G.6 are familiar enough that they are caught and responded to automatically — not because tinnitus is still a preoccupation but because the self-monitoring habit has become reflexive and low-effort. A brief period of increased morning stiffness or returning masseter tenderness produces a week of increased release work without alarm, the way a tight hamstring produces a few days of additional stretching without it becoming a significant concern.',
    },
    {
      type: 'subhead',
      text: 'The Platform’s Role at This Point',
    },
    {
      type: 'p',
      text: 'When you reach this state — whenever it arrives, however long it takes — the platform’s role is to acknowledge it clearly and step back. The framework has done what it set out to do. The community remains available. The exercise library remains accessible. The progress tracker continues to work if you want the long-term data. None of it requires active engagement unless something changes and you need it again.',
    },
    {
      type: 'p',
      text: 'The founding principle of this platform is that the goal is members who no longer need it — not members who remain dependent on it. A member who closes the framework and gets on with their life is the best possible outcome. That is what done looks like.',
    },
  ],
}

export default g9
