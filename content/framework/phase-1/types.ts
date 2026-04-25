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
