// NOTE — Doc 8 vs Doc 13 section numbering (from M5a stub):
// Doc 8 B.7 "Section 4 — Maintaining Factors Note" is NOT a separate assembly section.
// It maps to modifier stacking steps 3–5 in Doc 13 §4.4. Assembled here in Section 3.
// Doc 13 is authoritative.

import { SCORING_THRESHOLDS } from '@/content/scoring-thresholds'
import type { Phase1AssessmentRow } from '../types'
import type { LowConfidenceFlag, SingleStrongMovement } from '../edge-cases'
import type { ParagraphContext } from './types'

// Doc 13 §4.4 pseudocode (exact):
//   FUNCTION generateSection3_PersonalisedParagraph(assessment, user, edgeCaseFlags):
//     // 1. Select base template by profile type
//     paragraph = selectBaseTemplate(assessment.profile_type)
//     // 2. Resolve dynamic placeholders
//     paragraph = resolvePlaceholders(paragraph, assessment)
//     // 3. Apply TMJ contextual history flags (jaw-involved profiles only)
//     IF profile_type includes 'TMJ' OR profile_type = 'DUAL_DRIVER':
//       IF assessment.ctx_jaw_injury = TRUE            paragraph += jawInjuryModifier()
//       IF assessment.ctx_orthodontic_history = TRUE   paragraph += orthodonticModifier()
//       IF assessment.ctx_dental_extractions = TRUE    paragraph += dentalExtractionsModifier()
//       IF assessment.ctx_jaw_surgery = TRUE           paragraph += jawSurgeryModifier()
//     // 4. Apply cervical contextual history flags (cervical-involved profiles only)
//     IF profile_type includes 'CERV' OR profile_type = 'DUAL_DRIVER':
//       IF assessment.ctx_whiplash_history = TRUE      paragraph += whiplashModifier()
//       IF assessment.ctx_sedentary_occupation = TRUE  paragraph += sedentaryOccupationModifier()
//       IF assessment.ctx_one_sided_sport = TRUE       paragraph += oneSidedSportModifier()
//     // 5. Apply nervous system modifier
//     nsFlags = countNsFlags(assessment)
//     IF nsFlags >= HIGH_NS_FLAG_THRESHOLD   paragraph += highNervousSystemModifier()
//     ELSE IF nsFlags >= 1                   paragraph += mildNervousSystemModifier()
//     // 6. Wrap in low-confidence framing if edge case fired
//     IF edgeCaseFlags.lowConfidence IS NOT NULL
//       paragraph = lowConfidenceWrapper(edgeCaseFlags.lowConfidence, paragraph)
//     // 7. Append single strong movement note if fired
//     IF edgeCaseFlags.strongSingleFindings.tmj.length > 0
//        OR edgeCaseFlags.strongSingleFindings.cerv.length > 0
//       paragraph += strongSingleFindingNote(edgeCaseFlags.strongSingleFindings)
//     RETURN paragraph
//   END FUNCTION
//
// Implementation note: pseudocode takes (assessment, user, edgeCaseFlags).
// We pass ParagraphContext so helpers receive all data they need.
// resolvePlaceholders (step 2) runs on the FINAL joined string in index.ts.
// Base templates use [primary driver] / [secondary driver] tokens which are
// resolved at that point. [specific findings] variants are resolved inline here.

export function generateSection3_PersonalisedParagraph(ctx: ParagraphContext): string {
  const { assessment, edgeCaseFlags } = ctx
  const { HIGH_NS_FLAG_THRESHOLD } = SCORING_THRESHOLDS

  // Step 1 — base template (step 2 placeholder resolution deferred to main generator)
  let paragraph = selectBaseTemplate(ctx)

  // Step 3 — TMJ contextual flags (jaw-involved profiles only)
  if (isJawInvolved(assessment.profile_type)) {
    if (assessment.ctx_jaw_injury === true)          paragraph += '\n\n' + jawInjuryModifier()
    if (assessment.ctx_orthodontic_history === true) paragraph += '\n\n' + orthodonticModifier()
    if (assessment.ctx_dental_extractions === true)  paragraph += '\n\n' + dentalExtractionsModifier()
    if (assessment.ctx_jaw_surgery === true)         paragraph += '\n\n' + jawSurgeryModifier()
  }

  // Step 4 — cervical contextual flags (cervical-involved profiles only)
  if (isCervicalInvolved(assessment.profile_type)) {
    if (assessment.ctx_whiplash_history === true)     paragraph += '\n\n' + whiplashModifier()
    if (assessment.ctx_sedentary_occupation === true) paragraph += '\n\n' + sedentaryOccupationModifier()
    if (assessment.ctx_one_sided_sport === true)      paragraph += '\n\n' + oneSidedSportModifier()
  }

  // Step 5 — nervous system modifier
  const nsFlags = countNsFlags(assessment)
  if (nsFlags >= HIGH_NS_FLAG_THRESHOLD) {
    paragraph += '\n\n' + highNervousSystemModifier()
  } else if (nsFlags >= 1) {
    paragraph += '\n\n' + mildNervousSystemModifier()
  }

  // Step 6 — low-confidence wrapper replaces the base paragraph entirely
  if (edgeCaseFlags.lowConfidence !== null) {
    paragraph = lowConfidenceWrapper(edgeCaseFlags.lowConfidence)
  }

  // Step 7 — strong-single-finding note appended after any wrapper
  if (edgeCaseFlags.strongSingleFindings.tmj.length > 0 ||
      edgeCaseFlags.strongSingleFindings.cerv.length > 0) {
    paragraph += '\n\n' + strongSingleFindingNote(edgeCaseFlags.strongSingleFindings)
  }

  return paragraph
}

