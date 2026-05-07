import { SCORING_THRESHOLDS } from '@/content/scoring-thresholds'
import type { ParagraphContext } from './types'

// Doc 13 §4.5 pseudocode (exact):
//   // Section 6 — Session structure choice
//   // Full text and option descriptions in Document 8 B.7 Section 6
//   // Omitted (returns NULL) for low-confidence members and pure single drivers
//   FUNCTION generateSection6_SessionStructureChoice(assessment, tmjNorm, cervNorm):
//     // Omit for low-confidence members — they do not choose a protocol option
//     IF edgeCaseFlags.lowConfidence IS NOT NULL   RETURN NULL
//     // Omit for pure single drivers where secondary is negligible
//     IF assessment.profile_type = 'TMJ_DOMINANT' AND cervNorm < PROTOCOL_ASSIGNMENT_MINIMUM
//       RETURN NULL
//     IF assessment.profile_type = 'CERV_DOMINANT' AND tmjNorm < PROTOCOL_ASSIGNMENT_MINIMUM
//       RETURN NULL
//     RETURN sessionStructureText[assessment.profile_type]
//          + recommendationText[assessment.profile_type]
//   END FUNCTION
//
// Note on TMJ_DOMINANT / CERV_DOMINANT reachability:
//   By classification, TMJ_DOMINANT always has cervNorm < 20 and CERV_DOMINANT always
//   has tmjNorm < 20 — so the omission conditions above always fire for these types.
//   They will never reach the return statement in normal operation. recommendationText
//   entries for these types are defensive defaults that should not be reached in practice.

export function generateSection6_SessionStructureChoice(ctx: ParagraphContext): string | null {
  const { assessment, edgeCaseFlags, tmjNorm, cervNorm } = ctx
  const { PROTOCOL_ASSIGNMENT_MINIMUM } = SCORING_THRESHOLDS

  if (edgeCaseFlags.lowConfidence !== null) return null
  if (assessment.profile_type === 'TMJ_DOMINANT'  && cervNorm < PROTOCOL_ASSIGNMENT_MINIMUM) return null
  if (assessment.profile_type === 'CERV_DOMINANT' && tmjNorm  < PROTOCOL_ASSIGNMENT_MINIMUM) return null
  if (assessment.profile_type === null) return null

  const recommendation = recommendationText[assessment.profile_type] ?? recommendationText.DUAL_DRIVER

  return sessionStructureIntro() + '\n\n' + sessionStructureOptions() + '\n\n' + recommendation
}

// ── Session structure intro ───────────────────────────────────────────────────
// Doc 8 B.7 Section 6 (verbatim)

function sessionStructureIntro(): string {
  return 'Most members are assigned both protocols. How you run them together is a choice based on your available time and preference.'
}

// ── Session structure options ─────────────────────────────────────────────────
// Doc 8 B.7 Section 6 — three options table rendered as prose (verbatim content)

function sessionStructureOptions(): string {
  return [
    'Option 1, Sequential: Complete jaw release phase fully before introducing the cervical protocol. Lower daily time commitment, cleaner variable control. Recommended for: limited available time or preference for focused approach.',
    'Option 2, Parallel: Both protocols simultaneously from day one. Requires 40–50 minutes daily for combined release work. Recommended for: confirmed dual primary driver profiles with sufficient time.',
    'Option 3, Prioritised Parallel (default recommendation): Full primary driver protocol daily plus reduced secondary component. Best balance of comprehensiveness and time for most members. Recommended for: primary with strong secondary or primary with secondary profiles. Also suitable for dual drivers who prefer a lighter initial load.',
  ].join('\n\n')
}

// ── Recommendation text by profile type ──────────────────────────────────────
// Doc 8 B.7 Section 6 — recommendation text (verbatim)
// TMJ_DOMINANT and CERV_DOMINANT entries are defensive defaults — see note above.

const recommendationText: Record<string, string> = {
  DUAL_DRIVER:
    'Both pathways : working them simultaneously from day one is the most efficient approach. Option 2 is recommended.',

  TMJ_PRIMARY_STRONG_SECONDARY:
    'Your primary driver takes priority. Full primary protocol daily plus the two to three key secondary exercises gives comprehensive coverage without overcommitting time. Option 3 is recommended.',

  CERV_PRIMARY_STRONG_SECONDARY:
    'Your primary driver takes priority. Full primary protocol daily plus the two to three key secondary exercises gives comprehensive coverage without overcommitting time. Option 3 is recommended.',

  TMJ_PRIMARY_WITH_SECONDARY:
    'One exercise from the secondary protocol alongside the full primary is the right balance for your profile. Option 3 is recommended.',

  CERV_PRIMARY_WITH_SECONDARY:
    'One exercise from the secondary protocol alongside the full primary is the right balance for your profile. Option 3 is recommended.',

  // Defensive defaults — not reached in normal operation (see function-level note)
  TMJ_DOMINANT:
    'Your primary pathway is dominant. If a secondary protocol has been included, Option 1 (completing the primary phase fully before introducing secondary work) is the recommended approach.',

  CERV_DOMINANT:
    'Your primary pathway is dominant. If a secondary protocol has been included, Option 1 (completing the primary phase fully before introducing secondary work) is the recommended approach.',
}
