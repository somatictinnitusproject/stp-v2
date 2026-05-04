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
import e14CervicalRotationHolds from './e14-cervical-rotation-holds'
import e15CervicalProprioception from './e15-cervical-proprioception'

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
  // Derive bodyRegion from category — stubs are TMJ or cervical, never general.
  const bodyRegion: Exercise['bodyRegion'] =
    category === 'jaw-release' ? 'jaw'
    : category === 'cervical-release' ? 'cervical'
    : 'jaw'  // resistance-training stubs default to jaw — overridden if needed
  return {
    kind: 'exercise',
    id,
    sectionRef,
    name,
    category,
    bodyRegion,
    libraryDurationLabel: `~${estimatedMinutes} min`,
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
  [e13DeepCervicalFlexorTraining.id, e13DeepCervicalFlexorTraining],
  [e14CervicalRotationHolds.id, e14CervicalRotationHolds],
  [e15CervicalProprioception.id, e15CervicalProprioception],
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

/**
 * Returns every exercise in the library, in registry order. Used by
 * /exercise-library home page to render the full grid.
 */
export function getAllLibraryExercises(): Exercise[] {
  return Array.from(EXERCISE_MAP.values())
}

/**
 * Returns every exercise belonging to a category route slug. Used by
 * category route pages (/exercise-library/[category]).
 *
 * Returns empty array if the slug doesn't match any known category —
 * the calling page is responsible for rendering the inline 404 / coming-
 * soon state.
 */
export function getExercisesByCategory(slug: string): Exercise[] {
  return Array.from(EXERCISE_MAP.values()).filter(
    (exercise) => exercise.category === slug,
  )
}

/**
 * Maps a category slug to its display name (used on category page
 * headings and breadcrumbs).
 */
export function getCategoryDisplayName(slug: string): string | null {
  switch (slug) {
    case 'jaw-release': return 'Jaw Release'
    case 'cervical-release': return 'Cervical Release'
    case 'resistance-training': return 'Resistance Training'
    case 'postural': return 'Postural'
    case 'nervous-system': return 'Nervous System'
    case 'breathing': return 'Breathing'
    default: return null
  }
}

/**
 * Maps an exercise to its home-page filter pill label. Per ERRATA F1
 * and Doc 12 §7.5, the filter labels are display-only and differ from
 * the route slugs.
 *
 * 'general' bodyRegion exercises return null — they show under "All"
 * only, no body-region pill.
 */
export function getFilterLabel(
  exercise: Exercise,
): 'Jaw and TMJ' | 'Cervical' | null {
  if (exercise.bodyRegion === 'jaw') return 'Jaw and TMJ'
  if (exercise.bodyRegion === 'cervical') return 'Cervical'
  return null
}

/**
 * Returns up to n exercises related to the given one — same category,
 * excluding the exercise itself. Used by individual exercise page
 * "Related exercises" row per Doc 12 §7.7.
 *
 * Order: registry order. No additional ranking applied.
 */
export function getRelatedExercises(exercise: Exercise, n: number): Exercise[] {
  return Array.from(EXERCISE_MAP.values())
    .filter((other) => other.id !== exercise.id && other.category === exercise.category)
    .slice(0, n)
}
