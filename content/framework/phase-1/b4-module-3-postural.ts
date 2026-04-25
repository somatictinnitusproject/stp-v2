// B.4 — Module 3: Postural & Muscular Maintaining Factors
// Source: Document 8 Part B, section B.4. All framing prose, block prose, mechanism text,
// record labels, and output table member-facing text verbatim from Doc 8.
// This module produces no score — flags only.
// Five columns written to phase1_assessment on submit (see derivePosturalSubmitPayload below):
//   post_shoulder_asymmetry, post_elevated_side, post_dominant_chewing_side,
//   post_sustained_desk_load (derived), post_asymmetric_exercise (derived).
// All block 3 inputs (Daily Posture Patterns) and block 4 ui_* inputs are UI-only — not persisted
// directly, but feed into the derived booleans above.

import type {
  B4InputType,
  B4Input,
  B4Block,
  B4OutputRow,
  B4Module3Postural,
} from './types'

// ── Content ───────────────────────────────────────────────────────────────────

export const B4_MODULE_3_POSTURAL: B4Module3Postural = {
  id: 'B4',
  sessionNumber: 4,
  sectionLabel: 'Phase 1 \u2014 Identification',
  sectionTitle: 'Module 3: Postural & Muscular Maintaining Factors',

  framing: [
    'This module works differently from the first two. You are not looking for a driver score here \u2014 posture and muscular patterns are maintaining and amplifying factors rather than independent primary drivers. What that means practically: postural dysfunction doesn\u2019t usually cause somatic tinnitus on its own, but it continuously reloads tension into whatever primary driver structures are already active. Someone doing excellent jaw release work while sitting in sustained forward head posture for eight hours a day is working against themselves \u2014 the protocol drains tension that daily posture immediately rebuilds.',
    'The output of this module is a personalised maintaining factors checklist. Each pattern you identify gets carried into your Phase 3 protocol as a specific contextual note \u2014 modifying exercise emphasis, adding side-specific instructions, and flagging the daily habits most likely to be undermining your progress.',
    'There is no score here. There is no threshold to reach. Work through each assessment honestly and record what you find.',
  ],

  blocks: [

    // ── Block 1: Shoulder Height at Rest ─────────────────────────────────────

    {
      title: '1. Shoulder Height at Rest',
      prose: [
        'Stand relaxed in front of a mirror with your arms hanging naturally at your sides. Don\u2019t consciously adjust your posture \u2014 let your body settle into its habitual resting position. Look at where each shoulder sits. Is one shoulder visibly higher than the other? A small difference of a centimetre or less is normal and not significant. A clearly visible height difference \u2014 one shoulder noticeably elevated \u2014 is a meaningful finding.',
        'You can also check from behind using a phone camera on a timer, which sometimes makes asymmetry more visible.',
      ],
      mechanism: 'Shoulder height asymmetry indicates chronic elevation of the levator scapulae and upper trapezius on the higher side. The levator scapulae runs directly from the scapula up to the upper cervical transverse processes \u2014 elevation on one side places continuous load on the upper cervical joints on that side.',
      recordLabel: 'Asymmetry present \u2014 yes / no. If yes: elevated side \u2014 left / right.',
      inputs: [
        {
          id: 'post_shoulder_asymmetry',
          label: 'Asymmetry present',
          inputKind: 'boolean',
          dbField: 'post_shoulder_asymmetry',
        },
        {
          id: 'post_elevated_side',
          label: 'Elevated side',
          inputKind: 'side_select',
          dbField: 'post_elevated_side',
        },
      ],
    },

    // ── Block 2: Dominant Chewing Side ───────────────────────────────────────

    {
      title: '2. Dominant Chewing Side',
      prose: [
        'Think honestly about which side of your mouth you tend to chew on. Most people have a habitual preference without being aware of it. Consider: which side feels more natural when you start chewing? Which side do you move food to automatically? If you\u2019ve had dental work, tooth sensitivity, or missing teeth on one side, that side may have driven a chewing preference.',
        'This doesn\u2019t require a physical test \u2014 it\u2019s a habitual pattern question. If you genuinely have no preference and alternate naturally, record that.',
      ],
      mechanism: 'Consistent unilateral chewing reinforces masseter overdevelopment on the dominant side and maintains asymmetric pterygoid loading. If your jaw module identified masseter asymmetry on the same side as your dominant chewing side, this confirms the likely mechanical cause.',
      recordLabel: 'Dominant chewing side \u2014 left / right / no clear preference.',
      inputs: [
        {
          id: 'post_dominant_chewing_side',
          label: 'Dominant chewing side',
          inputKind: 'left_right_neither',
          dbField: 'post_dominant_chewing_side',
        },
      ],
    },

    // ── Block 3: Daily Posture Patterns ──────────────────────────────────────
    // All ten inputs are UI-only (dbField: null). Block 3 data drives member
    // self-awareness during the assessment but is NOT written to phase1_assessment.
    // Doc 13 §4.3 maintaining findings reads only the five derived columns above.

    {
      title: '3. Daily Posture Patterns',
      prose: ['Work through this checklist honestly.'],
      mechanism: 'Each yes response identifies a specific daily mechanical load actively maintaining tension in the jaw or cervical structures. Addressing these habits in Phase 2 is what makes Phase 3 work durable rather than temporary.',
      recordLabel: 'All yes responses flagged individually. Each drives a specific personalised note in Phase 2 habits content and Phase 3 protocol.',
      inputs: [
        // Desk and screen use
        {
          id: 'ui_desk_screen_hours',
          label: 'Do you use a screen for more than four hours daily?',
          inputKind: 'boolean',
          dbField: null,
          subheading: 'Desk and screen use',
        },
        {
          id: 'ui_screen_below_eye',
          label: 'Is your monitor or laptop screen positioned below eye level, requiring you to look downward?',
          inputKind: 'boolean',
          dbField: null,
        },
        {
          id: 'ui_laptop_no_keyboard',
          label: 'Do you use a laptop on a desk without a separate keyboard, placing the screen low?',
          inputKind: 'boolean',
          dbField: null,
        },
        {
          id: 'ui_phone_downward',
          label: 'Do you spend significant time looking at your phone with your head angled downward?',
          inputKind: 'boolean',
          dbField: null,
        },
        // Sleep position
        {
          id: 'ui_stomach_sleep',
          label: 'Do you regularly sleep on your stomach?',
          inputKind: 'boolean',
          dbField: null,
          subheading: 'Sleep position',
          hint: 'stomach sleeping maintains sustained cervical rotation through the night',
        },
        {
          id: 'ui_side_sleep_arm',
          label: 'Do you sleep on your side with your arm under your head or pillow?',
          inputKind: 'boolean',
          dbField: null,
          hint: 'can maintain lateral cervical flexion',
        },
        // Carrying habits
        {
          id: 'ui_one_shoulder_bag',
          label: 'Do you consistently carry a bag on one shoulder rather than alternating?',
          inputKind: 'boolean',
          dbField: null,
          subheading: 'Carrying habits',
          hint: 'reinforces shoulder elevation on the carrying side',
        },
        // Jaw posture habits
        {
          id: 'ui_chin_hand_rest',
          label: 'Do you rest your chin in your hand while sitting at a desk or reading?',
          inputKind: 'boolean',
          dbField: null,
          subheading: 'Jaw posture habits',
        },
        {
          id: 'ui_jaw_tension_effort',
          label: 'Do you hold jaw tension during physical effort \u2014 gym, sport, heavy lifting?',
          inputKind: 'boolean',
          dbField: null,
        },
        // Movement breaks
        {
          id: 'ui_movement_breaks',
          label: 'Do you regularly sit for more than 90 minutes without getting up or changing position?',
          inputKind: 'boolean',
          dbField: null,
          subheading: 'Movement breaks',
        },
      ],
    },

    // ── Block 4: Occupational and Activity Load ───────────────────────────────
    // No introductory prose or mechanism box in Doc 8 B.4 for this block.
    // All three inputs are UI-only; they feed into post_sustained_desk_load and
    // post_asymmetric_exercise via derivePosturalSubmitPayload below.

    {
      title: '4. Occupational and Activity Load',
      prose: [],
      mechanism: null,
      recordLabel: 'Hours of sustained sitting, one-sided work pattern yes/no, one-sided sport yes/no.',
      inputs: [
        {
          id: 'ui_sustained_sitting',
          label: 'How many hours per day do you typically spend in sustained seated positions?',
          inputKind: 'four_band_hours',
          dbField: null,
        },
        {
          id: 'ui_one_sided_work',
          label: 'Does your work involve sustained one-sided physical patterns \u2014 driving, using one arm repeatedly, carrying loads on one side?',
          inputKind: 'yes_no_sometimes',
          dbField: null,
        },
        {
          id: 'ui_one_sided_sport',
          label: 'Do you participate in sport or exercise that predominantly loads one side \u2014 tennis, golf, racquet sports, shooting, certain gym patterns?',
          inputKind: 'boolean',
          dbField: null,
        },
      ],
    },

  ],

  // ── Maintaining Factors Output Table ─────────────────────────────────────
  // Member-facing text verbatim from Doc 8 B.4. Displayed as a personalised
  // checklist after all four blocks are complete. Only confirmed flags are shown.

  outputTable: [
    {
      flag: 'Elevated [left/right] shoulder',
      memberText: 'Your [left/right] shoulder elevation is a maintaining factor for cervical tension on that side. Your levator scapulae stretching in Phase 3 will give additional emphasis to the elevated side, and your Phase 4 postural correction work addresses this pattern specifically.',
    },
    {
      flag: 'Dominant chewing \u2014 [side]',
      memberText: 'Your dominant chewing side matches your masseter asymmetry finding / contributes to the jaw loading pattern identified in Module 1. Habit awareness around chewing side is part of your Phase 2 habits audit.',
    },
    {
      flag: 'Sustained desk load',
      memberText: 'Sustained desk posture is a significant daily load on your cervical spine. Workstation setup changes are a priority for you in Phase 4 \u2014 these changes reduce the daily mechanical input that your Phase 3 protocol is working against.',
    },
    {
      flag: 'Low screen positioning',
      memberText: 'Screen height is one of the highest-leverage single changes you can make. Looking downward for hours daily places your cervical spine under continuous flexion load. A laptop stand and separate keyboard costs under \u00a330 and is one of the most impactful things you can do before Phase 3 begins.',
    },
    {
      flag: 'Stomach sleeping',
      memberText: 'Stomach sleeping maintains sustained cervical rotation through the night \u2014 hours of abnormal mechanical input while the protocol is trying to reduce it. Sleep position change is flagged as a priority for you in Phase 2.',
    },
    {
      flag: 'Consistent bag carrying',
      memberText: 'Consistent one-shoulder carrying elevates the carrying-side shoulder and reinforces the asymmetric tension pattern. Alternating sides or switching to a backpack is flagged in your Phase 2 habits content.',
    },
    {
      flag: 'Jaw posture habits',
      memberText: 'Jaw tension habits during concentration or physical effort maintain resting masseter and pterygoid tone between your protocol sessions. Awareness and interruption of these habits is part of your Phase 2 work.',
    },
    {
      flag: 'High sustained sitting load',
      memberText: 'Your daily sitting load is high. Regular position changes \u2014 even 2 minutes of movement every 45\u201360 minutes \u2014 meaningfully reduce the cumulative cervical load your protocol is working against.',
    },
  ],

  submitLabel: 'Save and continue',
}

