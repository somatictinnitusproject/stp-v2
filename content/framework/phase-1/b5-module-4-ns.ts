// B.5 — Module 4: Nervous System & Stress
// Source: Document 8 Part B, section B.5. All framing prose, question prose, mechanism text,
// record labels, sub-question labels, and output table text verbatim from Doc 8.
// This module produces no score — flags only.
// Four columns written to phase1_assessment on submit (see route-side collapse rules below):
//   ns_stress_tinnitus_correlation, ns_hypervigilance, ns_sleep_disruption, ns_anxiety_loop
// Q5 (tension_triple) and Q6 (yes_sometimes_no) are UI-only — not persisted.
// Doc 13 §4.4 step 5 reads only the four primary NS columns for the high-NS modifier.

import type {
  B5InputKind,
  B5Input,
  B5SubQuestion,
  B5Block,
  B5OutputRow,
  B5Module4Ns,
} from './types'

// ── Content ───────────────────────────────────────────────────────────────────

export const B5_MODULE_4_NS: B5Module4Ns = {
  id: 'B5',
  sessionNumber: 5,
  sectionLabel: 'Phase 1 \u2014 Identification',
  sectionTitle: 'Module 4: Nervous System & Stress',

  framing: [
    'This module sits last among the four driver modules for a reason. By now you have a picture of your physical drivers \u2014 jaw, cervical, and postural patterns. This module addresses the layer that sits on top of all of them.',
    'The nervous system doesn\u2019t cause somatic tinnitus independently. What it does is act as a volume dial on whatever physical signal is already present. Two people with identical jaw driver profiles can have very different tinnitus experiences depending on their nervous system state \u2014 one manages it relatively comfortably, the other finds it intrusive and distressing. The difference is almost entirely in how the nervous system is processing and amplifying the signal.',
    'There are two mechanisms worth understanding before the assessment.',
    'Sympathetic activation and muscle tension. When the nervous system is in a sustained state of activation \u2014 chronic stress, anxiety, high-demand periods \u2014 it increases resting muscle tension throughout the body. Including in the jaw and neck. This means chronic stress doesn\u2019t just make tinnitus feel worse psychologically \u2014 it physically increases the mechanical input into the auditory pathway by keeping jaw and cervical muscles at elevated resting tone.',
    'The hypervigilance loop. Tinnitus triggers a threat response \u2014 the brain flags it as something requiring attention. That attention itself amplifies the perceived loudness because the auditory cortex allocates more processing resources to the sound. More loudness triggers more anxiety, more anxiety triggers more hypervigilance, more hypervigilance amplifies the signal further. This loop can maintain significant perceived loudness even when the underlying physical driver has substantially reduced.',
    'This module identifies which of these patterns are active for you and to what degree.',
    'Answer based on your honest experience over the past three months. Don\u2019t answer based on how you think you should feel \u2014 answer based on how things actually are.',
  ],

  blocks: [

    // ── Q1: Stress-Tinnitus Correlation ──────────────────────────────────────

    {
      title: '1. Stress-Tinnitus Correlation',
      prose: [
        'Think about periods of high stress, anxiety, or pressure over the past three months. Did your tinnitus reliably increase during these periods? Not whether stress is unpleasant \u2014 everyone finds that \u2014 but whether there is a clear, noticeable pattern where higher stress days consistently produce louder or more intrusive tinnitus.',
      ],
      mechanism: 'A clear stress-tinnitus correlation indicates active nervous system amplification of the physical driver signal. It doesn\u2019t mean the physical drivers aren\u2019t real \u2014 it means the nervous system is adding a significant layer on top. Both need addressing simultaneously for the most effective progress.',
      recordLabel: 'Stress-tinnitus correlation \u2014 yes / sometimes / no.',
      inputKind: 'yes_sometimes_no',
      dbField: 'ns_stress_tinnitus_correlation',
    },

    // ── Q2: Hypervigilance Pattern ────────────────────────────────────────────

    {
      title: '2. Hypervigilance Pattern',
      prose: [
        'Hypervigilance around tinnitus is a specific attentional pattern \u2014 the habitual, almost automatic checking of tinnitus loudness throughout the day. Consider honestly:',
        'Do you frequently find yourself noticing and mentally measuring your tinnitus loudness?',
        'Do you find it difficult not to attend to it even when engaged in other activities?',
        'Does awareness of the tinnitus often arrive unbidden \u2014 not because it got louder, but because you checked?',
        'Do you find yourself listening for it in quiet environments before it has even registered on its own?',
        'This is not a character flaw \u2014 it\u2019s an understandable response to a persistent intrusive sound. But it significantly amplifies perceived loudness independently of any physical change.',
      ],
      mechanism: 'Confirmed hypervigilance means a proportion of perceived loudness is attentional rather than purely physical. Addressing this through Phase 4 hypervigilance interruption techniques can produce noticeable improvement in perceived loudness even before the physical driver work has fully taken effect.',
      recordLabel: 'Hypervigilance pattern \u2014 yes / sometimes / no.',
      inputKind: 'yes_sometimes_no',
      dbField: 'ns_hypervigilance',
    },

    // ── Q3: Sleep Disruption ──────────────────────────────────────────────────
    // No intro prose — Doc 8 presents three sub-questions directly.

    {
      title: '3. Sleep Disruption',
      prose: [],
      mechanism: 'Sleep disruption driven by tinnitus indicates hypervigilance peaking in quiet environments. It also creates a feedback loop: poor sleep elevates sympathetic tone, elevated sympathetic tone increases muscle tension, increased muscle tension amplifies the physical driver. Sleep quality is the single strongest confounding variable in tinnitus progress.',
      recordLabel: 'Sleep disruption \u2014 yes to one or more / sometimes / no.',
      inputKind: 'sleep_triple',
      subQuestions: [
        {
          id: 'sleep_falling_asleep',
          label: 'Does tinnitus make it difficult to fall asleep \u2014 either because it feels louder in the quiet of bedtime or because it keeps your attention?',
          answerType: 'yes_sometimes_no',
        },
        {
          id: 'sleep_night_waking',
          label: 'Do you wake during the night and find tinnitus is the first thing you notice?',
          answerType: 'yes_sometimes_no',
        },
        {
          id: 'sleep_morning_louder',
          label: 'Is your tinnitus noticeably louder or more intrusive on waking, before settling as the day starts?',
          answerType: 'yes_sometimes_no',
        },
      ],
      dbField: 'ns_sleep_disruption',
    },

    // ── Q4: Anxiety-Tinnitus Loop ─────────────────────────────────────────────

    {
      title: '4. Anxiety-Tinnitus Loop',
      prose: [
        'This is distinct from general stress. Consider whether you recognise this specific pattern: tinnitus is noticed \u2192 it triggers anxiety or distress \u2192 the anxiety makes the tinnitus feel louder or more threatening \u2192 which triggers more anxiety \u2192 which amplifies it further. The defining feature is that the loop is self-sustaining.',
      ],
      mechanism: 'A confirmed anxiety-tinnitus loop means the nervous system has established an automatic threat-response to the tinnitus sound itself. Breaking it requires working both ends: reducing the physical signal through Phase 3, and reducing the threat response through Phase 4 regulation and neutralisation work.',
      recordLabel: 'Anxiety-tinnitus loop \u2014 yes / sometimes / no.',
      inputKind: 'yes_sometimes_no',
      dbField: 'ns_anxiety_loop',
    },

    // ── Q5: Unconscious Tension Patterns ─────────────────────────────────────
    // UI-only — not persisted. dbField: null.
    // Doc 13 §4.4 step 5 reads only ns_stress_tinnitus_correlation, ns_hypervigilance,
    // ns_sleep_disruption, ns_anxiety_loop for the high-NS modifier. Q5 has no consumer
    // in the codebase.
    // No intro prose — Doc 8 presents three sub-questions directly.

    {
      title: '5. Unconscious Tension Patterns',
      prose: [],
      mechanism: 'Unconscious tension during concentration or effort directly feeds the physical driver pathways. The nervous system is maintaining elevated jaw and cervical muscle tone below conscious awareness \u2014 the resting jaw position retraining in Phase 3 and the adapted PMR in Phase 4 both specifically target this pattern.',
      recordLabel: 'Unconscious tension patterns \u2014 yes / sometimes / no.',
      inputKind: 'tension_triple',
      subQuestions: [
        {
          id: 'tension_concentration',
          label: 'Do you notice yourself holding tension in your jaw, face, or neck during periods of concentration \u2014 desk work, reading, studying, screens?',
          answerType: 'yes_sometimes_no',
        },
        {
          id: 'tension_effort',
          label: 'Do you hold tension in these areas during physical effort \u2014 gym, sport, lifting?',
          answerType: 'yes_sometimes_no',
        },
        {
          id: 'tension_visible',
          label: 'Have you ever been pointed out as someone who looks tense or stressed even when you don\u2019t feel particularly stressed?',
          answerType: 'yes_no',
        },
      ],
      dbField: null,
    },

    // ── Q6: Tinnitus Variability with Relaxation ──────────────────────────────
    // UI-only — not persisted. dbField: null.
    // No Doc 7 column exists for Q6 and no Doc 13 logic reads it. The output table row
    // is preserved verbatim for member reference.

    {
      title: '6. Tinnitus Variability with Relaxation',
      prose: [
        'Think about your most relaxed states \u2014 deeply absorbed in something enjoyable, on holiday, during or after exercise you genuinely enjoy, in a genuinely restful period. Does your tinnitus noticeably reduce or become less intrusive during these states compared to your normal baseline?',
      ],
      mechanism: 'Clear reduction during genuine relaxation confirms that nervous system state is modulating tinnitus loudness in real time. This is a positive finding \u2014 it means nervous system regulation work in Phase 4 has a direct route to producing perceivable change.',
      recordLabel: 'Tinnitus variability with relaxation \u2014 yes / sometimes / no.',
      inputKind: 'yes_sometimes_no',
      dbField: null,
    },

  ],

  // ── Nervous System Flags Output Table ─────────────────────────────────────
  // Member-facing text verbatim from Doc 8 B.5. Displayed as a personalised
  // flags summary after all six blocks are complete. Only confirmed flags shown.

  outputTable: [
    {
      flag: 'High stress-tinnitus correlation',
      trigger: 'Yes or sometimes to Q1',
      phase4Implication: 'Phase 4 breath work and stress pattern identification through tracker data prioritised.',
    },
    {
      flag: 'Hypervigilance pattern identified',
      trigger: 'Yes or sometimes to Q2',
      phase4Implication: 'Phase 4 hypervigilance interruption techniques specifically flagged.',
    },
    {
      flag: 'Significant sleep disruption',
      trigger: 'Yes to one or more components of Q3',
      phase4Implication: 'Phase 4 sleep protocol prioritised. Phase 2 sleep foundations given additional emphasis.',
    },
    {
      flag: 'Anxiety-tinnitus loop present',
      trigger: 'Yes or sometimes to Q4',
      phase4Implication: 'Phase 4 loop-breaking content and tinnitus neutralisation work specifically flagged.',
    },
    {
      flag: 'Unconscious tension patterns',
      trigger: 'Yes or sometimes to Q5',
      phase4Implication: 'Resting jaw position retraining in Phase 3 and adapted PMR in Phase 4 flagged as particularly relevant.',
    },
    {
      flag: 'Relaxation-correlated variability (positive prognostic)',
      trigger: 'Yes to Q6',
      phase4Implication: 'Positive finding \u2014 noted in profile as confirming nervous system responsiveness. Motivating framing in profile paragraph.',
    },
  ],

  submitLabel: 'Save and continue',
}

// ── Route-side collapse logic (documented here — no executable derive function needed) ──
//
// M9b produces no derived booleans from non-boolean inputs (unlike M9a post_sustained_desk_load
// / post_asymmetric_exercise). All four persisted columns collapse directly in the route:
//
//   ns_stress_tinnitus_correlation = (q1 === 'yes' || q1 === 'sometimes')
//   ns_hypervigilance              = (q2 === 'yes' || q2 === 'sometimes')
//   ns_sleep_disruption            = (q3_falling_asleep === 'yes' || q3_night_waking === 'yes' || q3_morning_louder === 'yes')
//   ns_anxiety_loop                = (q4 === 'yes' || q4 === 'sometimes')
//
// Q3 sleep disruption: flag fires on strict 'yes' to any sub-question only.
// 'sometimes' sub-answers do NOT fire the flag per Doc 8: "Yes to one or more components of Q3".
// Q5 (tension_triple) and Q6 (yes_sometimes_no) are UI-only — never reach the DB.
