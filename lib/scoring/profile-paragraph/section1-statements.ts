// NOTE: The "Opening Framing (All Members)" block from Doc 8 B.7 is NOT part of
// profile_paragraph. It is static UI text rendered by the profile output screen.
// generateSection1_ProfileTypeStatement begins after that preamble.

import type { ParagraphContext } from './types'

// Doc 13 §4.2 pseudocode (exact):
//   FUNCTION generateSection1_ProfileTypeStatement(assessment):
//     SWITCH assessment.profile_type:
//       CASE 'TMJ_DOMINANT':
//         RETURN tmjDominantStatement()
//       CASE 'CERV_DOMINANT':
//         RETURN cervDominantStatement()
//       CASE 'DUAL_DRIVER':
//         RETURN dualDriverStatement()
//       CASE 'TMJ_PRIMARY_STRONG_SECONDARY':
//         RETURN primaryWithStrongSecondaryStatement('jaw', 'cervical')
//       CASE 'CERV_PRIMARY_STRONG_SECONDARY':
//         RETURN primaryWithStrongSecondaryStatement('cervical', 'jaw')
//       CASE 'TMJ_PRIMARY_WITH_SECONDARY':
//         RETURN primaryWithSecondaryStatement('jaw', 'cervical')
//       CASE 'CERV_PRIMARY_WITH_SECONDARY':
//         RETURN primaryWithSecondaryStatement('cervical', 'jaw')
//     END SWITCH
//   END FUNCTION

// Doc 8 B.7 Section 1 — Profile Type 1 — Single Jaw Driver
// Triggered: jaw normalised score >60%, cervical normalised score <20%
function tmjDominantStatement(): string {
  return `Your primary driver is the jaw and masticatory system.

Your assessment identified strong jaw driver involvement and limited cervical involvement. The trigeminal pathway (specifically the auriculotemporal nerve and masticatory muscle tension feeding into the dorsal cochlear nucleus) is the dominant source of abnormal input driving your tinnitus.

This is a relatively clean picture. Your Phase 3 work centres on the jaw protocol, with minimal secondary cervical work.`
}

// Doc 8 B.7 Section 1 — Profile Type 2 — Single Cervical Driver
// Triggered: cervical normalised score >60%, jaw normalised score <20%
function cervDominantStatement(): string {
  return `Your primary driver is the upper cervical spine.

Your assessment identified strong cervical driver involvement and limited jaw involvement. The upper cervical afferent pathway (the joints and muscles at the top of your neck feeding abnormal sensory input into the brainstem's auditory system) is the dominant source driving your tinnitus.

This is also a relatively clean picture. Your Phase 3 work centres on the cervical protocol, with minimal secondary jaw work.`
}

// Doc 8 B.7 Section 1 — Profile Type 3 — Dual Primary Drivers
// Triggered: both normalised scores >30% AND within 15 percentage points of each other
function dualDriverStatement(): string {
  return `You have dual primary drivers: both jaw and cervical involvement are significant.

Your assessment identified meaningful involvement in both pathways, with scores close enough that neither clearly dominates. Both the trigeminal pathway from your jaw and the upper cervical afferent pathway from your neck are generating abnormal input into your auditory system simultaneously.

This is the most common profile. It means your Phase 3 work addresses both protocols with equal emphasis; more daily time commitment, but also more complete coverage of the drivers that are active.`
}

// Doc 8 B.7 Section 1 — Profile Type 4 — Primary with Strong Secondary
// Triggered: one score clearly leads (>50%), secondary score 30–50%
// [jaw/cervical] slots are substituted at call time — NOT §4.4 runtime placeholders.
function primaryWithStrongSecondaryStatement(primary: string, secondary: string): string {
  return `Your primary driver is the ${primary} system, with significant secondary ${secondary} involvement.

Your assessment identified one pathway as clearly dominant, but the secondary pathway is substantial enough to warrant full attention alongside the primary work. Addressing only the dominant driver while leaving the secondary one unaddressed would leave a meaningful portion of the input signal untreated.

Your Phase 3 work prioritises the ${primary} protocol while running a full secondary ${secondary} component alongside it.`
}

// Doc 8 B.7 Section 1 — Profile Type 5 — Primary with Secondary
// Triggered: one score clearly leads, secondary score 20–30%
// [jaw/cervical] slots are substituted at call time — NOT §4.4 runtime placeholders.
function primaryWithSecondaryStatement(primary: string, secondary: string): string {
  return `Your primary driver is the ${primary} system, with mild secondary ${secondary} involvement.

Your assessment identified a clear dominant pathway with a secondary one present but less significant. The secondary driver is above the threshold for inclusion (it's real and worth addressing), but the emphasis in your Phase 3 work sits firmly with the primary protocol.

Your Phase 3 work runs the full ${primary} protocol with a reduced secondary ${secondary} component.`
}

export function generateSection1_ProfileTypeStatement(ctx: ParagraphContext): string {
  switch (ctx.assessment.profile_type) {
    case 'TMJ_DOMINANT':                  return tmjDominantStatement()
    case 'CERV_DOMINANT':                 return cervDominantStatement()
    case 'DUAL_DRIVER':                   return dualDriverStatement()
    case 'TMJ_PRIMARY_STRONG_SECONDARY':  return primaryWithStrongSecondaryStatement('jaw', 'cervical')
    case 'CERV_PRIMARY_STRONG_SECONDARY': return primaryWithStrongSecondaryStatement('cervical', 'jaw')
    case 'TMJ_PRIMARY_WITH_SECONDARY':    return primaryWithSecondaryStatement('jaw', 'cervical')
    case 'CERV_PRIMARY_WITH_SECONDARY':   return primaryWithSecondaryStatement('cervical', 'jaw')
    default:
      // profile_type is null or unrecognised — should not occur in practice
      return ''
  }
}