// ── Profile type predicates ──────────────────────────────────────────────────

function isJawInvolved(profileType: string | null): boolean {
  return profileType?.includes('TMJ') === true || profileType === 'DUAL_DRIVER'
}

function isCervicalInvolved(profileType: string | null): boolean {
  return profileType?.includes('CERV') === true || profileType === 'DUAL_DRIVER'
}

// ── NS flag counter ──────────────────────────────────────────────────────────

function countNsFlags(assessment: Phase1AssessmentRow): number {
  return [
    assessment.ns_stress_tinnitus_correlation,
    assessment.ns_hypervigilance,
    assessment.ns_sleep_disruption,
    assessment.ns_anxiety_loop,
  ].filter(f => f === true).length
}

// ── Specific-findings helpers ────────────────────────────────────────────────
// §4.4 defines [specific findings] as "comma-joined high-specificity confirmed indicators".
// Resolved inline here — not handled by resolvePlaceholders.

function getJawHighSpecificityFindings(assessment: Phase1AssessmentRow): string {
  const findings: string[] = []
  if (assessment.tmj_jaw_drift === true) {
    findings.push('jaw drift to the ' + (assessment.tmj_jaw_drift_direction ?? 'one side'))
  }
  if (assessment.tmj_m1_jaw_opening === true) findings.push('jaw opening modulation response')   // E14
  if (assessment.tmj_m2_jaw_protrusion === true) findings.push('jaw protrusion modulation response') // E14
  if (assessment.tmj_joint_sounds === true) findings.push('joint sounds')                         // E15
  if (assessment.tmj_pterygoid_tenderness === true) {
    const side = assessment.tmj_pterygoid_tender_side
      ? ' on the ' + assessment.tmj_pterygoid_tender_side
      : ''
    findings.push('pterygoid tenderness' + side)
  }
  return findings.length > 0 ? findings.join(', ') : 'your confirmed jaw findings'
}

function getCervHighSpecificityFindings(assessment: Phase1AssessmentRow): string {
  const findings: string[] = []
  if (assessment.cerv_m3_neck_curl === true) findings.push('neck curl on floor response')     // E13
  if (assessment.cerv_m4_head_rotation === true) findings.push('head rotation response')      // E13
  if (assessment.cerv_suboccipital_tenderness === true) {
    const side = assessment.cerv_suboccipital_tender_side
      ? ' on the ' + assessment.cerv_suboccipital_tender_side
      : ''
    findings.push('suboccipital tenderness' + side)
  }
  if (assessment.cerv_worse_desk_work === true) findings.push('tinnitus worse with desk work')
  if (assessment.cerv_rotation_restriction === true) {
    findings.push('restricted rotation to the ' + (assessment.cerv_restricted_side ?? 'one side'))
  }
  return findings.length > 0 ? findings.join(', ') : 'your confirmed cervical findings'
}

function getJawLaterality(assessment: Phase1AssessmentRow): string {
  const side = assessment.tmj_jaw_drift_direction ?? assessment.tmj_masseter_dominant_side
  if (side === 'left') return 'left-sided'
  if (side === 'right') return 'right-sided'
  return 'bilateral'
}

// ── Base template selector ───────────────────────────────────────────────────
//
// Doc 13 §4.4 step 1. Five templates from Doc 8 B.7 Section 3 cover all 7 profile types:
//   TMJ_DOMINANT                          → Jaw Primary
//   CERV_DOMINANT                         → Cervical Primary
//   DUAL_DRIVER                           → Dual Driver
//   TMJ/CERV_PRIMARY_STRONG_SECONDARY     → Primary with Strong Secondary
//   TMJ/CERV_PRIMARY_WITH_SECONDARY       → Primary with Secondary

