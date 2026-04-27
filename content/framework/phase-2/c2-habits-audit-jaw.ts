// C.2 — Habits Audit: Jaw-Specific
// Source: Document 8 Part C section C.2. Verbatim member-facing prose for
// all seven jaw habits.
//
// Personalisation: per-habit "Flagged for your profile" labels fire based on
// phase1_assessment columns. Per E23 design decision, four habits (H3, H4,
// H6, H7) are PERMANENTLY silent — Doc 8 Phase 1 has no capture mechanism
// for the columns these labels would require, and no Phase 1 capture
// additions are planned. Habit content still renders in full for every
// member; only the supplementary label is omitted.

import { SCORING_THRESHOLDS } from '@/content/scoring-thresholds'

// ── Content types ─────────────────────────────────────────────────────────────

// Single jaw habit card — Doc 8 C.2 sections 1-7.
export type C2Habit = {
  id: string                // 'H1'..'H7' — used as key in jsonb writes
  title: string
  paragraphs: string[]
  mechanismNote: string
  acknowledgeLabel: string
}

export type C2HabitsAuditJaw = {
  sectionLabel: string
  sectionTitle: string
  introduction: string
  habits: C2Habit[]
  sectionAcknowledgeLabel: string
}

// ── Content constant ──────────────────────────────────────────────────────────

