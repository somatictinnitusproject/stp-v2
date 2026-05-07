import type { ParagraphContext } from './types'

// Doc 13 §4.5 pseudocode (exact):
//   // Section 5 — Protocol assignment statement
//   // Full text for each profile type in Document 8 B.7 Section 5
//   FUNCTION generateSection5_ProtocolAssignment(assessment, tmjNorm, cervNorm):
//     RETURN protocolAssignmentText[assessment.profile_type]
//   END FUNCTION
//
// Implementation note: defensive default (profile_type === null) should not occur
// at profile generation time. Returns TMJ_DOMINANT text as fallback.
//
// [jaw/cervical] slots in STRONG_SECONDARY and WITH_SECONDARY rows are filled at
// record-construction time with literal strings — same approach as Section 1.
// These are NOT §4.4 runtime placeholder tokens.

// Doc 8 B.7 Section 5 — Protocol Assignment Statement (verbatim)
// Exported for reuse in reading-view.tsx (M13l) — same strings, no duplication.
export const protocolAssignmentText: Record<string, string> = {
  TMJ_DOMINANT:
    'Full jaw release protocol (Weeks 1–2 daily) → jaw resistance and retraining phase (Week 3+) → suboccipital release as optional secondary component.',

  CERV_DOMINANT:
    'Full cervical release protocol (Weeks 1–2 daily) → cervical retraining phase (Week 3+) → masseter release as optional secondary component.',

  DUAL_DRIVER:
    'Both full protocols (jaw and cervical); see session structure options below.',

  TMJ_PRIMARY_STRONG_SECONDARY:
    'Full jaw protocol daily + two to three key cervical exercises daily; see session structure options below.',

  CERV_PRIMARY_STRONG_SECONDARY:
    'Full cervical protocol daily + two to three key jaw exercises daily; see session structure options below.',

  TMJ_PRIMARY_WITH_SECONDARY:
    'Full jaw protocol daily + one key cervical exercise; see session structure options below.',

  CERV_PRIMARY_WITH_SECONDARY:
    'Full cervical protocol daily + one key jaw exercise; see session structure options below.',
}

export function generateSection5_ProtocolAssignment(ctx: ParagraphContext): string {
  const profileType = ctx.assessment.profile_type
  return protocolAssignmentText[profileType ?? 'TMJ_DOMINANT'] ?? protocolAssignmentText.TMJ_DOMINANT
}