function selectBaseTemplate(ctx: ParagraphContext): string {
  switch (ctx.assessment.profile_type) {
    case 'TMJ_DOMINANT':
      return jawPrimaryTemplate(ctx)
    case 'CERV_DOMINANT':
      return cervPrimaryTemplate(ctx)
    case 'DUAL_DRIVER':
      return dualDriverTemplate(ctx)
    case 'TMJ_PRIMARY_STRONG_SECONDARY':
    case 'CERV_PRIMARY_STRONG_SECONDARY':
      return primaryWithStrongSecondaryTemplate(ctx)
    case 'TMJ_PRIMARY_WITH_SECONDARY':
    case 'CERV_PRIMARY_WITH_SECONDARY':
      return primaryWithSecondaryTemplate(ctx)
    default:
      return jawPrimaryTemplate(ctx)
  }
}

// ── Jaw Primary — Base Paragraph Template ────────────────────────────────────
// Doc 8 B.7 Section 3 — Jaw Primary. Inline conditionals assembled in TypeScript.

function jawPrimaryTemplate(ctx: ParagraphContext): string {
  const { assessment, cervNorm } = ctx
  const findings = getJawHighSpecificityFindings(assessment)
  const side = getJawLaterality(assessment)

  let text = `Your tinnitus is being driven primarily through the jaw pathway. The ${findings} paint a consistent picture of ${side} masticatory dysfunction generating abnormal trigeminal input.`

  if (assessment.tmj_morning_soreness === true) {
    text += ' The morning jaw soreness you identified suggests nocturnal clenching is a significant maintaining factor; tension is rebuilding overnight while you sleep.'
  }

  if (assessment.tmj_daytime_clenching === true) {
    text += ' The unconscious daytime clenching pattern you identified means tension is being actively maintained between your protocol sessions; the resting position retraining in Phase 3 addresses this directly.'
  }

  text += ' Your Phase 3 jaw protocol is the central intervention.'

  if (cervNorm > 0) {
    text += ' Some cervical involvement is present and will be addressed alongside the jaw work, but it is not the primary driver in your case.'
  }

  return text
}

// ── Cervical Primary — Base Paragraph Template ───────────────────────────────
// Doc 8 B.7 Section 3 — Cervical Primary. Inline conditionals assembled in TypeScript.

function cervPrimaryTemplate(ctx: ParagraphContext): string {
  const { assessment } = ctx
  const findings = getCervHighSpecificityFindings(assessment)

  let text = `Your tinnitus is being driven primarily through the upper cervical pathway. The ${findings} indicate chronic upper cervical dysfunction generating elevated sensory input into the brainstem's auditory processing system.`

  if (assessment.cerv_forward_head_posture === true) {
    text += ' Your forward head posture is continuously loading the upper cervical spine throughout the day; addressing this through the workstation and postural guidance in Phase 4 will make your Phase 3 protocol work significantly more durable.'
  }

  text += ' Your Phase 3 cervical protocol is the central intervention.'

  return text
}

// ── Dual Driver — Base Paragraph Template ────────────────────────────────────
// Doc 8 B.7 Section 3 — Dual Driver. Asymmetry conditional assembled inline.

function dualDriverTemplate(ctx: ParagraphContext): string {
  const { assessment, edgeCaseFlags } = ctx
  const jawFindings = getJawHighSpecificityFindings(assessment)
  const cervFindings = getCervHighSpecificityFindings(assessment)

  let text = `Your tinnitus has two active driver pathways of roughly equal significance: jaw and cervical. The ${jawFindings} and ${cervFindings} indicate that both the trigeminal pathway and the upper cervical afferent pathway are generating abnormal input simultaneously. This is the most common profile among members who complete the full assessment. It means more work in Phase 3, but also the most complete treatment of what is actually driving your tinnitus.`

  if (edgeCaseFlags.asymmetryPattern !== 'NO_ASYMMETRY') {
    // 'structural' and 'single-finding' extend Doc 8's [consistent/contralateral/mixed]
    // enumeration to cover all 5 Doc 13 AsymmetryPattern values — per ERRATA content-gaps
    const patternLabel = edgeCaseFlags.contralateralPattern ? 'contralateral'
      : edgeCaseFlags.asymmetryPattern === 'UNILATERAL_COHERENT' ? 'consistent ipsilateral'
      : edgeCaseFlags.asymmetryPattern === 'STRUCTURAL_ASYMMETRY' ? 'structural'
      : edgeCaseFlags.asymmetryPattern === 'MIXED_ASYMMETRY' ? 'mixed'
      : 'single-finding'

    const patternSummary = edgeCaseFlags.asymmetryPattern === 'UNILATERAL_COHERENT'
      ? 'multiple findings on the same side with tinnitus matching that lateralisation'
      : edgeCaseFlags.asymmetryPattern === 'STRUCTURAL_ASYMMETRY'
      ? 'multiple findings on the same side without a clearly matching tinnitus lateralisation'
      : edgeCaseFlags.asymmetryPattern === 'MIXED_ASYMMETRY'
      ? 'findings on both sides without a single consistent pattern'
      : 'one asymmetric finding noted'

    text += ` Your assessment also identified a ${patternLabel} asymmetric pattern, ${patternSummary}, which your protocol addresses through side-specific emphasis throughout.`
  }

  return text
}

