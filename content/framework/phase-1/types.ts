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
