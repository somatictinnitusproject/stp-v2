// /content/framework/phase-4/f11-professional-support.ts
// F.11 — Professional Support Signposting
// Verbatim member-facing copy from Document 8 Part F, section F.11.
// Daily focus: "Knowing when to seek more is part of the protocol,
// not a failure of it"
//
// One profile modifier using triggerAnyTrue (multi-flag OR):
//   - Anxiety-Tinnitus Loop, Hypervigilance, or High Stress
//     Correlation Confirmed
//     (ns_anxiety_loop OR ns_hypervigilance OR
//     ns_stress_tinnitus_correlation = true)
//
// Pre-launch §1.12 (bimodal stimulation acknowledgment) is a
// Phase 5 (G.x) content addition only — does NOT affect F.11.
//
// Practical section — acknowledgeLabel = 'Done'.

import type { ReadingSection } from './types'

const f11: ReadingSection = {
  kind: 'reading',
  id: 'F11_professional_support',
  section: 'F.11',
  title: 'Professional Support Signposting',
  estimatedMinutes: 4,
  acknowledgeLabel: 'Done',
  content: [
    {
      type: 'subhead',
      text: 'Professional Support',
    },
    {
      type: 'p',
      text: 'The framework addresses somatic tinnitus through a self-directed protocol that works for the majority of members with genuine somatic components. It does not work for everyone, and it does not cover every dimension of the tinnitus experience. Knowing where its limits are — and what lies beyond them — is part of using it well.',
    },
    {
      type: 'p',
      text: 'This section is not a disclaimer. It is honest guidance about specific situations where professional input adds something the framework cannot, and what that input looks like in practice.',
    },
    {
      type: 'subhead',
      text: 'When Tinnitus-Related Distress Warrants Professional Support',
    },
    {
      type: 'p',
      text: 'Tinnitus affects quality of life, relationships, daily function, and mental health — this is true across the full range of presentations and is not unique to severe cases. The question is not whether tinnitus is causing distress but whether the psychological dimension of that distress has a depth or persistence that self-directed tools cannot adequately address. Significant anxiety that persists despite consistent nervous system regulation work, low mood that is not lifting as the physical protocol progresses, or genuine functional impairment in quiet environments despite sustained engagement — these are the signals that professional psychological input is warranted alongside the framework.',
    },
    {
      type: 'subhead',
      text: 'What Professional Support Looks Like',
    },
    {
      type: 'p',
      text: 'Cognitive behavioural therapy delivered by a therapist with specific tinnitus experience is the evidence-based option for tinnitus-related psychological distress. General CBT delivered by a therapist without tinnitus experience is less effective — the specific cognitive patterns associated with tinnitus hypervigilance and the anxiety-tinnitus loop require a therapist who understands the mechanism and has worked with it clinically.',
    },
    {
      type: 'p',
      text: 'When seeking a referral, asking specifically for a therapist with tinnitus or chronic condition experience produces better outcomes than a general CBT referral. In the UK, the British Tinnitus Association maintains a directory of tinnitus-experienced professionals and is the most reliable starting point.',
    },
    {
      type: 'p',
      text: 'Audiological review is worth considering for members who have not had a recent audiology assessment, or whose tinnitus has changed significantly in character, laterality, or loudness during the framework period. The framework addresses somatic tinnitus specifically — a change in tinnitus character during the protocol period warrants professional assessment to confirm the working diagnosis remains accurate.',
    },
    {
      type: 'subhead',
      text: 'What This Is Not Suggesting',
    },
    {
      type: 'p',
      text: 'Seeking professional support is not an indication that the framework has failed or that the somatic component is absent. The physical driver work and the psychological support work are not competing — they address different layers of the same problem and work better together than either does alone. Members who engage with professional psychological support alongside the framework typically progress faster in both dimensions, not slower.',
    },
  ],
  profileModifiers: [
    {
      triggerAnyTrue: [
        'ns_anxiety_loop',
        'ns_hypervigilance',
        'ns_stress_tinnitus_correlation',
      ],
      title: 'Anxiety-Tinnitus Loop, Hypervigilance, or High Stress Correlation Confirmed',
      content: [
        {
          type: 'p',
          text: 'Your Phase 1 assessment identified anxiety-tinnitus loop, hypervigilance, or high stress-tinnitus correlation as active patterns. If the nervous system content in Phase 4 has not produced meaningful reduction in tinnitus-related distress after consistent engagement, professional psychological support is worth pursuing actively rather than treating as a last resort. The patterns your assessment identified respond well to professionally guided CBT — the self-directed tools in Phase 4 are the appropriate starting point, but they have a ceiling that specialist support does not.',
        },
      ],
    },
  ],
}

export default f11
