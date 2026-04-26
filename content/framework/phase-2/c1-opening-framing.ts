// C.1 — Opening Framing
// Source: Document 8 Part C, section C.1. All members see this at the start of
// Phase 2. P1 and P3 are personalised at render time using profile_type and
// maintaining-factor columns from phase1_assessment.
//
// KNOWN GAP (E23): Doc 8 Phase 1 maintaining factors output table lists 8 flags;
// only 8 are available in the live schema (4 postural + 4 nervous-system).
// buildConfirmedFlagsList surfaces what the schema supports. The 4 missing flags
// (low screen positioning, stomach sleeping, bag carrying, jaw posture habits)
// are tracked under E23 for pre-launch resolution.

import type { ProfileType } from '@/lib/scoring/classify'

// ── Content type ─────────────────────────────────────────────────────────────

// C.1 — Opening Framing content shape.
// P1 contains a {profileCallback} placeholder — runtime substitution.
// P3 has two variants — flagsConfirmed and noFlags. Selection is runtime.
export type C1OpeningFraming = {
  sectionLabel: string
  sectionTitle: string
  continueLabel: string
  paragraph1Template: string        // contains literal token {profileCallback}
  paragraph2: string
  paragraph3FlagsConfirmed: string  // contains literal token {flagList}
  paragraph3NoFlags: string
  paragraph4: string
}

// ── Content constant ──────────────────────────────────────────────────────────

export const C1_OPENING_FRAMING: C1OpeningFraming = {
  sectionLabel: 'Phase 2 \u2014 Lifestyle Foundations',
  sectionTitle: 'Clearing the Path',
  continueLabel: 'Continue to habits audit',
  paragraph1Template:
    'Your Phase 1 assessment identified your driver profile \u2014 {profileCallback}. ' +
    'Before the targeted protocol work begins, Phase 2 addresses something ' +
    'equally important: the daily patterns that are continuously reloading ' +
    'tension into the same structures your protocol will be working to reduce.',
  paragraph2:
    'Protocol work and unaddressed daily habits work against each other. ' +
    'Someone doing excellent jaw release work while habitually clenching ' +
    'through every desk session is draining tension in the evening and ' +
    'rebuilding it the next morning. Someone running the cervical protocol ' +
    'while sleeping on their stomach every night is doing the same thing in ' +
    'reverse. Phase 2 exists to close that gap before it becomes a problem.',
  paragraph3FlagsConfirmed:
    'Your Phase 1 assessment flagged the following maintaining factors as ' +
    'confirmed for you: {flagList}. These get specific attention in what ' +
    'follows \u2014 Phase 2 content expands on each confirmed flag rather than ' +
    'treating it as a checkbox.',
  paragraph3NoFlags:
    'Your Phase 1 assessment did not identify significant maintaining ' +
    'factors \u2014 Phase 2 still covers the foundational habits, diet, and ' +
    'sleep content that supports Phase 3 work.',
  paragraph4:
    'Work through this at your own pace. There is no time requirement and ' +
    'no minimum duration. Phase 3 unlocks when you have confirmed that the ' +
    'maintaining factors relevant to your profile are genuinely addressed \u2014 ' +
    'not when a timer runs out.',
}

// ── Personalisation helpers ───────────────────────────────────────────────────

