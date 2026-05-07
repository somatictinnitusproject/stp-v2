// /content/framework/phase-4/f5-ns-framing.ts
// F.5 — Nervous System Framing and the Anxiety-Tinnitus Loop
// Verbatim member-facing copy from Document 8 Part F, section F.5.
// Daily focus: "Reducing the signal and reducing the response to
// it are both necessary"
//
// Three profile modifiers:
//   - High Stress-Tinnitus Correlation (ns_stress_tinnitus_correlation=true)
//   - Anxiety-Tinnitus Loop (ns_anxiety_loop=true)
//   - No Nervous System Flags Confirmed — uses new triggerAllFalse
//     variant (M14d) requiring all four NS flags strictly === false.
//     null does not qualify; column must be explicitly recorded false.
//
// Framing section — uses default 'Acknowledge' button label
// (acknowledgeLabel field omitted).

import type { ReadingSection } from './types'

const f5: ReadingSection = {
  kind: 'reading',
  id: 'F5_ns_framing',
  section: 'F.5',
  title: 'Nervous System Framing and the Anxiety-Tinnitus Loop',
  estimatedMinutes: 5,
  content: [
    {
      type: 'subhead',
      text: 'The Nervous System Layer',
    },
    {
      type: 'p',
      text: 'Phase 3 works on the physical signal — reducing the abnormal input from the jaw and cervical structures feeding into your DCN. The nervous system content in Phase 4 works on a different layer: the autonomic amplification that sits on top of that signal and determines how loudly and intrusively it is perceived.',
    },
    {
      type: 'p',
      text: 'Sympathetic nervous system activation acts as a volume dial. The same level of physical driver input produces a louder, more intrusive tinnitus experience under high sympathetic tone than under low. Stress, anxiety, poor sleep, and hypervigilance all elevate sympathetic tone — and all of them are consistently reported by members as conditions that make tinnitus noticeably worse. This is not coincidence or imagination. It is the autonomic nervous system amplifying a real physical signal in real time.',
    },
    {
      type: 'p',
      text: 'This means that Phase 3 work alone — however well executed — is operating against an amplification system that can partially offset its gains on difficult days. Nervous system regulation work reduces that amplification directly, making the gains from Phase 3 more stable and more consistently felt across varying daily conditions.',
    },
    {
      type: 'subhead',
      text: 'The Anxiety-Tinnitus Loop',
    },
    {
      type: 'p',
      text: 'There is a specific feedback mechanism worth understanding clearly because it affects a significant proportion of members and because understanding it is itself partially therapeutic.',
    },
    {
      type: 'p',
      text: 'Tinnitus triggers anxiety. Anxiety increases hypervigilance — the nervous system allocating threat-level attentional resources to monitoring the tinnitus sound. Hypervigilance amplifies perceived loudness, not because the physical signal has increased, but because the auditory cortex is being directed to attend to it with heightened sensitivity. Increased perceived loudness triggers more anxiety. The loop runs continuously and self-reinforces with each cycle.',
    },
    {
      type: 'p',
      text: 'The loop has two entry points for intervention. Phase 3 reduces the physical signal at the source — a genuine reduction in DCN input means less to trigger the anxiety response in the first place. The nervous system content in Phase 4 works the other end — reducing the anxiety response and hypervigilance that are amplifying whatever signal remains. Both interventions working simultaneously is more effective than either alone.',
    },
    {
      type: 'subhead',
      text: 'What This Is Not',
    },
    {
      type: 'p',
      text: 'The nervous system content that follows is not a suggestion that tinnitus is psychological in origin or that anxiety is its cause. The physical driver is real. The DCN mechanism is real. The protocol addressing it is addressing a genuine physical process.',
    },
    {
      type: 'p',
      text: 'What is also real is that the autonomic nervous system amplifies the perception of that physical signal — and that reducing that amplification is a legitimate and mechanistically specific therapeutic target. These are not competing explanations. They are two layers of the same problem, both of which warrant direct attention.',
    },
    {
      type: 'subhead',
      text: 'What Follows',
    },
    {
      type: 'p',
      text: 'The nervous system block covers five areas: breath work, hypervigilance interruption, tinnitus neutralisation, masking used strategically, and sleep. Each is a specific intervention with a clear mechanism — not generic wellness content but targeted tools for the specific amplification patterns most common in somatic tinnitus.',
    },
    {
      type: 'acknowledge_prompt',
      text: 'I understand the nervous system layer and how it relates to my Phase 3 work',
    },
  ],
  profileModifiers: [
    {
      triggerFlag: 'ns_stress_tinnitus_correlation',
      triggerValue: true,
      title: 'High Stress-Tinnitus Correlation Confirmed',
      content: [
        {
          type: 'p',
          text: 'Your Phase 1 assessment identified a strong stress-tinnitus correlation in your specific case: your tinnitus clearly tracks your stress and anxiety levels. For your pattern, the autonomic amplification layer is particularly active. The nervous system content that follows is not supplementary for your profile; it is addressing one of the primary reasons your tinnitus fluctuates as significantly as it does.',
        },
      ],
    },
    {
      triggerFlag: 'ns_anxiety_loop',
      triggerValue: true,
      title: 'Anxiety-Tinnitus Loop Confirmed',
      content: [
        {
          type: 'p',
          text: 'Your Phase 1 assessment identified an active anxiety-tinnitus loop — you recognised the pattern of tinnitus triggering anxiety which seems to amplify it further. Understanding the mechanism of this loop clearly is the first step in breaking it. The hypervigilance interruption and tinnitus neutralisation sections that follow are the most directly relevant content for your pattern.',
        },
      ],
    },
    {
      triggerAllFalse: [
        'ns_stress_tinnitus_correlation',
        'ns_hypervigilance',
        'ns_anxiety_loop',
        'ns_sleep_disruption',
      ],
      title: 'No Nervous System Flags Confirmed',
      content: [
        {
          type: 'p',
          text: 'Your Phase 1 assessment did not identify significant nervous system involvement in your pattern. The nervous system content that follows is available and worth reading for general understanding — the breath work protocol in F.6 covers the core nervous system support your profile warrants. The remaining nervous system sections are lower priority for your specific pattern.',
        },
      ],
    },
  ],
}

export default f5
