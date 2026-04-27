// C.4 — Habits Audit: Systemic
// Source: Document 8 Part C section C.4. Verbatim member-facing prose for
// both systemic habits (exercise, and caffeine/alcohol/smoking).
//
// Personalisation: per-habit "Flagged for your profile" labels fire when
// 3 or more nervous-system flags are confirmed. Doc 8 system note
// additionally specifies high_intensity_exercise / high_caffeine /
// alcohol_pattern as alternate triggers, but those columns are
// PERMANENTLY missing per E23 design decision. The ns flag count
// fallback covers both habits.
//
// Unlike C.2 and C.3, there is no universal score gate — the systemic
// content applies regardless of driver. The flag count threshold IS
// the gate.

// ── Content types ─────────────────────────────────────────────────────────────

// Paragraph entry — body prose or bold sub-heading.
// Both habits use subhead entries (H1 has 4 sub-sections, H2 has 3).
export type C4Paragraph =
  | { kind: 'p'; text: string }
  | { kind: 'subhead'; text: string }

// Single systemic habit card — Doc 8 C.4 sections 1-2.
export type C4Habit = {
  id: string                  // 'H1' | 'H2' — used as key in jsonb writes
  title: string
  paragraphs: C4Paragraph[]
  mechanismNote: string
  acknowledgeLabel: string
}

export type C4HabitsAuditSystemic = {
  sectionLabel: string
  sectionTitle: string
  introduction: string
  habits: C4Habit[]
  sectionAcknowledgeLabel: string
}

// ── Content constant ──────────────────────────────────────────────────────────

