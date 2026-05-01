// /content/exercises/_lookup.ts
// ─────────────────────────────────────────────────────────────────────────────
// Exercise lookup by ID. Used by /session page to map exercise IDs from
// buildSessionExerciseList to full Exercise objects.
//
// Exercise content files (one per ID, e.g. D6_masseter_release.ts) are
// authored in M13m, M13n, M13s, M13t, M13v. Until those sub-steps ship,
// this module returns stub objects so /session renders with real structure
// while content is incomplete. Replace each stub import as M13m–M13v land.
// ─────────────────────────────────────────────────────────────────────────────

import type { Exercise } from './_types'
import d4HeatApplication from './d4-heat-application'
import d5TemporalisRelease from './d5-temporalis-release'
import d6MasseterRelease from './d6-masseter-release'
import d7IntraoralPterygoidRelease from './d7-intraoral-pterygoid-release'
import d8LateralPterygoidRelease from './d8-lateral-pterygoid-release'
import d9AuriculotemporalNerveMob from './d9-auriculotemporal-nerve-mobilisation'
import d10TmjDistraction from './d10-tmj-distraction'

// ── Stub factory ──────────────────────────────────────────────────────────────
// Returns a minimal valid Exercise conforming to the type contract.
// All stubs set timer: null per errata P3-17 (timer deferred post-launch).

function stub(
  id: string,
  sectionRef: string,
  name: string,
  category: Exercise['category'],
  estimatedMinutes: number,
): Exercise {
  return {
    kind: 'exercise',
    id,
    sectionRef,
    name,
    category,
    estimatedMinutes,
    focusLine: `${name} — apply slow, controlled pressure.`,
    fullContent: [
      { type: 'p', text: `${name} instructions will be authored in M13m–M13v.` },
    ],
    condensedSummary: [
      { type: 'p', text: `${name} — follow the technique instructions above.` },
    ],
    videoId: null,
    commonMistakes: null,
    contraindications: null,
    profileModifiers: [],
    shorter_session_eligible: true,
    rotation_slot: null,
    timer: null,
  }
}

// ── Exercise registry ─────────────────────────────────────────────────────────
// All 20 daily-session exercise IDs per /content/exercises/README.md.
// Categories and estimatedMinutes match README notes and Doc 8 content.

const EXERCISE_MAP = new Map<string, Exercise>([
  // ── TMJ release (7) — content in M13m + M13n ───────────────────────────────
  [d4HeatApplication.id, d4HeatApplication],
  [d5TemporalisRelease.id, d5TemporalisRelease],
  [d6MasseterRelease.id, d6MasseterRelease],
  [d7IntraoralPterygoidRelease.id, d7IntraoralPterygoidRelease],
  [d8LateralPterygoidRelease.id, d8LateralPterygoidRelease],
  [d9AuriculotemporalNerveMob.id, d9AuriculotemporalNerveMob],
  [d10TmjDistraction.id, d10TmjDistraction],

  // ── TMJ resistance (4) — content in M13p ───────────────────────────────────
  // TODO M13p: replace D14, D15, D16, D17 stubs with real imports
  ['D14_jaw_symmetry_retraining',
    stub('D14_jaw_symmetry_retraining', 'D.14', 'Jaw Symmetry Retraining', 'resistance-training', 5)],
  ['D15_progressive_resistance',
    stub('D15_progressive_resistance', 'D.15', 'Progressive Resistance Exercises', 'resistance-training', 6)],
  ['D16_eccentric_jaw_control',
    stub('D16_eccentric_jaw_control', 'D.16', 'Eccentric Jaw Control', 'resistance-training', 5)],
  ['D17_condylar_repositioning',
    stub('D17_condylar_repositioning', 'D.17', 'Condylar Repositioning', 'resistance-training', 5)],

  // ── Cervical release (6) — content in M13s + M13t ──────────────────────────
  // TODO M13s: replace E5, E6, E7, E8 stubs with real imports
  // TODO M13t: replace E9, E11 stubs with real imports
  ['E5_suboccipital_tennis_ball',
    stub('E5_suboccipital_tennis_ball', 'E.5', 'Suboccipital Tennis Ball Release', 'cervical-release', 10)],
  ['E6_scm_stretching',
    stub('E6_scm_stretching', 'E.6', 'SCM Stretching', 'cervical-release', 2)],
  ['E7_levator_scapulae_stretching',
    stub('E7_levator_scapulae_stretching', 'E.7', 'Levator Scapulae Stretching', 'cervical-release', 2)],
  ['E8_upper_trap_scalene_release',
    stub('E8_upper_trap_scalene_release', 'E.8', 'Upper Trapezius and Scalene Release', 'cervical-release', 4)],
  ['E9_suboccipital_specific_stretching',
    stub('E9_suboccipital_specific_stretching', 'E.9', 'Suboccipital Specific Stretching', 'cervical-release', 3)],
  ['E11_chin_tuck_rotation',
    stub('E11_chin_tuck_rotation', 'E.11', 'Controlled Chin Tuck with Rotation', 'cervical-release', 2)],

  // ── Cervical retraining (3) — content in M13v ──────────────────────────────
  // TODO M13v: replace E13, E14, E15 stubs with real imports
  ['E13_deep_cervical_flexor_training',
    stub('E13_deep_cervical_flexor_training', 'E.13', 'Deep Cervical Flexor Training', 'resistance-training', 4)],
  ['E14_cervical_rotation_holds',
    stub('E14_cervical_rotation_holds', 'E.14', 'Cervical Rotation Holds', 'resistance-training', 4)],
  ['E15_cervical_proprioception',
    stub('E15_cervical_proprioception', 'E.15', 'Cervical Proprioception Retraining', 'resistance-training', 3)],
])

/**
 * Returns the Exercise object for the given ID.
 * Throws if the ID is unknown — IDs come from buildSessionExerciseList which
 * is type-checked, so an unknown ID indicates a bug in the session builder.
 */
export function getExerciseById(id: string): Exercise {
  const exercise = EXERCISE_MAP.get(id)
  if (!exercise) throw new Error(`Unknown exercise ID: "${id}"`)
  return exercise
}
