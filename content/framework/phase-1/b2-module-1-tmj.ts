// B.2 — Module 1: Jaw Driver
// Source: Document 8 Part B, section B.2. All mechanism prose and question text verbatim from Doc 8.
// "Imported Intake Test Results" block omitted per Amendment 1 / D1.
// Joint Sounds (Q6) included per Amendment 2 — writes to tmj_joint_sounds BOOLEAN.
// D1: Q1 (M1 Jaw Opening) and Q2 (M2 Jaw Protrusion) are live Phase 1 tests (not intake imports).
// ERRATA E10: mechanism paragraph 5 moved to position 3. Text verbatim. Order only.

import type { AssessmentQuestion, HistoryQuestion, ContextQuestion } from './types'
export type { AssessmentInputKind, AssessmentQuestion, HistoryQuestion, ContextQuestion } from './types'

export type B2Module1Tmj = {
  sectionLabel: string
  sectionTitle: string
  mechanismHeading: string
  mechanismParagraphs: string[]
  assessmentIntro: string
  questions: AssessmentQuestion[]
  historyHeading: string
  historyIntro: string
  historyQuestions: HistoryQuestion[]
  contextHeading: string
  contextIntro: string
  contextQuestions: ContextQuestion[]
  submitLabel: string
}

export const B2_MODULE_1_TMJ: B2Module1Tmj = {
  sectionLabel: 'Phase 1 \u2014 Identification',
  sectionTitle: 'Module 1: Jaw Driver',
  mechanismHeading: 'Your Jaw and Your Tinnitus',
  // ERRATA E10: paragraph order — original P5 moved to P3 for improved normalisation flow.
  mechanismParagraphs: [
    // P1 — anatomy
    'The temporomandibular joint \u2014 the TMJ \u2014 sits directly in front of each ear. Press your fingertips lightly just in front of the small flap of cartilage at your ear opening and open your mouth slowly. That movement you can feel is the TMJ.',
    // P2 — trigeminal / DCN pathway
    'Its proximity to the ear is not coincidental. The joint, the disc inside it, and the muscles that control jaw movement are all served by branches of the trigeminal nerve \u2014 the largest sensory nerve in the head. One branch in particular, the auriculotemporal nerve, runs from the TMJ directly into the brainstem\u2019s auditory processing system. When the jaw is functioning normally, the signals travelling along this nerve are unremarkable. When the joint is compressed, displaced, or when the muscles controlling it are chronically overactive, the signals become abnormal \u2014 and the dorsal cochlear nucleus responds to that abnormality with elevated activity.',
    // P3 — normalisation (moved from P5): most people don\u2019t experience significant jaw pain
    'Most people with jaw driver involvement don\u2019t experience significant jaw pain. The tension is there \u2014 often significant \u2014 but it has been present long enough to become background noise. The absence of obvious jaw symptoms does not rule out this pathway. The self-assessment that follows tests function directly rather than relying on symptom report alone.',
    // P4 — real-time tinnitus change (was P3)
    'This is why jaw movement can directly change tinnitus in real time. Opening your mouth, protruding your jaw, or clenching all load the TMJ and the surrounding musculature. If your tinnitus changed during any of these movements in the intake test, you have direct functional evidence of trigeminal pathway involvement.',
    // P5 — muscles (was P4)
    'The muscles matter as much as the joint. The masseter \u2014 the thick muscle along your jaw that you can feel bulging when you clench \u2014 is one of the most powerful muscles in the body relative to its size. Chronic tension in the masseter compresses the TMJ and maintains a constant elevated signal along the auriculotemporal nerve. The pterygoid muscles, which sit deeper and control the fine movements of jaw opening and lateral deviation, are frequently the primary source of dysfunction when jaw drift is present \u2014 they pull the jaw off its midline track when one side is dominant or overactive.',
  ],
  assessmentIntro: 'Work through each assessment carefully. There are no right or wrong findings \u2014 accurate findings are what matter.',
  questions: [
    // ── Movement Tests ──────────────────────────────────────────────────────────
    {
      heading: '1. Jaw Opening \u2014 Movement Test',
      instructions: [
        'Open your mouth as wide as you comfortably can. Hold for 5 seconds. Pay close attention to whether your tinnitus changes during or immediately after the movement \u2014 even subtly.',
        'Loading the TMJ in this way directly tests the auriculotemporal nerve pathway into the dorsal cochlear nucleus. Any change in your tinnitus \u2014 louder, quieter, different character \u2014 is direct functional evidence of trigeminal pathway involvement.',
      ],
      mechanism: 'Maximum jaw opening maximally loads the TMJ disc and capsule. If this movement changes your tinnitus, it confirms a direct mechanical link between jaw position and dorsal cochlear nucleus activity. This is one of the two highest-weighted indicators in the jaw module.',
      recordLabel: 'Did your tinnitus change? \u2014 yes / no.',
      inputKind: 'yes-no',
      dbField: 'tmj_m1_jaw_opening',
      videoId: null,
    },
    {
      heading: '2. Jaw Protrusion \u2014 Movement Test',
      instructions: [
        'Push your lower jaw forward as far as you can \u2014 your bottom teeth should end up in front of your top teeth. Hold for 5 seconds. Pay close attention to whether your tinnitus changes during or after the movement.',
        'This movement tests a different vector from opening \u2014 the posterior TMJ capsule and retrodiscal tissue. A positive response here catches members whose jaw driver involvement is retrodiscal rather than opening-related.',
      ],
      mechanism: 'Protrusion loads the posterior TMJ capsule and retrodiscal tissue. A positive change here identifies a subgroup whose trigeminal input is driven by posterior joint mechanics rather than full-range compression.',
      recordLabel: 'Did your tinnitus change? \u2014 yes / no.',
      inputKind: 'yes-no',
      dbField: 'tmj_m2_jaw_protrusion',
      videoId: null,
    },
    // ── Physical Assessment ─────────────────────────────────────────────────────
    {
      heading: '3. Jaw Drift on Opening',
      instructions: [
        'Stand in front of a mirror. Relax your jaw completely \u2014 let it hang open slightly. Now open your mouth slowly and in a controlled way, watching the midline of your lower teeth relative to your upper teeth. Repeat this five or six times at a natural pace without trying to open straight.',
        'You are looking for whether your jaw consistently deviates to one side as it opens, particularly in the middle third of the range of motion. A slight waver that self-corrects is normal. A consistent drift in one direction \u2014 where the lower teeth track noticeably left or right \u2014 is a significant finding.',
      ],
      mechanism: 'Consistent jaw drift indicates asymmetric pterygoid muscle activity. The jaw drifts toward the side of the overactive lateral pterygoid. This is one of the highest-weighted indicators in the jaw module because it is an objective functional test \u2014 you are either seeing the drift or you are not.',
      recordLabel: 'Drift present \u2014 yes / no / unsure. If yes: direction \u2014 left / right.',
      inputKind: 'yes-no-unsure-direction',
      dbField: 'tmj_jaw_drift',
      dbFieldSecondary: 'tmj_jaw_drift_direction',
      videoId: null,
    },
    {
      heading: '4. Masseter Asymmetry',
      instructions: [
        'Place both hands on your jaw simultaneously \u2014 fingertips resting on the thick muscle just below and in front of each ear, roughly over your back teeth. Gently clench your teeth together and hold for three seconds. Feel for the muscle bulging under your fingertips on both sides simultaneously.',
        'Compare the two sides. You are assessing both size \u2014 does one side feel more developed or bulkier than the other \u2014 and hardness \u2014 does one side feel denser or tighter under the same pressure. Asymmetry in either size or resting tone is significant. Overdevelopment on one side suggests that side is working harder \u2014 through dominant chewing, chronic unilateral clenching, or both. This side will be given asymmetric emphasis in your Phase 3 protocol.',
      ],
      mechanism: 'Masseter asymmetry reflects uneven loading of the jaw over time. The overdeveloped side is compressing the ipsilateral TMJ more consistently and generating more afferent signalling along that side\u2019s auriculotemporal nerve.',
      recordLabel: 'Asymmetry present \u2014 yes / no. If yes: dominant side \u2014 left / right.',
      inputKind: 'yes-no-direction',
      dbField: 'tmj_masseter_asymmetry',
      dbFieldSecondary: 'tmj_masseter_dominant_side',
      videoId: null,
    },
    {
      heading: '5. Lateral Pterygoid Palpation',
      instructions: [
        'This one requires care and accurate landmark location. Watch the demonstration video before attempting it.',
        'The external landmark for the lateral pterygoid insertion area sits just below the zygomatic arch \u2014 the bony ridge running from your cheekbone toward your ear. Place your index finger below this arch, approximately halfway between your ear and the outer corner of your eye. Press firmly inward and slightly upward. You are looking for tenderness, a dull aching sensation, or reproduction of any jaw discomfort.',
        'Compare both sides using the same pressure. Asymmetric tenderness \u2014 significantly more on one side than the other \u2014 is more diagnostically significant than bilateral tenderness. This palpation will be tender in many people with jaw driver involvement. Marked tenderness, particularly where the pressure reproduces a familiar sensation, is a high-specificity finding.',
      ],
      mechanism: 'The lateral pterygoid is the primary muscle responsible for jaw deviation and forward translation of the condyle. Tenderness at this landmark indicates active overuse or hypertonicity in the muscle most directly implicated in asymmetric jaw mechanics.',
      recordLabel: 'Tenderness present \u2014 yes / no. If yes: side \u2014 left / right / both, with one side notably worse.',
      inputKind: 'yes-no-side',
      dbField: 'tmj_pterygoid_tenderness',
      dbFieldSecondary: 'tmj_pterygoid_tender_side',
      videoId: null,
    },
    {
      heading: '6. Joint Sounds Assessment',
      instructions: [
        'Open and close your mouth slowly through your full comfortable range of motion several times, paying close attention to any sounds or sensations from the joint area in front of your ears. You can place your fingertips lightly over the joint to feel as well as hear.',
        'Note any clicking, popping, grating, or whooshing. The specific sound type matters less than the presence of any joint noise \u2014 all of them indicate some degree of mechanical irregularity within the joint. Clicking on opening, closing, or both is the most common finding. Grating suggests more advanced joint changes. Absence of sound does not rule out jaw driver involvement \u2014 many people with significant dysfunction have silent joints.',
      ],
      mechanism: 'Joint sounds are direct evidence of altered TMJ disc mechanics. A displaced or deformed disc changes the mechanical environment of the joint and alters the pattern of sensory input along the auriculotemporal nerve.',
      recordLabel: 'Joint sounds present \u2014 yes / no.',
      inputKind: 'yes-no',
      dbField: 'tmj_joint_sounds',
      videoId: null,
    },
    {
      heading: '7. Maximum Opening Range',
      instructions: [
        'Open your mouth as wide as you comfortably can. Stack your index, middle, and ring fingers vertically and attempt to insert them between your upper and lower front teeth at maximum opening.',
        'Three fingers fitting comfortably is normal range. Two fingers with obvious restriction, or significant asymmetric resistance through range \u2014 where the jaw feels like it is being pulled or blocked in one direction \u2014 is a notable finding.',
      ],
      mechanism: 'Restricted opening indicates either capsular tightness, disc displacement limiting condylar translation, or significant masseter and pterygoid hypertonicity preventing full range. All of these reflect active jaw dysfunction.',
      recordLabel: 'Restriction present \u2014 yes / no.',
      inputKind: 'yes-no',
      dbField: 'tmj_opening_restriction',
      videoId: null,
    },
  ],
  historyHeading: 'History Questions',
  historyIntro: 'Answer based on your genuine experience over the past three months.',
  historyQuestions: [
    {
      text: 'Do you wake with jaw soreness, facial tension, or a feeling of tightness around the jaw or temples?',
      dbField: 'tmj_morning_soreness',
    },
    {
      text: 'Do you catch yourself clenching your teeth during the day \u2014 while concentrating, driving, using screens, or during physical effort?',
      dbField: 'tmj_daytime_clenching',
    },
    {
      text: 'Do you experience pain, aching, or stiffness in your jaw when eating, chewing tough food, or yawning?',
      dbField: 'tmj_pain_eating',
    },
    {
      text: 'Is your tinnitus noticeably worse after prolonged chewing or a large meal?',
      dbField: 'tmj_worse_after_chewing',
    },
  ],
  contextHeading: 'Background History',
  contextIntro: 'These don\u2019t affect your jaw driver score but are recorded because they provide important context for your profile and influence how your results are explained.',
  contextQuestions: [
    {
      text: 'Have you had orthodontic treatment, braces, or worn a retainer?',
      dbField: 'ctx_orthodontic_history',
    },
    {
      text: 'Have you had dental extractions, particularly wisdom teeth or back teeth?',
      dbField: 'ctx_dental_extractions',
    },
    {
      text: 'Have you had jaw surgery or significant dental procedures involving the joint?',
      dbField: 'ctx_jaw_surgery',
    },
    {
      text: 'Have you had a jaw injury or direct trauma to the face or jaw?',
      dbField: 'ctx_jaw_injury',
    },
  ],
  submitLabel: 'Save and continue',
}
