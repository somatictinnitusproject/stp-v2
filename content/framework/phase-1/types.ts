// Shared assessment question types for Phase 1 modules.
// Imported by b2-module-1-tmj.ts and b3-module-2-cervical.ts.

export type AssessmentInputKind =
  | 'yes-no-unsure-direction'  // primary yes/no/unsure + conditional left/right
  | 'yes-no-direction'         // primary yes/no + conditional left/right
  | 'yes-no-side'              // primary yes/no + conditional left/right/bilateral
  | 'yes-no'                   // boolean only
  | 'yes-no-asymmetric'        // primary yes/no + conditional asymmetric yes/no
  | 'yes-no-asymmetric-side'   // primary yes/no + conditional asymmetric yes/no + conditional left/right

export type AssessmentQuestion = {
  heading: string
  instructions: string[]
  mechanism: string
  recordLabel: string
  inputKind: AssessmentInputKind
  dbField: string
  dbFieldSecondary?: string
  dbFieldTertiary?: string         // three-level compounds only (e.g. suboccipital: tenderness → asymmetric → side)
  videoId?: string | null
}

export type HistoryQuestion = {
  text: string
  dbField: string
}

export type ContextQuestion = {
  text: string
  dbField: string
}

// ── Module 3 (Postural) types ─────────────────────────────────────────────────

export type B4InputType =
  | 'boolean'            // yes/no → boolean
  | 'side_select'        // left/right — conditional on parent boolean being true
  | 'left_right_neither' // left/right/no_preference (dominant chewing side)
  | 'four_band_hours'    // 'Less than 2' | '2\u20134 hours' | '4\u20136 hours' | 'More than 6 hours'
  | 'yes_no_sometimes'   // yes/no/sometimes (one-sided work pattern)

export type B4Input = {
  id: string
  label: string
  inputKind: B4InputType
  dbField: string | null   // column name, or null for UI-only inputs
  hint?: string            // inline descriptive note from Doc 8 (block 3 inputs only)
  subheading?: string      // sub-group label within block 3
}

export type B4Block = {
  title: string
  prose: string[]
  mechanism: string | null   // null for block 4 (no mechanism box in Doc 8 B.4)
  recordLabel: string
  inputs: B4Input[]
}

export type B4OutputRow = {
  flag: string
  memberText: string
}

export type B4Module3Postural = {
  id: string
  sessionNumber: number
  sectionLabel: string
  sectionTitle: string
  framing: string[]
  blocks: B4Block[]
  outputTable: B4OutputRow[]
  submitLabel: string
}

// ── Module 4 (Nervous System) types ─────────────────────────────────────

export type B5InputKind =
  | 'yes_sometimes_no'  // ternary — yes / sometimes / no (Q1, Q2, Q4, Q6)
  | 'sleep_triple'      // composite: three yes/sometimes/no sub-questions, flag fires on any yes (Q3)
  | 'tension_triple'    // composite: two yes/sometimes/no + one yes/no, UI-only — does not persist (Q5)

export type B5Input = {
  id: string
  label: string
  inputKind: B5InputKind
  dbField: string | null   // column name, or null for UI-only inputs
}

export type B5SubQuestion = {
  id: string
  label: string
  answerType: 'yes_sometimes_no' | 'yes_no'  // Q5's third sub-question is yes/no only per Doc 8
}

export type B5Block = {
  title: string
  prose: string[]                  // intro prose for this question (verbatim Doc 8)
  mechanism: string                // mechanism box
  recordLabel: string              // "Record:" line
  inputKind: B5InputKind
  subQuestions?: B5SubQuestion[]   // present only for sleep_triple and tension_triple
  dbField: string | null           // column or null for UI-only
}

export type B5OutputRow = {
  flag: string         // flag name as shown in the output table
  trigger: string      // trigger description from Doc 8 (verbatim)
  phase4Implication: string  // member-facing text (verbatim)
}

export type B5Module4Ns = {
  id: string
  sessionNumber: number
  sectionLabel: string
  sectionTitle: string
  framing: string[]
  blocks: B5Block[]   // 6 blocks for Q1–Q6
  outputTable: B5OutputRow[]
  submitLabel: string
}