// ── Primary with Strong Secondary — Base Paragraph Template ──────────────────
// Doc 8 B.7 Section 3. [primary driver] / [secondary driver] tokens resolved
// by resolvePlaceholders at end of main generator. [primary findings] /
// [secondary findings] resolved inline.

function primaryWithStrongSecondaryTemplate(ctx: ParagraphContext): string {
  const { assessment } = ctx
  const primaryIsJaw = assessment.profile_type?.startsWith('TMJ') === true
  const primaryFindings = primaryIsJaw
    ? getJawHighSpecificityFindings(assessment)
    : getCervHighSpecificityFindings(assessment)
  const secondaryFindings = primaryIsJaw
    ? getCervHighSpecificityFindings(assessment)
    : getJawHighSpecificityFindings(assessment)

  return `Your tinnitus is primarily driven through the [primary driver] pathway, with substantial [secondary driver] involvement alongside it. The ${primaryFindings} are the dominant picture, but the ${secondaryFindings} are significant enough that addressing only the primary driver would leave meaningful input untreated. Your Phase 3 work runs both protocols, with the [primary driver] protocol taking priority in terms of daily time and emphasis.`
}

// ── Primary with Secondary — Base Paragraph Template ─────────────────────────
// Doc 8 B.7 Section 3.

function primaryWithSecondaryTemplate(ctx: ParagraphContext): string {
  const { assessment } = ctx
  const primaryIsJaw = assessment.profile_type?.startsWith('TMJ') === true
  const primaryFindings = primaryIsJaw
    ? getJawHighSpecificityFindings(assessment)
    : getCervHighSpecificityFindings(assessment)

  return `Your tinnitus is primarily driven through the [primary driver] pathway, with mild [secondary driver] involvement present. The ${primaryFindings} are the clear dominant picture. The secondary involvement is real (above the threshold for inclusion), but your daily protocol emphasis sits firmly with the [primary driver] work.`
}

// ── Contextual flag modifiers — jaw-side ─────────────────────────────────────

// Doc 8 B.7 Section 3 — jaw injury flag modification
function jawInjuryModifier(): string {
  return 'Your history of jaw injury is significant context for this profile; post-traumatic changes to the joint and surrounding musculature are a well-documented source of the kind of ongoing abnormal input your assessment has identified. The Phase 3 jaw distraction and release work is particularly relevant for post-traumatic cases.'
}

// Doc 8 B.7 Section 3 — orthodontic flag modification
function orthodonticModifier(): string {
  return 'Your orthodontic history is worth noting as contributing context; changes to bite mechanics can produce lasting alterations in how the jaw loads and moves.'
}

// Doc 8 B.2 Module 1 contextual flag — B.7 equivalent not explicit; using B.2 text
function dentalExtractionsModifier(): string {
  return 'Your history of posterior dental extractions is relevant context; loss of posterior teeth, particularly wisdom teeth, can alter jaw mechanics and loading patterns over time, and is worth noting as part of your profile.'
}

// Doc 8 B.2 Module 1 contextual flag — B.7 equivalent not explicit; using B.2 text
function jawSurgeryModifier(): string {
  return 'Your history of jaw surgery is relevant context; post-surgical changes to joint mechanics can produce lasting alterations in how the jaw loads and moves.'
}

// ── Contextual flag modifiers — cervical-side ────────────────────────────────

// Doc 8 B.7 Section 3 — whiplash flag modification
function whiplashModifier(): string {
  return 'Your history of whiplash is significant context; whiplash-type injuries can produce lasting upper cervical joint and muscle changes that generate ongoing abnormal input long after the acute injury has resolved. Your protocol addresses this directly.'
}

