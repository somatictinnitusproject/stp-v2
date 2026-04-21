// Public API for Phase 1 scoring — imports kept narrow intentionally.
// Consumers should import from here, not from individual score files.

export { calculateTmjRawScore } from './tmj-score'
export { calculateCervRawScore } from './cerv-score'
export { normaliseTmj, normaliseCerv } from './normalise'
export { classifyProfileType, assignTmjProtocol, assignCervProtocol, getRecommendedProtocolOption } from './classify'
export type { ProfileType } from './classify'
export { checkLowConfidenceEdgeCase, checkSingleStrongMovement, checkContralateralPattern, classifyAsymmetryPattern, runAllEdgeCaseChecks } from './edge-cases'
export type { LowConfidenceFlag, AsymmetryPattern, SingleStrongMovement, EdgeCaseFlags } from './edge-cases'
export type { Phase1AssessmentRow, UserIntakeRow } from './types'
export { generateProfileParagraph } from './profile-paragraph'
export type { ParagraphContext } from './profile-paragraph'