// ── Module 5 (Asymmetry) types ────────────────────────────────────────────────

export type B6LateralisationAnswer =
  | 'left'      // "Yes — clearly worse in my left ear"
  | 'right'     // "Yes — clearly worse in my right ear"
  | 'bilateral' // "It's in both ears roughly equally"
  | 'central'   // "It's more of a central or head sound without clear lateralisation"
  | 'unsure'    // "I'm not sure"

export type B6LateralisationOption = {
  value: B6LateralisationAnswer
  label: string  // verbatim Doc 8 option text
}

// The eight source columns the consolidated findings display reads from
// existing assessment data. None of these are written by M5 — they are
// pulled forward and shown read-only.
export type B6FindingSource = {
  label: string                // member-facing label e.g. "Jaw drift on opening"
  sourceColumn: string         // the Phase1AssessmentRow column name (informational)
  sideColumn: string           // the column holding the side string (left/right/bilateral)
  presenceColumn?: string      // optional boolean column gating display (e.g. tmj_jaw_drift)
                               // when omitted, presence is determined by sideColumn !== null
}

export type B6Module5Asymmetry = {
  id: string
  sessionNumber: number
  sectionLabel: string
  sectionTitle: string
  framing: string[]
  consolidatedHeading: string             // e.g. "Your asymmetric findings"
  consolidatedIntro: string               // intro line above the findings list
  consolidatedFindings: B6FindingSource[] // exactly 8 entries — see Doc 8 §B.6
  emptyStateText: string                  // Doc 8 fallback when no findings — verbatim
  questionHeading: string
  questionPrompt: string                  // Doc 8: "Is your tinnitus worse in one ear..."
  questionOptions: B6LateralisationOption[] // exactly 5 — verbatim Doc 8
  recordLabel: string
  submitLabel: string
}

// ── B.7 (Profile Output) types ────────────────────────────────────────────────

export type B7ProtocolOptionValue = 1 | 2 | 3

export type B7ProtocolOption = {
  value: B7ProtocolOptionValue       // 1 = Sequential, 2 = Parallel, 3 = Prioritised Parallel
  name: string                       // e.g. "Sequential" / "Parallel" / "Prioritised Parallel"
  description: string                // verbatim Doc 8 §B.7 Section 6 description
  recommendedFor: string             // verbatim Doc 8 §B.7 Section 6 "Recommended for" italic text
}

// Recommendation rationale text shown above the option cards.
// Doc 8 §B.7 Section 6 lists three rationale variants:
//   - Dual driver
//   - Primary with strong secondary
//   - Primary with secondary
// Single driver and low-confidence members do not see the option selector.
export type B7RecommendationRationale = {
  profileTypePattern: 'dual' | 'primary_strong_secondary' | 'primary_with_secondary'
  text: string  // verbatim Doc 8 prose
}

export type B7ProfileOutput = {
  id: string
  sessionNumber: number
  sectionLabel: string
  sectionTitle: string

  // Heading shown above the rendered profile_paragraph
  paragraphHeading: string  // e.g. "Your Profile"

  // Section header above the option cards
  optionsHeading: string
  optionsIntro: string  // "Most members are assigned both protocols..." Doc 8 §B.7 Section 6 first line

  options: B7ProtocolOption[]  // exactly 3 — 1, 2, 3 in order
  recommendations: B7RecommendationRationale[]  // exactly 3 — dual / strong_secondary / with_secondary

  // Doc 8 §B.7 Section 7 — the "What Comes Next" paragraph
  whatComesNextHeading: string
  whatComesNextProse: string[]

  // Confirm button — for members with the option selector
  confirmButtonLabel: string

  // Acknowledge path — for low-confidence and pure single-driver members.
  // The same B.7 content covers both flows; the variant is determined by
  // the page wrapper based on protocol assignment booleans + low-confidence flag.
  acknowledgeIntro: string  // short framing sentence (single-driver context)
  acknowledgeButtonLabel: string
}