export const C2_HABITS_AUDIT_JAW: C2HabitsAuditJaw = {
  sectionLabel: 'Phase 2 \u2014 Lifestyle Foundations',
  sectionTitle: 'Habits Audit \u2014 Jaw-Specific',
  introduction:
    'Work through each habit below. For habits marked \u201cFlagged for ' +
    'your profile,\u201d your Phase 1 assessment identified this as an active ' +
    'maintaining factor in your specific case \u2014 it warrants particular ' +
    'attention.',
  sectionAcknowledgeLabel: 'I have read the jaw habits section',
  habits: [
    // ── HABIT 1 — Resting Jaw Position ───────────────────────────────────
    {
      id: 'H1',
      title: '1. Resting Jaw Position',
      paragraphs: [
        'Most people have never thought about where their jaw sits when ' +
        'they are not using it. The default for a large proportion of the ' +
        'population \u2014 particularly those with jaw tension \u2014 is ' +
        'teeth lightly touching or in contact at rest. This feels normal ' +
        'because it is habitual, but it is not neutral.',
        'The correct resting jaw position is: tongue resting on the roof ' +
        'of the mouth, lips together, teeth slightly apart. Not held ' +
        'open \u2014 just not in contact. This position keeps the masseter ' +
        'and pterygoid muscles in their true resting state rather than ' +
        'maintaining low-level activation throughout the day.',
        'Teeth-together resting position is one of the most persistent ' +
        'sources of background jaw loading. It requires no conscious ' +
        'effort to maintain \u2014 which is exactly why it continues ' +
        'unnoticed for years. Becoming aware of it is the first step. ' +
        'Interrupting it when you notice it is the second.',
        'Phase 3 covers resting position retraining in full \u2014 ' +
        'building the habit so it becomes automatic rather than requiring ' +
        'constant conscious attention. For now, the goal is awareness: ' +
        'notice when your teeth are in contact at rest and release.',
      ],
      mechanismNote:
        'Continuous low-level masseter and pterygoid activation maintains ' +
        'elevated muscle tone throughout the day. Every hour of ' +
        'teeth-together resting position is an hour of abnormal ' +
        'trigeminal input into the auditory pathway \u2014 not from a ' +
        'single high-load event but from sustained background activation ' +
        'accumulating across the entire day.',
      acknowledgeLabel: 'I understand this habit and what I need to change',
    },

    // ── HABIT 2 — Jaw Clenching During Concentration ─────────────────────
    {
      id: 'H2',
      title: '2. Jaw Clenching During Concentration, Driving, or Screen Use',
      paragraphs: [
        'Jaw clenching during focused activity is one of the most common ' +
        'and least noticed jaw habits. Most people who clench do so ' +
        'without any awareness \u2014 it surfaces only when they ' +
        'consciously check, or when they notice jaw fatigue or soreness ' +
        'after a long desk session or drive.',
        'The contexts most associated with unconscious clenching are: ' +
        'sustained concentration, driving, screen use, physical effort, ' +
        'and stress. In each case the jaw tension is a physical ' +
        'expression of mental or physical load \u2014 the body bracing ' +
        'in a pattern that has become habitual.',
        'The intervention here is awareness and interruption. Regularly ' +
        'checking jaw tension during these activities \u2014 particularly ' +
        'desk work and driving \u2014 and consciously releasing when ' +
        'clenching is found. Some people find it useful to set a ' +
        'reminder during their first few weeks of Phase 2 to prompt the ' +
        'check.',
        'Note: if your Phase 1 assessment identified morning jaw ' +
        'soreness or reported unconscious clenching, nocturnal bruxism ' +
        '\u2014 clenching or grinding during sleep \u2014 may also be a ' +
        'factor. That is addressed separately in Phase 3. This habit ' +
        'entry covers the waking pattern.',
      ],
      mechanismNote:
        'Sustained clenching during concentration produces repeated ' +
        'high-load masticatory muscle activation across hours of daily ' +
        'activity. Unlike gum chewing, which involves rhythmic movement, ' +
        'concentration clenching often involves sustained static ' +
        'contraction \u2014 the muscle held under tension without ' +
        'movement, which is mechanically more loading than dynamic use.',
      acknowledgeLabel: 'I understand this habit and what I need to change',
    },

    // ── HABIT 3 — Habitual Gum Chewing ───────────────────────────────────
    {
      id: 'H3',
      title: '3. Habitual Gum Chewing',
      paragraphs: [
        'Gum chewing is the most mechanically straightforward jaw habit ' +
        'on this list. Repeated rhythmic bilateral or unilateral jaw ' +
        'movement for extended periods directly fatigues the masticatory ' +
        'muscles and loads the TMJ. For members with confirmed jaw ' +
        'driver involvement, habitual gum chewing is an active ' +
        'maintaining factor with a clear and direct mechanism.',
        'The relevant variable is duration and frequency, not occasional ' +
        'use. A piece of gum after a meal is not the same as habitual ' +
        'chewing throughout the working day. If gum chewing is a regular ' +
        'daily habit \u2014 multiple pieces, extended sessions \u2014 ' +
        'reducing or eliminating it during Phase 3 is worth treating as ' +
        'a priority.',
      ],
      mechanismNote:
        'Rhythmic masticatory muscle contraction over extended periods ' +
        'maintains elevated muscle tone and joint loading. The TMJ disc ' +
        'and surrounding soft tissue receive continuous mechanical ' +
        'stress during prolonged chewing. For members with pterygoid ' +
        'tenderness or joint sounds, gum chewing directly aggravates the ' +
        'already sensitised structures.',
      acknowledgeLabel: 'I understand this habit and what I need to change',
    },

    // ── HABIT 4 — Nail Biting and Object Chewing ─────────────────────────
    {
      id: 'H4',
      title: '4. Nail Biting and Object Chewing',
      paragraphs: [
        'Nail biting, pen chewing, chewing the inside of the cheek, or ' +
        'habitually biting other objects \u2014 phone cases, glasses ' +
        'arms, food packaging \u2014 all involve the same basic ' +
        'mechanism as gum chewing but are often more unconscious and ' +
        'therefore harder to interrupt.',
        'These habits tend to cluster with concentration and anxiety ' +
        '\u2014 they are often stress-linked behaviours that have ' +
        'become automatic. The mechanical loading they produce is real ' +
        'regardless of their psychological function. Awareness is the ' +
        'starting point. Substitution \u2014 replacing the habit with ' +
        'something that does not load the jaw \u2014 is often more ' +
        'effective than simple elimination.',
      ],
      mechanismNote:
        'Object biting loads the pterygoid muscles and TMJ in patterns ' +
        'that are often asymmetric \u2014 nail biting in particular ' +
        'tends to favour one side. Repeated asymmetric loading ' +
        'reinforces the same muscular imbalances that the Phase 3 ' +
        'protocol is working to correct.',
      acknowledgeLabel: 'I understand this habit and what I need to change',
    },

    // ── HABIT 5 — Unilateral Chewing ─────────────────────────────────────
    {
      id: 'H5',
      title: '5. Unilateral Chewing',
      paragraphs: [
        'Most people have a habitual chewing side without being aware of ' +
        'it. Food gets moved automatically to the preferred side, ' +
        'chewing happens predominantly on one side, and the other side ' +
        'is used less. Over time this reinforces masseter overdevelopment ' +
        'and pterygoid asymmetry on the dominant side \u2014 the same ' +
        'asymmetric pattern that Phase 3 works to correct.',
        'The habit change here is conscious bilateral alternation during ' +
        'meals \u2014 making an active effort to use both sides rather ' +
        'than defaulting to the preferred one. This is easier to ' +
        'maintain at the start of a meal when attention is fresh and ' +
        'harder as the meal progresses. Consistency matters more than ' +
        'perfection.',
        'If your Phase 1 assessment identified a dominant chewing side ' +
        'alongside masseter asymmetry, these two findings together ' +
        'confirm the mechanical cause of that asymmetry. Addressing the ' +
        'habit directly reduces the daily input that is maintaining it.',
      ],
      mechanismNote:
        'Consistent unilateral chewing produces asymmetric masseter ' +
        'hypertrophy and pterygoid loading. The dominant side receives a ' +
        'disproportionate share of total daily chewing load, maintaining ' +
        'the muscular imbalance and asymmetric trigeminal input that ' +
        'drives lateralised jaw-origin tinnitus.',
      acknowledgeLabel: 'I understand this habit and what I need to change',
    },

    // ── HABIT 6 — Jaw Posturing Habits ───────────────────────────────────
    // H6 has 5 paragraphs in Doc 8: an intro line, two named-pattern
    // entries, a closing summary line, and an italicised "additional
    // pattern" note about forced yawning. All five preserved.
    {
      id: 'H6',
      title: '6. Jaw Posturing Habits',
      paragraphs: [
        'Two specific posturing habits are worth checking for:',
        'Resting chin on hand \u2014 sitting at a desk or reading with ' +
        'the chin resting in the palm or on fingers places direct ' +
        'external load on the mandible, compressing the TMJ and altering ' +
        'its resting position. It is a posture that feels comfortable ' +
        'but is mechanically significant for the joint.',
        'Jaw bracing during physical effort \u2014 clenching or setting ' +
        'the jaw during exercise, heavy lifting, or sport. This is a ' +
        'common pattern and largely unconscious. The jaw brace during a ' +
        'heavy set at the gym or during intense sport produces ' +
        'significant masticatory muscle contraction that accumulates ' +
        'across training sessions.',
        'Both habits are worth checking for and interrupting when noticed.',
        'One additional pattern worth noting: deliberately forcing ' +
        'yawns \u2014 attempting to trigger a yawn or forcing the jaw ' +
        'to maximum open range to relieve a sensation of fullness or ' +
        'pressure in the ear. This is a common behaviour among people ' +
        'with jaw-origin tinnitus and TMJ dysfunction. The sensation it ' +
        'temporarily relieves is real, but the repeated forced opening ' +
        'loads the TMJ at end range and stretches the joint capsule and ' +
        'surrounding soft tissue. It is a behaviour that feels relieving ' +
        'in the moment and is counterproductive over time. If this is a ' +
        'current habit, Phase 3 jaw distraction work addresses the ' +
        'underlying sensation more effectively without the joint loading.',
      ],
      mechanismNote:
        'External mandibular load from chin resting compresses the TMJ ' +
        'disc and capsule directly. Jaw bracing during physical effort ' +
        'produces high-intensity masticatory contraction \u2014 brief ' +
        'but repeated across multiple sessions weekly. Both maintain ' +
        'loading in the joint and surrounding musculature outside of the ' +
        'specific daily clenching and chewing patterns. Forced yawning ' +
        'loads the TMJ at end range and places tensile stress on the ' +
        'joint capsule \u2014 the opposite of the controlled ' +
        'decompression the Phase 3 distraction work produces.',
      acknowledgeLabel: 'I understand this habit and what I need to change',
    },

    // ── HABIT 7 — Phone Trapped Between Ear and Shoulder ─────────────────
    {
      id: 'H7',
      title: '7. Phone Trapped Between Ear and Shoulder',
      paragraphs: [
        'Holding the phone between ear and shoulder during calls places ' +
        'the cervical spine into sustained lateral flexion and rotation ' +
        'simultaneously \u2014 and typically also drives compensatory ' +
        'jaw tension on the same side. It is one of the few habits that ' +
        'loads both driver pathways at once.',
        'This habit has become less common with headphones and ' +
        'speakerphone but remains worth flagging \u2014 it is still a ' +
        'regular pattern for some people, particularly during work calls ' +
        'where the hands need to be free. If it applies, the fix is ' +
        'simple: headphones, earbuds, or speakerphone for any call ' +
        'longer than a minute or two.',
      ],
      mechanismNote:
        'Sustained cervical lateral flexion with rotation loads the ' +
        'upper cervical joints and ipsilateral suboccipital musculature. ' +
        'Simultaneous jaw compensation on the same side adds masticatory ' +
        'muscle loading. The combined effect is direct loading of both ' +
        'trigeminal and upper cervical afferent pathways \u2014 the two ' +
        'primary driver routes into the dorsal cochlear nucleus.',
      acknowledgeLabel: 'I understand this habit and what I need to change',
    },
  ],
}

