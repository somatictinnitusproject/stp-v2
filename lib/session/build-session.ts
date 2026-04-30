// /lib/session/build-session.ts
// ─────────────────────────────────────────────────────────────────────────────
// Phase 3 Session List Construction
//
// Pure functions that take member state and return ordered exercise ID arrays.
// Read by /session page (M13g) and shorter-session feature (M13i, separate file).
//
// Authority: errata P3-2 (exercise IDs match Doc 8 letters), P3-5 (TMJ resistance
// = 4 daily, not 3), P3-12 (low-confidence runtime computation), P3-14 (protocol
// assignment columns on phase1_assessment), P3-15 (Phase 4 explicit opt-in),
// P3-16 (resistance appends both drivers uniformly across all protocol options).
// Doc 13 §5.4 is superseded by these errata sections wherever they conflict.
// ─────────────────────────────────────────────────────────────────────────────

import { SCORING_THRESHOLDS } from '@/content/scoring-thresholds'
import type { Phase1AssessmentRow, FrameworkProgressRow } from '@/lib/scoring/types'

// ── List builders — exact exercise IDs per errata P3-2 ───────────────────────

/** Full TMJ release list. 7 exercises post-pre-launch (D.11 hyoid removed §1.7). */
export function buildTmjReleaseList(): string[] {
  return [
    'D4_heat_application',
    'D5_temporalis_release',
    'D6_masseter_release',
    'D7_intraoral_pterygoid_release',
    'D8_lateral_pterygoid_release',
    'D9_auriculotemporal_nerve_mob',
    'D10_tmj_distraction',
  ]
}

/** Full cervical release list. 6 exercises post-pre-launch (E.10 thoracic removed §4.5, E.11 replaced §1.8). */
export function buildCervReleaseList(): string[] {
  return [
    'E5_suboccipital_tennis_ball',
    'E6_scm_stretching',
    'E7_levator_scapulae_stretching',
    'E8_upper_trap_scalene_release',
    'E9_suboccipital_specific_stretching',
    'E11_chin_tuck_rotation',
  ]
}

/** Reduced cervical for TMJ-primary on Option 3. */
export function buildReducedCervList(profileType: string): string[] {
  if (profileType === 'TMJ_PRIMARY_WITH_SECONDARY') {
    return ['E5_suboccipital_tennis_ball']
  }
  if (profileType === 'TMJ_PRIMARY_STRONG_SECONDARY') {
    return [
      'E5_suboccipital_tennis_ball',
      'E6_scm_stretching',
      'E9_suboccipital_specific_stretching',
    ]
  }
  return []
}

/** Reduced TMJ for cervical-primary on Option 3. */
export function buildReducedTmjList(profileType: string): string[] {
  if (profileType === 'CERV_PRIMARY_WITH_SECONDARY') {
    return ['D6_masseter_release']
  }
  if (profileType === 'CERV_PRIMARY_STRONG_SECONDARY') {
    return ['D6_masseter_release', 'D7_intraoral_pterygoid_release']
  }
  return []
}

/** Low-confidence minimal list — both protocols, one rep each. */
export function buildLowConfidenceList(): string[] {
  return ['D6_masseter_release', 'E5_suboccipital_tennis_ball']
}

// ── Phase 3 orientation gate state ───────────────────────────────────────────

export interface OrientationGateState {
  ids: string[]                          // IDs to include in the session list
  d13Gate: 'absent' | 'gated' | 'open'  // 'absent' = prereqs not met; 'gated' = pre-7-days; 'open' = ready
  d13UnlockDate: Date | null             // set only when d13Gate === 'gated'
}

/**
 * Computes orientation reading IDs and D.13 gate state for a TMJ-assigned member.
 * Pure function — testable via the optional `now` param.
 *
 * D.13 inclusion requires D.1/D.2/D.3 all acknowledged, phase2CompletedAt
 * non-null, 7+ days elapsed, and D.13 not yet acknowledged (§4.3).
 * When the 7-day gate has not elapsed, D.13 is included with gate='gated'
 * so the member can read the content before they can acknowledge it.
 */
export function buildPhase3OrientationState(
  exercisesViewed: Record<string, boolean>,
  phase2CompletedAt: Date | null,
  now: Date = new Date(),
): OrientationGateState {
  const base = ['D1_phase3_opening', 'D2_forewarning', 'D3_release_intro']
    .filter((id) => !exercisesViewed[id])

  if (base.length > 0) {
    return { ids: base, d13Gate: 'absent', d13UnlockDate: null }
  }

  // D.1/D.2/D.3 all acknowledged. Check D.13 conditions.

  if (exercisesViewed['D13_resistance_intro']) {
    return { ids: [], d13Gate: 'absent', d13UnlockDate: null }
  }

  if (phase2CompletedAt === null) {
    return { ids: [], d13Gate: 'absent', d13UnlockDate: null }
  }

  const unlockTimestamp = phase2CompletedAt.getTime() + 7 * 24 * 60 * 60 * 1000

  if (now.getTime() >= unlockTimestamp) {
    return { ids: ['D13_resistance_intro'], d13Gate: 'open', d13UnlockDate: null }
  }

  return {
    ids: ['D13_resistance_intro'],
    d13Gate: 'gated',
    d13UnlockDate: new Date(unlockTimestamp),
  }
}

