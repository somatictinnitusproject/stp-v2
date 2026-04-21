import { resolvePlaceholders } from './placeholders'
import { generateSection1_ProfileTypeStatement } from './section1-statements'
import { generateSection2_FindingsSummary } from './section2-findings'
import { generateSection3_PersonalisedParagraph } from './section3-paragraphs'
import { generateSection4_AsymmetryOutput } from './section4-asymmetry'
import { generateSection5_ProtocolAssignment } from './section5-protocol'
import { generateSection6_SessionStructureChoice } from './section6-structure'
import type { ParagraphContext } from './types'

// Doc 13 §4.1 pseudocode (exact):
//   FUNCTION generateProfileParagraph(assessment, user, tmjNorm, cervNorm, edgeCaseFlags):
//     sections = []
//     sections.push(generateSection1_ProfileTypeStatement(assessment))
//     sections.push(generateSection2_FindingsSummary(assessment, user))
//     sections.push(generateSection3_PersonalisedParagraph(assessment, user, edgeCaseFlags))
//     sections.push(generateSection4_AsymmetryOutput(assessment, edgeCaseFlags))
//     sections.push(generateSection5_ProtocolAssignment(assessment, cervNorm, tmjNorm))
//     sections.push(generateSection6_SessionStructureChoice(assessment, tmjNorm, cervNorm))
//     // Filter null sections (Section 6 omitted for low-confidence and pure single drivers)
//     RETURN sections.filter(s => s != NULL).join('\n\n')
//   END FUNCTION
//
// Implementation deviation: pseudocode takes individual arguments; we pass ParagraphContext
// so each section generator receives all data it needs without a long call signature.
// resolvePlaceholders is applied to the final joined string (§4.4 tokens may span sections).
export function generateProfileParagraph(ctx: ParagraphContext): string {
  const sections: Array<string | null> = [
    generateSection1_ProfileTypeStatement(ctx),
    generateSection2_FindingsSummary(ctx),
    generateSection3_PersonalisedParagraph(ctx),
    generateSection4_AsymmetryOutput(ctx),
    generateSection5_ProtocolAssignment(ctx),
    generateSection6_SessionStructureChoice(ctx),
  ]

  const joined = sections
    .filter((s): s is string => s !== null)
    .join('\n\n')

  return resolvePlaceholders(joined, ctx)
}

export type { ParagraphContext } from './types'
