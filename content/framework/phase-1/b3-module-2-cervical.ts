// B.3 — Module 2: Cervical Driver
// Source: Document 8 Part B, section B.3. All mechanism prose and question text verbatim from Doc 8
// except P3 which has ERRATA E16 wording fix ("in the intake test" → "in the movement tests in this module").
// M3/M4/M5 question prose drafted for V2 (intake import UI removed per ERRATA E13).
// Floor lying relief test removed from Module 2 scope (sub-step 8.3 reviewer decision — cleanup in 8.3a).

import type { AssessmentQuestion, HistoryQuestion, ContextQuestion } from './types'

export type B3Module2Cerv = {
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

export const B3_MODULE_2_CERV: B3Module2Cerv = {
  sectionLabel: 'Phase 1 \u2014 Identification',
  sectionTitle: 'Module 2: Cervical Driver',
  mechanismHeading: 'Your Neck and Your Tinnitus',
  mechanismParagraphs: [
    // P1 \u2014 anatomy
    'The upper part of the cervical spine \u2014 the top two or three vertebrae just below the base of the skull \u2014 is one of the most neurologically dense regions in the body. The muscles and joints here contain an extraordinarily high concentration of sensory receptors, particularly the suboccipital muscles that sit at the very base of the skull. These receptors send a continuous stream of positional and movement information to the brain.',
    // P2 \u2014 brainstem pathway
    'That information travels through the upper cervical nerves and feeds into the brainstem in a region that sits very close to the auditory processing system. When the upper cervical spine is functioning normally \u2014 joints moving freely, muscles at appropriate resting tone, posture balanced \u2014 these signals are unremarkable background noise to the brain. When the upper cervical joints are restricted, when the suboccipital muscles are chronically compressed or hypertonic, or when sustained poor posture places the cervical spine under continuous abnormal load, the character of those signals changes. The brainstem\u2019s auditory processing system registers the abnormality and responds with elevated activity.',
    // P3 \u2014 real-time tinnitus change (ERRATA E16: "in the intake test" \u2192 "in the movement tests in this module")
    'This is why neck position and movement can directly influence tinnitus. Turning your head to one side, tucking your chin, lifting your head from the floor against gravity \u2014 each of these loads the upper cervical joints and muscles in a specific way. If your tinnitus changes during the movement tests in this module, you have direct functional evidence that the cervical pathway is involved.',
    // P4 \u2014 suboccipital muscles
    'Why the suboccipital muscles matter so much. The four pairs of suboccipital muscles \u2014 the small muscles connecting the top of the neck to the base of the skull \u2014 have the highest muscle spindle density of any muscle in the body relative to their size. Muscle spindles are sensory receptors that report on muscle length and tension. An unusually high density means these muscles send an unusually powerful stream of sensory information to the brain. When they are chronically compressed \u2014 through forward head posture, sustained desk work, poor sleep position, or direct tension \u2014 their output is disproportionately large relative to how small the muscles actually are. This makes suboccipital release one of the most reliably impactful interventions in the cervical protocol.',
    // P5 \u2014 forward head posture
    'Forward head posture as a continuous load. For every inch the head sits forward of its neutral position over the shoulders, the effective weight the cervical spine must support increases significantly. Most people with desk-based work, regular phone use, or chronic forward head posture are placing their upper cervical spine under sustained abnormal load for hours every day. This is not an acute injury \u2014 it is a slow, continuous mechanical input that keeps the cervical pathway persistently activated.',
  ],
  assessmentIntro: 'Work through each assessment carefully. There are no right or wrong findings \u2014 accurate findings are what matter.',
  questions: [
    // \u2500\u2500 Movement Tests \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    {
      heading: 'M3. Neck Flexion \u2014 Movement Test',
      instructions: [
        'Lie on your back on the floor with your legs flat. Slowly lift your head toward your chest \u2014 curl the chin toward the sternum as far as you comfortably can. Hold for 5 seconds. Pay close attention to whether your tinnitus changes during or immediately after the movement \u2014 even subtly.',
      ],
      mechanism: 'Neck flexion against gravity directly loads the suboccipital muscles and upper cervical joints \u2014 the structures with the highest sensory receptor density in the body relative to size. Any change in your tinnitus during or after this movement is direct functional evidence of upper cervical afferent pathway involvement.',
      recordLabel: 'Did your tinnitus change? \u2014 yes / no.',
      inputKind: 'yes-no',
      dbField: 'cerv_m3_neck_curl',
      videoId: null,
    },
    {
      heading: 'M4. Head Rotation \u2014 Movement Test',
      instructions: [
        'Sitting upright with your spine in a neutral position, slowly turn your head as far as you comfortably can to the right. Hold for around 10 seconds. Then repeat to the left. Pay close attention to whether your tinnitus changes during or after either rotation.',
        'Note whether any change felt equal on both sides, or stronger on one side \u2014 you will be asked about this below.',
      ],
      mechanism: 'Cervical rotation loads the facet joints and the suboccipital muscles on the side toward which the head turns. A positive response confirms that mechanical loading of the upper cervical spine is directly coupled to auditory pathway activity. Asymmetry between sides \u2014 a stronger response on one side than the other \u2014 is diagnostically significant and influences the lateralised emphasis of your protocol.',
      recordLabel: 'Did your tinnitus change? \u2014 yes / no. If yes: was the response stronger on one side than the other? \u2014 yes / no.',
      inputKind: 'yes-no-asymmetric',
      dbField: 'cerv_m4_head_rotation',
      dbFieldSecondary: 'cerv_m4_asymmetric_side',
      videoId: null,
    },
    {
      heading: 'M5. Chin Retraction \u2014 Movement Test',
      instructions: [
        'Sitting upright, draw your chin straight back \u2014 as if making a double chin. Move slowly and steadily. Hold for 5 seconds. Pay close attention to whether your tinnitus changes during or immediately after the movement.',
        'Stop if you feel any pain.',
      ],
      mechanism: 'Chin retraction decompresses the upper cervical spine by drawing the atlas and axis away from their forward-loaded position. Some members notice a reduction in tinnitus with this movement; others notice an increase. Either direction of change is evidence of mechanical coupling between cervical position and auditory pathway activity.',
      recordLabel: 'Did your tinnitus change? \u2014 yes / no.',
      inputKind: 'yes-no',
      dbField: 'cerv_m5_chin_tuck',
      videoId: null,
    },
    // \u2500\u2500 Physical Assessment \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    {
      heading: '1. Suboccipital Palpation',
      instructions: [
        'Place both thumbs at the base of your skull \u2014 find the bony ridge where the skull meets the top of the neck, then press firmly just below it on both sides simultaneously. You are pressing into the suboccipital muscles, which sit in the small hollow between the base of the skull and the first cervical vertebra.',
        'Apply firm, sustained pressure for five to ten seconds on each side. You are looking for tenderness, a deep aching sensation, or any reproduction of head or neck discomfort. Compare both sides. Asymmetric tenderness \u2014 significantly more pronounced on one side \u2014 is more diagnostically significant than equal bilateral tenderness.',
      ],
      mechanism: 'Tenderness here indicates active compression or hypertonicity in the suboccipital muscles \u2014 the group with the highest sensory density in the body relative to size. Asymmetric tenderness suggests a lateralised cervical tension pattern, which will receive asymmetric emphasis in your protocol.',
      recordLabel: 'Tenderness present \u2014 yes / no. If yes: asymmetric \u2014 yes / no. If asymmetric: worse side \u2014 left / right.',
      inputKind: 'yes-no-asymmetric-side',
      dbField: 'cerv_suboccipital_tenderness',
      dbFieldSecondary: 'cerv_suboccipital_asymmetric',
      dbFieldTertiary: 'cerv_suboccipital_tender_side',
      videoId: null,
    },
    {
      heading: '2. SCM Palpation',
      instructions: [
        'The sternocleidomastoid is the prominent muscle running diagonally from just below your ear down to your collarbone. You can make it stand out clearly by turning your head to the opposite side against resistance \u2014 hold your head with one hand and try to turn it while resisting.',
        'With the muscle identified, palpate along its length on both sides, comparing tone and tenderness. Gently compress the muscle belly between your thumb and fingers, working from just below the ear down toward the collarbone. Compare both sides for resting tone and tenderness on palpation.',
      ],
      mechanism: 'SCM asymmetry indicates a lateralised cervical tension pattern. When one SCM is chronically dominant it pulls the head into ipsilateral rotation and places asymmetric load on the upper cervical facet joints on the contralateral side.',
      recordLabel: 'Asymmetry present \u2014 yes / no. If yes: dominant side \u2014 left / right.',
      inputKind: 'yes-no-direction',
      dbField: 'cerv_scm_asymmetry',
      dbFieldSecondary: 'cerv_scm_dominant_side',
      videoId: null,
    },
    {
      heading: '3. Upper Trapezius Palpation',
      instructions: [
        'The upper trapezius runs from the base of the skull and upper cervical spine out to the shoulder on each side. Grasp the muscle between your thumb and fingers at the peak of the shoulder \u2014 the highest point of the trapezius ridge \u2014 and squeeze firmly on both sides simultaneously.',
        'Compare resting tone and tenderness between sides. One side feeling significantly tighter, ropier, or more tender than the other is a meaningful asymmetric finding.',
      ],
      mechanism: 'Upper trapezius tension elevates the shoulder on the tight side and loads the cervical spine at the cervicothoracic junction. Combined with elevated shoulder finding in Module 3, this confirms a consistent mechanical pattern.',
      recordLabel: 'Asymmetry present \u2014 yes / no. If yes: dominant side \u2014 left / right.',
      inputKind: 'yes-no-direction',
      dbField: 'cerv_trap_asymmetry',
      dbFieldSecondary: 'cerv_trap_dominant_side',
      videoId: null,
    },
    {
      heading: '4. Rotation Range Assessment',
      instructions: [
        'Sitting upright with your spine neutral, slowly turn your head as far as you comfortably can to the right. Hold briefly at end range and note how far you got, whether there is restriction, and whether there is pain, pulling, or discomfort. Repeat to the left.',
        'Compare both sides. Restriction means one side reaches noticeably less rotation than the other. Asymmetric findings \u2014 one side clearly tighter, more restricted, or more uncomfortable \u2014 are more significant than bilateral restriction.',
      ],
      mechanism: 'Restricted cervical rotation indicates facet joint restriction, muscle tightness, or both on the restricted side. Asymmetric restriction suggests a lateralised pattern consistent with unilateral cervical dysfunction.',
      recordLabel: 'Restriction present \u2014 yes / no. If yes: more restricted side \u2014 left / right / both equally.',
      inputKind: 'yes-no-direction',
      dbField: 'cerv_rotation_restriction',
      dbFieldSecondary: 'cerv_restricted_side',
      videoId: null,
    },
    {
      heading: '5. Forward Head Posture Assessment',
      instructions: [
        'Stand side-on to a mirror, or take a side profile photo in a relaxed standing position. Look at where your ear sits relative to your shoulder \u2014 does your ear sit directly above the bony prominence of your shoulder, or does it sit significantly in front of it?',
        'A small degree of forward head position is common and not necessarily significant. An ear that sits clearly anterior to the shoulder \u2014 a full inch or more forward \u2014 is a meaningful finding.',
        'Alternatively, stand with your back against a wall, heels touching the baseboard. Your shoulder blades and the back of your head should both touch the wall comfortably. If you cannot get your head to the wall without straining, or if you need to lift your chin to make contact, forward head posture is confirmed.',
      ],
      mechanism: 'Forward head posture increases mechanical load on the upper cervical spine continuously throughout the day. Every hour in this position is an hour of abnormal cervical input into the auditory pathway.',
      recordLabel: 'Forward head posture confirmed \u2014 yes / no.',
      inputKind: 'yes-no',
      dbField: 'cerv_forward_head_posture',
      videoId: null,
    },
  ],
  historyHeading: 'History Questions',
  historyIntro: 'Answer based on your genuine experience over the past three months.',
  historyQuestions: [
    {
      text: 'Do you experience regular neck pain, stiffness, or restricted movement?',
      dbField: 'cerv_neck_pain',
    },
    {
      text: 'Do you get headaches that start at the base of the skull or spread upward from the neck?',
      dbField: 'cerv_cervicogenic_headaches',
    },
    {
      text: 'Is your tinnitus noticeably worse after prolonged desk work, driving, or sustained periods with your head forward or looking down?',
      dbField: 'cerv_worse_desk_work',
    },
  ],
  contextHeading: 'Background History (Contextual Flags \u2014 Unscored)',
  contextIntro: '',
  contextQuestions: [
    {
      text: 'Have you had a whiplash injury or significant neck injury?',
      dbField: 'ctx_whiplash_history',
    },
    {
      text: 'Do you have a sedentary occupation involving sustained desk work or screen use for most of the day?',
      dbField: 'ctx_sedentary_occupation',
    },
    {
      text: 'Do you regularly participate in one-sided sport or physical activity that asymmetrically loads the neck \u2014 such as tennis, golf, shooting, or certain gym patterns?',
      dbField: 'ctx_one_sided_sport',
    },
  ],
  submitLabel: 'Save and continue',
}