export const C4_HABITS_AUDIT_SYSTEMIC: C4HabitsAuditSystemic = {
  sectionLabel: 'Phase 2 \u2014 Lifestyle Foundations',
  sectionTitle: 'Habits Audit \u2014 Systemic',
  introduction:
    'Work through each habit below. For habits marked \u201cFlagged for ' +
    'your profile,\u201d your Phase 1 assessment identified this as an ' +
    'active maintaining factor in your specific case \u2014 it warrants ' +
    'particular attention.',
  sectionAcknowledgeLabel: 'I have read the systemic habits section',
  habits: [
    // ── HABIT 1 — Exercise and Physical Effort ───────────────────────────
    {
      id: 'H1',
      title: '1. Exercise and Physical Effort',
      paragraphs: [
        { kind: 'p', text:
          'Regular moderate exercise is one of the most effective ' +
          'tools available for reducing baseline sympathetic tone ' +
          '\u2014 the background nervous system activation that ' +
          'amplifies tinnitus perception on top of whatever the ' +
          'primary driver is producing. This entry is not a caution ' +
          'against exercise. It is a set of specific adjustments that ' +
          'make exercise work with your nervous system and ' +
          'musculature rather than against it.' },
        { kind: 'subhead', text: 'Recovery and intensity' },
        { kind: 'p', text:
          'High intensity exercise without adequate recovery sustains ' +
          'elevated systemic sympathetic tone and keeps whole-body ' +
          'muscle tension higher than it would otherwise be. The issue ' +
          'is not intensity itself \u2014 it is the combination of ' +
          'high intensity and insufficient recovery between sessions. ' +
          'If you are training hard daily without rest days, or ' +
          'pushing through sessions while already fatigued, the ' +
          'sympathetic load accumulates rather than resolving between ' +
          'sessions. One or two rest days per week and honest ' +
          'assessment of recovery quality between sessions is the ' +
          'standard to aim for.' },
        { kind: 'subhead', text: 'Load, reps, and form' },
        { kind: 'p', text:
          'For resistance training specifically: dropping the load ' +
          'and increasing the rep range \u2014 twelve controlled reps ' +
          'with good form rather than five reps at maximum load ' +
          '\u2014 reduces the whole-body bracing response that heavy ' +
          'loading produces. Maximum effort lifts drive jaw ' +
          'clenching, breath holding, and full-body tension as a ' +
          'physiological response. This is not avoidable at true ' +
          'maximal loads. At moderate loads with controlled form it ' +
          'is. This is not a recommendation to stop training hard ' +
          '\u2014 it is a specific adjustment during Phase 3 that ' +
          'reduces the daily tension load your protocol is working ' +
          'against.' },
        { kind: 'subhead', text: 'Breathing during effort' },
        { kind: 'p', text:
          'Exhale on the contraction. This is standard coaching ' +
          'guidance but worth stating explicitly here because it is ' +
          'directly relevant to jaw and cervical tension during ' +
          'exercise. Holding the breath during contraction \u2014 ' +
          'the Valsalva manoeuvre \u2014 drives jaw clenching and ' +
          'cervical bracing as part of the same pattern. A controlled ' +
          'exhale through the effort phase keeps the jaw relaxed and ' +
          'the cervical muscles in a more neutral state. Check your ' +
          'jaw position during the hardest part of each set \u2014 ' +
          'it should be relaxed, teeth apart, not clenched.' },
        { kind: 'subhead', text: 'Jaw release during effort' },
        { kind: 'p', text:
          'Separately from breathing: consciously check jaw position ' +
          'during exercise. During maximum effort \u2014 sprinting, ' +
          'heavy carries, intense sport \u2014 jaw clenching is a ' +
          'near-universal compensation pattern. Awareness and release ' +
          'during effort is the intervention. Teeth apart, jaw ' +
          'relaxed, effort through the working muscles rather than ' +
          'through a whole-body brace.' },
      ],
      mechanismNote:
        'Sustained high sympathetic tone from inadequate exercise ' +
        'recovery elevates baseline muscle tension throughout the ' +
        'body including in the jaw and cervical musculature \u2014 ' +
        'directly feeding back into the primary driver pathway. Jaw ' +
        'clenching and cervical bracing during heavy loading produces ' +
        'high-intensity masticatory and cervical muscle contraction ' +
        'across every training session. Exhaling on contraction and ' +
        'maintaining jaw release during effort reduces this load ' +
        'without compromising training quality.',
      acknowledgeLabel: 'I understand this habit and what I need to change',
    },

    // ── HABIT 2 — Caffeine, Alcohol, and Smoking ─────────────────────────
    {
      id: 'H2',
      title: '2. Caffeine, Alcohol, and Smoking',
      paragraphs: [
        { kind: 'p', text:
          'These three are grouped together because they share a ' +
          'common relevance \u2014 each affects either baseline ' +
          'sympathetic tone, systemic inflammation, or cochlear blood ' +
          'flow in ways that are directly relevant to tinnitus ' +
          'perception. None of them require elimination. Each ' +
          'warrants honest personal monitoring.' },
        { kind: 'subhead', text: 'Caffeine' },
        { kind: 'p', text:
          'Caffeine increases sympathetic nervous system activation ' +
          'and affects cochlear blood flow at higher doses. The ' +
          'relevant question is not whether to eliminate it but ' +
          'whether your current intake is contributing to elevated ' +
          'baseline sympathetic tone. For most people moderate ' +
          'caffeine intake \u2014 one to two cups of coffee daily ' +
          '\u2014 is unlikely to be a significant factor. Higher ' +
          'intake, particularly later in the day, is worth reducing ' +
          'and monitoring. The change to make is reduction and ' +
          'timing adjustment rather than elimination \u2014 cutting ' +
          'intake after midday is the most impactful single caffeine ' +
          'adjustment for most people.' },
        { kind: 'subhead', text: 'Alcohol' },
        { kind: 'p', text:
          'Alcohol has a complex relationship with tinnitus. Many ' +
          'people report temporary relief during consumption ' +
          'followed by worsening during the rebound period \u2014 ' +
          'the nervous system upregulation that follows alcohol\u2019s ' +
          'depressant effect. Others notice no consistent pattern. ' +
          'The honest position is that the relationship varies ' +
          'between individuals and is worth tracking personally ' +
          'rather than applying a blanket rule.' },
        { kind: 'p', text:
          'Use your progress tracker to monitor tinnitus loudness on ' +
          'days following alcohol consumption. A consistent pattern ' +
          'of worsening the following day is meaningful data worth ' +
          'acting on. An absence of pattern means alcohol is probably ' +
          'not a significant factor for you specifically. The ' +
          'tracker gives you the data to answer this question for ' +
          'yourself rather than relying on a general recommendation.' },
        { kind: 'subhead', text: 'Smoking' },
        { kind: 'p', text:
          'Smoking produces vasoconstriction that reduces cochlear ' +
          'blood flow \u2014 the inner ear is highly sensitive to ' +
          'circulatory changes given its small blood vessel supply. ' +
          'Reduced cochlear blood flow is a direct mechanism for ' +
          'tinnitus maintenance and amplification independent of the ' +
          'somatic pathway. Smoking also drives systemic ' +
          'inflammation, which contributes to the same neurological ' +
          'environment that maintains DCN hypersensitivity.' },
        { kind: 'p', text:
          'This is not a smoking cessation programme and the ' +
          'platform does not prescribe lifestyle choices. The ' +
          'mechanism is worth understanding clearly: if you smoke, ' +
          'it is an active contributing factor to your tinnitus ' +
          'through a separate and additional pathway to the somatic ' +
          'one. Reduction is worth considering on its merits.' },
      ],
      mechanismNote:
        'Caffeine elevates sympathetic tone and at higher doses ' +
        'affects cochlear blood flow. Alcohol produces nervous ' +
        'system rebound upregulation following its depressant ' +
        'effect \u2014 the period of heightened sympathetic tone ' +
        'following consumption is a known tinnitus amplifier for ' +
        'susceptible individuals. Smoking causes vasoconstriction ' +
        'reducing cochlear blood supply and drives systemic ' +
        'inflammation that maintains the neurological environment ' +
        'in which DCN hypersensitivity persists.',
      acknowledgeLabel: 'I understand this habit and what I need to change',
    },
  ],
}