/**
 * Returns unacknowledged Phase 3 TMJ orientation reading IDs in order.
 * Thin wrapper around buildPhase3OrientationState — kept for call-site
 * backward compatibility. Callers that need D.13 gate state should use
 * buildPhase3OrientationState directly.
 */
export function buildPhase3OrientationList(
  exercisesViewed: Record<string, boolean>,
  phase2CompletedAt: Date | null = null,
  now: Date = new Date(),
): string[] {
  return buildPhase3OrientationState(exercisesViewed, phase2CompletedAt, now).ids
}

/** TMJ resistance — 4 daily exercises per errata P3-5 (Doc 13 §5.5 had 3, was wrong). */
export function buildTmjResistanceList(): string[] {
  return [
    'D14_jaw_symmetry_retraining',
    'D15_progressive_resistance',
    'D16_eccentric_jaw_control',
    'D17_condylar_repositioning',
  ]
}

/** Cervical retraining — 3 daily exercises. */
export function buildCervRetainingList(): string[] {
  return [
    'E13_deep_cervical_flexor_training',
    'E14_cervical_rotation_holds',
    'E15_cervical_proprioception',
  ]
}

// ── Low-confidence runtime detection per errata P3-12 ────────────────────────

/**
 * Per P3-12: low_confidence_flag is NOT a column. It is computed at runtime
 * from normalised scores. Both subtypes (SYMPTOM_DOMINANT vs LOW_ALL) route
 * to buildLowConfidenceList — subtype distinction is irrelevant here.
 */
export function isLowConfidence(phase1: Phase1AssessmentRow): boolean {
  return (
    (phase1.tmj_normalised_score ?? 0) < SCORING_THRESHOLDS.PROTOCOL_ASSIGNMENT_MINIMUM &&
    (phase1.cerv_normalised_score ?? 0) < SCORING_THRESHOLDS.PROTOCOL_ASSIGNMENT_MINIMUM
  )
}

// ── Orchestrator ─────────────────────────────────────────────────────────────

/**
 * Build the full ordered exercise ID list for /session.
 *
 * Reads protocol assignment from phase1_assessment per errata P3-14
 * (NOT from framework_progress as Doc 13 §5.4 instructs).
 *
 * Reads Phase 4 opt-in array from framework_progress.phase4_exercises_added
 * per errata P3-15 (NOT auto-appended on currentPhase = 4 or
 * phase4_first_accessed as Doc 13 §5.4 instructs).
 *
 * Resistance phase appends both drivers' lists uniformly across protocol
 * options 1, 2, 3 per errata P3-16 — only the protocol_assigned booleans
 * gate which lists append. Sequential members do NOT pick up the other
 * driver's release work at resistance.
 */
export function buildSessionExerciseList(
  progress: FrameworkProgressRow,
  phase1: Phase1AssessmentRow,
): string[] {
  // Read protocol assignment from phase1_assessment per P3-14
  const tmjAssigned = phase1.tmj_protocol_assigned
  const cervAssigned = phase1.cerv_protocol_assigned
  const protocolOption = progress.protocol_option
  const resistanceStart = progress.resistance_phase_start
  const profileType = phase1.profile_type

  let exercises: string[] = []

  // ── Low-confidence check — runs BEFORE protocol option branching per P3-12 ──
  if (isLowConfidence(phase1)) {
    exercises = buildLowConfidenceList()
    if (resistanceStart !== null) {
      // Both resistance lists append per P3-16 (low-confidence has both
      // protocols assigned per Doc 13 §3.1)
      exercises = [
        ...exercises,
        ...buildCervRetainingList(),
        ...buildTmjResistanceList(),
      ]
    }
    exercises = [...exercises, ...(progress.phase4_exercises_added ?? [])]
    return exercises
  }

  // ── Release-phase branching — varies by protocol_option ──────────────────
  if (protocolOption === 1) {
    // Sequential — only the assigned driver's release list runs
    if (tmjAssigned) {
      exercises = buildTmjReleaseList()
    } else if (cervAssigned) {
      exercises = buildCervReleaseList()
    }
  } else if (protocolOption === 2) {
    // Parallel — both full protocols, cervical first per Doc 12 §6.6
    exercises = [...buildCervReleaseList(), ...buildTmjReleaseList()]
  } else if (protocolOption === 3) {
    // Prioritised Parallel — full primary + reduced secondary
    if (profileType === 'DUAL_DRIVER') {
      // Dual on Option 3 = same as Option 2
      exercises = [...buildCervReleaseList(), ...buildTmjReleaseList()]
    } else if (profileType?.startsWith('TMJ')) {
      exercises = [...buildTmjReleaseList(), ...buildReducedCervList(profileType)]
    } else if (profileType?.startsWith('CERV')) {
      exercises = [...buildCervReleaseList(), ...buildReducedTmjList(profileType)]
    }
  }

  // ── Resistance-phase append — uniform across all options per P3-16 ────────
  if (resistanceStart !== null) {
    if (cervAssigned) {
      exercises = [...exercises, ...buildCervRetainingList()]
    }
    if (tmjAssigned) {
      exercises = [...exercises, ...buildTmjResistanceList()]
    }
  }

  // ── Phase 4 opt-in — appended last per P3-15 ──────────────────────────────
  exercises = [...exercises, ...(progress.phase4_exercises_added ?? [])]

  return exercises
}