// Maps the 7-member ProfileType union (plus null/undefined for low-confidence
// members) to the 5 member-facing callback strings from Doc 8 C.1.
// Spec: Doc 8 Part C section C.1 — "[single jaw driver / single cervical driver /
//   dual primary drivers / primary with strong secondary / primary with secondary]"
// Doc 13 §2.1 lists 7 profile types; the dominant driver is encoded in the
// string. The 5 Doc 8 callbacks collapse the dominant-driver distinction for
// the *_PRIMARY_STRONG_SECONDARY and *_PRIMARY_WITH_SECONDARY pairs.
// null/undefined: low-confidence fallback per Doc 13 §3 — degrades gracefully.
export function mapProfileTypeToCallback(
  profileType: ProfileType | null | undefined
): string {
  switch (profileType) {
    case 'TMJ_DOMINANT':                  return 'single jaw driver'
    case 'CERV_DOMINANT':                 return 'single cervical driver'
    case 'DUAL_DRIVER':                   return 'dual primary drivers'
    case 'TMJ_PRIMARY_STRONG_SECONDARY':  return 'primary with strong secondary'
    case 'CERV_PRIMARY_STRONG_SECONDARY': return 'primary with strong secondary'
    case 'TMJ_PRIMARY_WITH_SECONDARY':    return 'primary with secondary'
    case 'CERV_PRIMARY_WITH_SECONDARY':   return 'primary with secondary'
    default:                              return 'your assessment results'
  }
}

// Subset of phase1_assessment used by C.1 personalisation. Defined locally
// to avoid coupling to the full Phase1AssessmentRow type, which has known
// staleness issues (E17). Keep this minimal — only the columns C.1 reads.
export type C1AssessmentInput = {
  post_shoulder_asymmetry: boolean | null
  post_elevated_side: string | null
  post_sustained_desk_load: boolean | null
  post_asymmetric_exercise: boolean | null
  post_dominant_chewing_side: string | null
  ns_stress_tinnitus_correlation: boolean | null
  ns_hypervigilance: boolean | null
  ns_sleep_disruption: boolean | null
  ns_anxiety_loop: boolean | null
}

// Builds the comma-separated flag list rendered in C.1 paragraph 3 (flags
// confirmed variant). Returns null when zero flags confirmed — callers
// render the no-flags paragraph variant instead.
//
// Verbatim labels per Doc 13 §4.3 generateSection3_PersonalisedParagraph
// output. The 8 maintaining factor outputs available in the live schema:
// 4 postural (post_*) + 4 nervous-system (ns_*).
//
// KNOWN GAP (E23): Doc 8 Phase 1 maintaining factors output table lists
// additional flags (low screen positioning, stomach sleeping, bag carrying,
// jaw posture habits) that have no corresponding columns on phase1_assessment.
// C.1 surfaces what the schema supports; the missing flags are tracked for
// pre-launch resolution.
export function buildConfirmedFlagsList(
  assessment: C1AssessmentInput | null
): string | null {
  if (!assessment) return null

  const flags: string[] = []

  if (assessment.post_shoulder_asymmetry === true && assessment.post_elevated_side) {
    flags.push(
      'Shoulder height asymmetry \u2014 elevated side: ' + assessment.post_elevated_side
    )
  }
  if (assessment.post_sustained_desk_load === true) {
    flags.push('Sustained desk posture load confirmed')
  }
  if (assessment.post_asymmetric_exercise === true) {
    flags.push('Asymmetric exercise or movement patterns confirmed')
  }
  if (
    assessment.post_dominant_chewing_side === 'left' ||
    assessment.post_dominant_chewing_side === 'right'
  ) {
    flags.push('Dominant chewing side: ' + assessment.post_dominant_chewing_side)
  }
  if (assessment.ns_stress_tinnitus_correlation === true) {
    flags.push('Tinnitus clearly tracks stress levels')
  }
  if (assessment.ns_hypervigilance === true) {
    flags.push('Hypervigilance pattern identified')
  }
  if (assessment.ns_sleep_disruption === true) {
    flags.push('Sleep disruption linked to tinnitus')
  }
  if (assessment.ns_anxiety_loop === true) {
    flags.push('Anxiety-tinnitus feedback loop present')
  }

  if (flags.length === 0) return null

  // Joiner: comma-space for first n-1, ", and " before final, matches
  // natural-prose convention. For 1 flag: just the flag. For 2: "A and B".
  // For 3+: "A, B, and C".
  if (flags.length === 1) return flags[0]
  if (flags.length === 2) return flags[0] + ' and ' + flags[1]
  return flags.slice(0, -1).join(', ') + ', and ' + flags[flags.length - 1]
}