// Doc 8 B.3 Module 2 contextual flag — B.7 equivalent not explicit; using B.3 text
function sedentaryOccupationModifier(): string {
  return 'Your occupation involves sustained postures that place continuous load on the cervical spine. Addressing this daily load through workstation changes and movement habits (covered in Phases 2 and 4) is an important part of making the protocol work durable rather than temporary.'
}

// Doc 8 B.3 Module 2 contextual flag — B.7 equivalent not explicit; using B.3 text
function oneSidedSportModifier(): string {
  return "Your history of one-sided sport or asymmetric activity is worth factoring in; repetitive single-side loading can reinforce cervical tension on the dominant side. This is addressed alongside your protocol work in Phase 4's postural correction section."
}

// ── Nervous system modifiers ─────────────────────────────────────────────────

// Doc 8 B.7 Section 4 — for members with three or more nervous system flags
function highNervousSystemModifier(): string {
  return 'Your assessment identified significant nervous system involvement. We recommend engaging with the Phase 4 breath work protocol before or alongside the start of Phase 3; 10 minutes daily, and it directly reduces the sympathetic amplification layer that is contributing to your experience.'
}

// No explicit Doc 8 B.7 text for 1–2 flags — proposed mild modifier (reviewer approved pre-work)
function mildNervousSystemModifier(): string {
  return 'Your assessment identified some nervous system involvement; not enough to indicate the full Phase 4 breath work as an immediate priority, but worth keeping in mind as you progress. The Phase 4 breath work is accessible from the start if you find stress or anxiety is amplifying your tinnitus during Phase 3.'
}

// ── Low-confidence wrapper ────────────────────────────────────────────────────
//
// Doc 13 §4.4 step 6: paragraph = lowConfidenceWrapper(lowConfidence, paragraph)
// The low-confidence texts are complete self-contained statements (§3.1 output text).
// The base template + contextual modifiers are discarded — incongruous alongside
// the low-confidence framing. Step 7 (strong-single-finding note) appends after.
// Doc 13 §3.1 output text verbatim.

function lowConfidenceWrapper(flag: LowConfidenceFlag): string {
  if (flag === 'LOW_CONFIDENCE_SYMPTOM_DOMINANT') {
    return 'Your symptom picture suggests somatic involvement; your tinnitus responds to jaw and neck-related triggers and varies in ways consistent with a somatic driver. However, the physical movement and palpation tests in this assessment did not produce strong confirmatory findings. This can happen for a few reasons: body awareness develops with practice, some people do not respond strongly to initial palpation, or the physical findings may be subtler in your case.\n\nThe framework is still worth pursuing. We recommend completing Phase 2 and beginning Phase 3 with a light exploratory protocol covering both modules, while staying attentive to whether the physical work produces noticeable changes. Reassessing after four weeks of protocol work often produces clearer findings as body awareness improves.'
  }
  return 'Your assessment did not produce strong findings in either the jaw or cervical modules. This does not rule out a somatic component; some people find that body awareness and palpation sensitivity develop over time, and a reassessment after a few weeks of protocol work often produces clearer results.\n\nIf you are uncertain whether somatic tinnitus applies to you, Phase 1 of the framework is the right place to start regardless; the mechanism education and self-assessment process itself is valuable. You can retake this assessment at any point from the exercise library.'
}

// ── Strong-single-finding note ────────────────────────────────────────────────
//
// Doc 13 §3.2 output text (verbatim). Bracketed values resolved from findings arrays.
// Text is written for a single finding; multiple findings are joined with ' / '.

function strongSingleFindingNote(findings: SingleStrongMovement): string {
  const nameMap: Record<string, string> = {
    jaw_drift:               'jaw drift',
    M1:                      'M1 response',
    M2:                      'M2 response',
    pterygoid_tenderness:    'pterygoid tenderness',
    M3:                      'M3 response',
    M4:                      'M4 response',
    suboccipital_tenderness: 'suboccipital tenderness',
  }

  const allFindings = [...findings.tmj, ...findings.cerv]
  const findingNames = allFindings.map(f => nameMap[f] ?? f).join(' / ')

  const pathways: string[] = []
  if (findings.tmj.length > 0) pathways.push('trigeminal pathway')
  if (findings.cerv.length > 0) pathways.push('upper cervical pathway')
  const pathwayText = pathways.join(' / ')

  return `One finding worth highlighting: ${findingNames} is a high-specificity indicator; it points directly at ${pathwayText} involvement. Even within your overall score, this finding is meaningful and is reflected in your protocol assignment.`
}
