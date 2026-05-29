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
// P3-16 (resistance appends both drivers uniformly across all protocol options),
// P3-21 (_WITH_SECONDARY profiles on Option 3 get reduced secondary resistance lists).
// Doc 13 §5.4 is superseded by these errata sections wherever they conflict.
// ─────────────────────────────────────────────────────────────────────────────

import { SCORING_THRESHOLDS } from '@/content/scoring-thresholds'
import type { Phase1AssessmentRow, FrameworkProgressRow } from '@/lib/scoring/types'

// ── List builders — exact exercise IDs per errata P3-2 ───────────────────────

/** Full TMJ release list. 5 exercises post-M13s.0b (D.4 heat moved to
 *  top of session for all release-phase members; D.9 auriculotemporal
 *  removed §1.13; D.11 hyoid removed §1.7). */
export function buildTmjReleaseList(): string[] {
  return [
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

/** Reduced cervical retraining for TMJ_PRIMARY_WITH_SECONDARY on Option 3 resistance phase.
 *  Secondary driver gets 2 of 3 retraining exercises. Else returns empty (not used). */
export function buildReducedCervRetainingList(profileType: string): string[] {
  if (profileType === 'TMJ_PRIMARY_WITH_SECONDARY') {
    return ['E13_deep_cervical_flexor_training', 'E14_cervical_rotation_holds']
  }
  return []
}

/** Reduced TMJ resistance for CERV_PRIMARY_WITH_SECONDARY on Option 3 resistance phase.
 *  Secondary driver gets 2 base exercises; D.17 is excluded from the reduced list. */
export function buildReducedTmjResistanceList(profileType: string): string[] {
  if (profileType === 'CERV_PRIMARY_WITH_SECONDARY') {
    return ['D14_jaw_symmetry_retraining', 'D15_progressive_resistance']
  }
  return []
}

// ── Resistance block ordering ─────────────────────────────────────────────────

/**
 * E13 and D14 are motor control exercises — they activate deep stabilisers
 * before progressive load is introduced. When both cervical retraining and
 * TMJ resistance lists are combined in the same session, pull E13 and D14
 * to the front while preserving the relative order of everything else.
 * Single-driver sessions are unaffected (their lists already start correctly).
 */
const RESISTANCE_MOTOR_CONTROL = [
  'E13_deep_cervical_flexor_training',
  'D14_jaw_symmetry_retraining',
]

function sortResistanceBlock(exercises: string[]): string[] {
  const motorControl = RESISTANCE_MOTOR_CONTROL.filter(id => exercises.includes(id))
  const rest = exercises.filter(id => !RESISTANCE_MOTOR_CONTROL.includes(id))
  return [...motorControl, ...rest]
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
 * options 1, 2, 3 per errata P3-16 — except that Option 3 _WITH_SECONDARY
 * profiles receive a reduced secondary resistance list per P3-21.
 * Sequential (Option 1) single-driver members do NOT pick up the other
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
        ...sortResistanceBlock([
          ...buildCervRetainingList(),
          ...buildTmjResistanceList(phase1),
        ]),
      ]
    }
    exercises = [...exercises, ...(progress.phase4_exercises_added ?? [])]
  } else {
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

    // ── Resistance-phase append per P3-21 ────────────────────────────────────
    // Option 3 _WITH_SECONDARY profiles: full primary + reduced secondary.
    // All others (incl. _STRONG_SECONDARY, DUAL_DRIVER): full both per P3-16.
    if (resistanceStart !== null) {
      if (protocolOption === 3 && profileType === 'TMJ_PRIMARY_WITH_SECONDARY') {
        exercises = [
          ...exercises,
          ...sortResistanceBlock([
            ...buildTmjResistanceList(phase1),
            ...buildReducedCervRetainingList(profileType),
          ]),
        ]
      } else if (protocolOption === 3 && profileType === 'CERV_PRIMARY_WITH_SECONDARY') {
        exercises = [
          ...exercises,
          ...sortResistanceBlock([
            ...buildCervRetainingList(),
            ...buildReducedTmjResistanceList(profileType),
          ]),
        ]
      } else {
        if (cervAssigned && tmjAssigned) {
          exercises = [
            ...exercises,
            ...sortResistanceBlock([
              ...buildCervRetainingList(),
              ...buildTmjResistanceList(phase1),
            ]),
          ]
        } else {
          if (cervAssigned) exercises = [...exercises, ...buildCervRetainingList()]
          if (tmjAssigned) exercises = [...exercises, ...buildTmjResistanceList(phase1)]
        }
      }
    }

    // ── Phase 4 opt-in — appended last per P3-15 ──────────────────────────────
    exercises = [...exercises, ...(progress.phase4_exercises_added ?? [])]
  }

  // M13s.0b: D.4 heat application leads every release-phase session
  // list, regardless of protocol assignment. Optional preamble — does
  // not count toward "X of N" or ~min total per existing optional
  // exercise treatment.
  if (exercises.length > 0 && !exercises.includes('D4_heat_application')) {
    exercises = ['D4_heat_application', ...exercises]
  }

  return exercises
}