// ── Personalisation helper ────────────────────────────────────────────────────

// Subset of phase1_assessment used by C.4 personalisation. The four
// nervous-system boolean columns; their count drives the flag firing.
// Defined locally per the established pattern (E17 staleness avoidance).
export type C4AssessmentInput = {
  ns_stress_tinnitus_correlation: boolean | null
  ns_hypervigilance: boolean | null
  ns_sleep_disruption: boolean | null
  ns_anxiety_loop: boolean | null
}

// Counts confirmed nervous-system flags. Returns 0 when assessment is null.
// Used by getC4HabitFlag for the >=3 threshold; also exported for any
// future call sites that need the raw count (e.g. Phase 4 nudges).
export function countNsFlags(assessment: C4AssessmentInput | null): number {
  if (!assessment) return 0
  let count = 0
  if (assessment.ns_stress_tinnitus_correlation === true) count++
  if (assessment.ns_hypervigilance === true) count++
  if (assessment.ns_sleep_disruption === true) count++
  if (assessment.ns_anxiety_loop === true) count++
  return count
}

// Returns true if the habit's "Flagged for your profile" label should
// fire for this member, false otherwise.
//
// No universal score gate: the systemic content applies regardless of
// which driver pathway is dominant. Both habits gate purely on the
// nervous-system flag count threshold.
//
// Doc 8 C.4 system note: H1 (exercise) — high_intensity_exercise OR
//   3+ ns flags. H2 (caffeine/alcohol/smoking) — high_caffeine OR
//   alcohol_pattern OR 3+ ns flags.
// Per E23, high_intensity_exercise / high_caffeine / alcohol_pattern
// columns are PERMANENTLY missing. Both habits fall through to the
// ns flag count fallback, which is identical for both — so getC4HabitFlag
// returns the same value regardless of habitId.
export function getC4HabitFlag(
  habitId: string,
  assessment: C4AssessmentInput | null
): boolean {
  // Both H1 and H2 use the same fallback gate per E23. The habitId
  // parameter is retained for parity with getC2HabitFlag / getC3HabitFlag
  // signatures and for future extensibility if columns are added.
  if (habitId !== 'H1' && habitId !== 'H2') return false
  return countNsFlags(assessment) >= 3
}
