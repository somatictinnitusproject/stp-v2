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

/** Full TMJ release list. 6 exercises post-pre-launch (D.9 auriculotemporal removed §1.13, D.11 hyoid removed §1.7). */
export function buildTmjReleaseList(): string[] {
  return [
    'D4_heat_application',
    'D5_temporalis_release',
    'D6_masseter_release',
    'D7_intraoral_pterygoid_release',
    'D8_lateral_pterygoid_release',
    'D10_tmj_distraction',
  ]
}

/** Full cervical release list. 5 exercises post-pre-launch (E.10 thoracic removed §4.5, E.11 replaced §1.8, E.9 removed §1.14). */
export function buildCervReleaseList(): string[] {
  return [
    'E5_suboccipital_tennis_ball',
    'E6_scm_stretching',
    'E7_levator_scapulae_stretching',
    'E8_upper_trap_scalene_release',
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

// ── Phase 3 orientation reading IDs ──────────────────────────────────────────

/**
 * Returns unacknowledged D.1/D.2/D.3 orientation reading IDs for TMJ members.
 * D.13 is no longer part of the session flow — it lives on /framework/phase-3
 * via ResistancePhaseCard (M13o.1).
 */
export function buildPhase3OrientationState(
  exercisesViewed: Record<string, boolean>,
): { ids: string[] } {
  const all = ['D1_phase3_opening', 'D2_forewarning', 'D3_release_intro']
  return { ids: all.filter((id) => !exercisesViewed[id]) }
}

/** Thin wrapper — returns the ids array directly. */
export function buildPhase3OrientationList(
  exercisesViewed: Record<string, boolean>,
): string[] {
  return buildPhase3OrientationState(exercisesViewed).ids
}

/**
 * TMJ resistance — D.14 and D.15 always included. D.17 conditionally
 * included for members with disc displacement indicators in
 * phase1_assessment: tmj_joint_sounds, tmj_opening_restriction, or
 * jaw_locking. Members without any of these findings skip D.17 in
 * the structured session — it remains accessible via the exercise
 * library.
 *
 * Per pre-launch §1.15 (D.16 removed, library-only) and Doc 8 §D.17
 * conditional inclusion rule.
 */
export function buildTmjResistanceList(phase1: Phase1AssessmentRow): string[] {
  const base = [
    'D14_jaw_symmetry_retraining',
    'D15_progressive_resistance',
  ]
  const includeD17 =
    phase1.tmj_joint_sounds === true ||
    phase1.tmj_opening_restriction === true ||
    phase1.jaw_locking === true
  if (includeD17) {
    base.push('D17_condylar_repositioning')
  }
  return base
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
        ...buildTmjResistanceList(phase1),
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
      exercises = [...exercises, ...buildTmjResistanceList(phase1)]
    }
  }

  // ── Phase 4 opt-in — appended last per P3-15 ──────────────────────────────
  exercises = [...exercises, ...(progress.phase4_exercises_added ?? [])]

  return exercises
}
