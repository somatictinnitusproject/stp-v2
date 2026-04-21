import type { Phase1AssessmentRow, UserIntakeRow } from '../types'
import type { EdgeCaseFlags } from '../edge-cases'

export interface ParagraphContext {
  assessment: Phase1AssessmentRow
  user: UserIntakeRow
  tmjNorm: number
  cervNorm: number
  edgeCaseFlags: EdgeCaseFlags
}