// ── Personalisation helper ────────────────────────────────────────────────────

// Subset of phase1_assessment used by C.2 personalisation. Defined locally
// to avoid coupling to the full Phase1AssessmentRow type (E17 staleness).
// tmj_raw_score is passed separately as the universal gate.
export type C2AssessmentInput = {
  tmj_daytime_clenching: boolean | null
  tmj_masseter_asymmetry: boolean | null
  post_dominant_chewing_side: string | null
}

// Returns true if the habit's "Flagged for your profile" label should fire
// for this member, false otherwise.
//
// Universal gate: tmj_normalised_score (0-100 percentage) must meet
// PROTOCOL_ASSIGNMENT_MINIMUM. Members with low jaw findings get no
// jaw-habit personalisation regardless of individual flag values.
//
// Unit note: PROTOCOL_ASSIGNMENT_MINIMUM (=20) is in normalised percentage
// units, not raw points. tmj_normalised_score is what's compared, not
// tmj_raw_score. Doc 8 C.2 system note says "above minimum assignment
// threshold" — interpreted as the same normalised threshold used to set
// tmj_protocol_assigned in classify.ts, for consistency across the codebase.
//
// E23 design decision (M12c-pre): four habits (H3, H4, H6, H7) are
// PERMANENTLY silent. Doc 8 Phase 1 has no capture mechanism for the
// columns these habits would require, and no Phase 1 capture additions
// are planned. Habit content still renders for every member — only the
// supplementary label is omitted.
export function getC2HabitFlag(
  habitId: string,
  assessment: C2AssessmentInput | null,
  tmjNormalisedScore: number | null
): boolean {
  if (
    tmjNormalisedScore === null ||
    tmjNormalisedScore < SCORING_THRESHOLDS.PROTOCOL_ASSIGNMENT_MINIMUM
  ) {
    return false
  }
  if (!assessment) return false

  switch (habitId) {
    // H1 — Resting position. Doc 8 system note: daytime_clenching OR
    // teeth_together_rest. teeth_together_rest never captured (E23).
    case 'H1':
      return assessment.tmj_daytime_clenching === true

    // H2 — Clenching. Doc 8 system note: daytime_clenching OR s1_score
    // positive. S-columns not in V2 schema (E20). Falls back to
    // daytime_clenching only.
    case 'H2':
      return assessment.tmj_daytime_clenching === true

    // H3 — Gum chewing. PERMANENT — no Phase 1 capture per E23.
    case 'H3':
      return false

    // H4 — Nail biting / object chewing. PERMANENT — no Phase 1 capture
    // per E23.
    case 'H4':
      return false

    // H5 — Unilateral chewing. Doc 8 system note: dominant_chewing_side
    // confirmed AND masseter_asymmetry confirmed. Both columns present.
    case 'H5':
      return (
        (assessment.post_dominant_chewing_side === 'left' ||
          assessment.post_dominant_chewing_side === 'right') &&
        assessment.tmj_masseter_asymmetry === true
      )

    // H6 — Jaw posturing. PERMANENT — no Phase 1 capture per E23.
    case 'H6':
      return false

    // H7 — Phone shoulder. PERMANENT — no Phase 1 capture per E23.
    case 'H7':
      return false

    default:
      return false
  }
}