// ── Derived field computation ─────────────────────────────────────────────────

// Derivation rules (M9a spec / Doc 13 §4.3):
//
// post_shoulder_asymmetry   — direct boolean from uiState (input id: 'post_shoulder_asymmetry')
// post_elevated_side        — uiState.post_elevated_side; forced null when shoulder_asymmetry is
//                             false or null (cascade, same pattern as Module 2 side fields)
// post_dominant_chewing_side — uiState.post_dominant_chewing_side; stored values:
//                              'left' | 'right' | 'no_preference'
// post_sustained_desk_load  — TRUE if ui_sustained_sitting is '4\u20136 hours' OR
//                             'More than 6 hours'; FALSE for 'Less than 2' or '2\u20134 hours'.
//                             Four-band option strings (en-dash for ranges):
//                             'Less than 2' | '2\u20134 hours' | '4\u20136 hours' | 'More than 6 hours'
// post_asymmetric_exercise  — TRUE if ui_one_sided_sport === 'yes' OR ui_one_sided_work === 'yes'.
//                             Note: ui_one_sided_work 'sometimes' does NOT trigger TRUE.
//                             FALSE otherwise.

export type PosturalUiState = {
  post_shoulder_asymmetry: boolean | null
  post_elevated_side: string | null
  post_dominant_chewing_side: string | null
  ui_sustained_sitting: string | null
  ui_one_sided_work: string | null
  ui_one_sided_sport: string | null
}

export type PosturalSubmitPayload = {
  post_shoulder_asymmetry: boolean | null
  post_elevated_side: string | null
  post_dominant_chewing_side: string | null
  post_sustained_desk_load: boolean
  post_asymmetric_exercise: boolean
}

export function derivePosturalSubmitPayload(uiState: PosturalUiState): PosturalSubmitPayload {
  return {
    post_shoulder_asymmetry: uiState.post_shoulder_asymmetry,
    post_elevated_side:
      uiState.post_shoulder_asymmetry === true
        ? (uiState.post_elevated_side ?? null)
        : null,
    post_dominant_chewing_side: uiState.post_dominant_chewing_side,
    post_sustained_desk_load:
      uiState.ui_sustained_sitting === '4\u20136 hours' ||
      uiState.ui_sustained_sitting === 'More than 6 hours',
    post_asymmetric_exercise:
      uiState.ui_one_sided_sport === 'yes' ||
      uiState.ui_one_sided_work === 'yes',
  }
}
