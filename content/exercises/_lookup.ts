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
import d14JawSymmetryRetraining from './d14-jaw-symmetry-retraining'
import d15ProgressiveResistance from './d15-progressive-resistance'
import d17CondylarRepositioning from './d17-condylar-repositioning'
import e5SuboccipitalTennisBall from './e5-suboccipital-tennis-ball'
import e6ScmStretching from './e6-scm-stretching'
import e7LevatorScapulaeStretching from './e7-levator-scapulae-stretching'
import e8UpperTrapScaleneRelease from './e8-upper-trap-scalene-release'
import e11ChinTuckRotation from './e11-chin-tuck-rotation'
import e13DeepCervicalFlexorTraining from './e13-deep-cervical-flexor-training'

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

  // ── TMJ resistance (3) — content in M13p ───────────────────────────────────
  [d14JawSymmetryRetraining.id, d14JawSymmetryRetraining],
  [d15ProgressiveResistance.id, d15ProgressiveResistance],
  [d17CondylarRepositioning.id, d17CondylarRepositioning],

  // ── Cervical release (6) — content in M13s + M13t ──────────────────────────
  // TODO library-wiring: E9 stub remains for future library page (§1.14 — moved to library, structured protocol exit)
  [e5SuboccipitalTennisBall.id, e5SuboccipitalTennisBall],
  [e6ScmStretching.id, e6ScmStretching],
  [e7LevatorScapulaeStretching.id, e7LevatorScapulaeStretching],
  [e8UpperTrapScaleneRelease.id, e8UpperTrapScaleneRelease],
  ['E9_suboccipital_specific_stretching',
    stub('E9_suboccipital_specific_stretching', 'E.9', 'Suboccipital Specific Stretching', 'cervical-release', 3)],
  [e11ChinTuckRotation.id, e11ChinTuckRotation],

  // ── Cervical retraining (3) — content in M13v ──────────────────────────────
  // TODO M13v: replace E14, E15 stubs with real imports
  [e13DeepCervicalFlexorTraining.id, e13DeepCervicalFlexorTraining],
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
