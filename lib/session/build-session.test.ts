// /lib/session/build-session.test.ts
// ─────────────────────────────────────────────────────────────────────────────
// Pure-function unit tests for Phase 3 session list builders.
// No database hits — all fixtures are inline objects.
//
// Coverage: errata P3-2 (ID order), P3-5 (TMJ resistance = 4), P3-12
// (low-confidence runtime), P3-14 (protocol assignment from phase1, not progress),
// P3-15 (Phase 4 opt-in appended last), P3-16 (resistance uniform across options).
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest'
import {
  buildTmjReleaseList,
  buildCervReleaseList,
  buildReducedCervList,
  buildReducedTmjList,
  buildLowConfidenceList,
  buildTmjResistanceList,
  buildCervRetainingList,
  isLowConfidence,
  buildSessionExerciseList,
} from './build-session'
import type { Phase1AssessmentRow, FrameworkProgressRow } from '@/lib/scoring/types'

// ── Fixture builders ──────────────────────────────────────────────────────────

function makePhase1(overrides: Partial<Phase1AssessmentRow> = {}): Phase1AssessmentRow {
  return {
    id: 'test-phase1-id',
    user_id: 'test-user-id',
    created_at: '2026-01-01T00:00:00Z',
    completed_at: '2026-01-02T00:00:00Z',
    // Defaults for DUAL_DRIVER with healthy normalised scores
    profile_type: 'DUAL_DRIVER',
    tmj_protocol_assigned: true,
    cerv_protocol_assigned: true,
    tmj_normalised_score: 43,
    cerv_normalised_score: 44,
    // All other fields null by default
    tmj_m1_jaw_opening: null,
    tmj_m2_jaw_protrusion: null,
    tmj_jaw_drift: null,
    tmj_jaw_drift_direction: null,
    tmj_masseter_asymmetry: null,
    tmj_masseter_dominant_side: null,
    tmj_joint_sounds: null,
    tmj_pterygoid_tenderness: null,
    tmj_pterygoid_tender_side: null,
    tmj_opening_restriction: null,
    tmj_morning_soreness: null,
    tmj_daytime_clenching: null,
    tmj_pain_eating: null,
    tmj_worse_after_chewing: null,
    ctx_orthodontic_history: null,
    ctx_dental_extractions: null,
    ctx_jaw_surgery: null,
    ctx_jaw_injury: null,
    tmj_raw_score: null,
    cerv_m3_neck_curl: null,
    cerv_m4_head_rotation: null,
    cerv_m4_asymmetric_side: null,
    cerv_m5_chin_tuck: null,
    cerv_suboccipital_tenderness: null,
    cerv_suboccipital_asymmetric: null,
    cerv_suboccipital_tender_side: null,
    cerv_scm_asymmetry: null,
    cerv_scm_dominant_side: null,
    cerv_trap_asymmetry: null,
    cerv_trap_dominant_side: null,
    cerv_rotation_restriction: null,
    cerv_restricted_side: null,
    cerv_forward_head_posture: null,
    cerv_neck_pain: null,
    cerv_cervicogenic_headaches: null,
    cerv_worse_desk_work: null,
    ctx_whiplash_history: null,
    ctx_sedentary_occupation: null,
    ctx_one_sided_sport: null,
    cerv_raw_score: null,
    post_shoulder_asymmetry: null,
    post_elevated_side: null,
    post_dominant_chewing_side: null,
    post_sustained_desk_load: null,
    post_asymmetric_exercise: null,
    ns_stress_tinnitus_correlation: null,
    ns_hypervigilance: null,
    ns_sleep_disruption: null,
    ns_anxiety_loop: null,
    asym_jaw_drift_direction: null,
    asym_masseter_dominant_side: null,
    asym_shoulder_elevated_side: null,
    asym_scm_dominant_side: null,
    asym_tinnitus_worse_ear: null,
    asym_contralateral_pattern: null,
    profile_paragraph: null,
    ...overrides,
  } as Phase1AssessmentRow
}

function makeProgress(overrides: Partial<FrameworkProgressRow> = {}): FrameworkProgressRow {
  return {
    user_id: 'test-user-id',
    current_phase: 3,
    current_session: 1,
    protocol_option: 2,
    started_at: '2026-01-01T00:00:00Z',
    phase1_completed_at: '2026-01-02T00:00:00Z',
    phase2_completed_at: '2026-03-01T00:00:00Z',
    phase3_completed_at: null,
    phase4_completed_at: null,
    phase5_completed_at: null,
    resistance_phase_start: null,
    phase2_habits_acknowledged: {},
    phase3_first_accessed: '2026-03-01T00:00:00Z',
    phase4_first_accessed: null,
    phase5_outcome_type: null,
    exercises_viewed: {},
    session_in_progress: null,
    nudges_dismissed: {},
    phase4_exercises_added: [],
    ...overrides,
  } as FrameworkProgressRow
}

// ── Block A — List builder unit tests ─────────────────────────────────────────

describe('buildTmjReleaseList', () => {
  it('returns 6 IDs in exact spec order (D4–D10 minus D.9, D9 auriculotemporal removed per §1.13, D11 hyoid absent per §1.7)', () => {
    expect(buildTmjReleaseList()).toEqual([
      'D4_heat_application',
      'D5_temporalis_release',
      'D6_masseter_release',
      'D7_intraoral_pterygoid_release',
      'D8_lateral_pterygoid_release',
      'D10_tmj_distraction',
    ])
  })
})

describe('buildCervReleaseList', () => {
  it('returns 5 IDs in exact spec order (E9 suboccipital absent per §1.14, E10 thoracic absent per §4.5)', () => {
    expect(buildCervReleaseList()).toEqual([
      'E5_suboccipital_tennis_ball',
      'E6_scm_stretching',
      'E7_levator_scapulae_stretching',
      'E8_upper_trap_scalene_release',
      'E11_chin_tuck_rotation',
    ])
  })
})

describe('buildReducedCervList', () => {
  it('TMJ_PRIMARY_WITH_SECONDARY → 1 ID (suboccipital only)', () => {
    expect(buildReducedCervList('TMJ_PRIMARY_WITH_SECONDARY')).toEqual([
      'E5_suboccipital_tennis_ball',
    ])
  })

  it('TMJ_PRIMARY_STRONG_SECONDARY → 2 IDs (E9 removed §1.14)', () => {
    expect(buildReducedCervList('TMJ_PRIMARY_STRONG_SECONDARY')).toEqual([
      'E5_suboccipital_tennis_ball',
      'E6_scm_stretching',
    ])
  })

  it('unrecognised profile type → empty array', () => {
    expect(buildReducedCervList('TMJ_DOMINANT')).toEqual([])
    expect(buildReducedCervList('DUAL_DRIVER')).toEqual([])
  })
})

describe('buildReducedTmjList', () => {
  it('CERV_PRIMARY_WITH_SECONDARY → 1 ID (masseter only)', () => {
    expect(buildReducedTmjList('CERV_PRIMARY_WITH_SECONDARY')).toEqual([
      'D6_masseter_release',
    ])
  })

  it('CERV_PRIMARY_STRONG_SECONDARY → 2 IDs', () => {
    expect(buildReducedTmjList('CERV_PRIMARY_STRONG_SECONDARY')).toEqual([
      'D6_masseter_release',
      'D7_intraoral_pterygoid_release',
    ])
  })

  it('unrecognised profile type → empty array', () => {
    expect(buildReducedTmjList('CERV_DOMINANT')).toEqual([])
    expect(buildReducedTmjList('DUAL_DRIVER')).toEqual([])
  })
})

describe('buildLowConfidenceList', () => {
  it('returns 2 IDs — one per driver', () => {
    expect(buildLowConfidenceList()).toEqual([
      'D6_masseter_release',
      'E5_suboccipital_tennis_ball',
    ])
  })
})

describe('buildTmjResistanceList', () => {
  it('returns 3 IDs post-pre-launch (D.16 removed §1.15)', () => {
    const list = buildTmjResistanceList()
    expect(list).toHaveLength(3)
    expect(list).toEqual([
      'D14_jaw_symmetry_retraining',
      'D15_progressive_resistance',
      'D17_condylar_repositioning',
    ])
  })
})

describe('buildCervRetainingList', () => {
  it('returns 3 IDs in exact order', () => {
    expect(buildCervRetainingList()).toEqual([
      'E13_deep_cervical_flexor_training',
      'E14_cervical_rotation_holds',
      'E15_cervical_proprioception',
    ])
  })
})

// ── Block B — isLowConfidence tests ───────────────────────────────────────────

describe('isLowConfidence', () => {
  it('both normalised scores < 20 → true', () => {
    const phase1 = makePhase1({ tmj_normalised_score: 17, cerv_normalised_score: 12 })
    expect(isLowConfidence(phase1)).toBe(true)
  })

  it('one score = 20, other < 20 → false (boundary: 20 is not below 20)', () => {
    const phase1 = makePhase1({ tmj_normalised_score: 20, cerv_normalised_score: 12 })
    expect(isLowConfidence(phase1)).toBe(false)
  })

  it('one score < 20, other > 20 → false', () => {
    const phase1 = makePhase1({ tmj_normalised_score: 15, cerv_normalised_score: 44 })
    expect(isLowConfidence(phase1)).toBe(false)
  })

  it('both scores null → treated as 0 via ?? operator → true', () => {
    const phase1 = makePhase1({ tmj_normalised_score: null, cerv_normalised_score: null })
    expect(isLowConfidence(phase1)).toBe(true)
  })
})

// ── Block C — Orchestrator tests ──────────────────────────────────────────────

describe('buildSessionExerciseList', () => {
  // C1 — TMJ_DOMINANT, Option 1, no resistance → 6 IDs (TMJ release only)
  it('C1: TMJ_DOMINANT / Option 1 / no resistance → 6 IDs (TMJ release only)', () => {
    const phase1 = makePhase1({ profile_type: 'TMJ_DOMINANT', tmj_protocol_assigned: true, cerv_protocol_assigned: false })
    const progress = makeProgress({ protocol_option: 1 })
    const result = buildSessionExerciseList(progress, phase1)
    expect(result).toHaveLength(6)
    expect(result).toEqual(buildTmjReleaseList())
  })

  // C2 — TMJ_DOMINANT, Option 1, resistance → 9 IDs (TMJ release + TMJ resistance, no cervical per P3-16)
  it('C2: TMJ_DOMINANT / Option 1 / resistance → 9 IDs (no cervical cross-pickup per P3-16)', () => {
    const phase1 = makePhase1({ profile_type: 'TMJ_DOMINANT', tmj_protocol_assigned: true, cerv_protocol_assigned: false })
    const progress = makeProgress({ protocol_option: 1, resistance_phase_start: '2026-04-01T00:00:00Z' })
    const result = buildSessionExerciseList(progress, phase1)
    expect(result).toHaveLength(9)
    expect(result.slice(0, 6)).toEqual(buildTmjReleaseList())
    expect(result.slice(6, 9)).toEqual(buildTmjResistanceList())
  })

  // C3 — CERV_DOMINANT, Option 1, no resistance → 5 IDs (cervical release only)
  it('C3: CERV_DOMINANT / Option 1 / no resistance → 5 IDs (cervical release only)', () => {
    const phase1 = makePhase1({ profile_type: 'CERV_DOMINANT', tmj_protocol_assigned: false, cerv_protocol_assigned: true })
    const progress = makeProgress({ protocol_option: 1 })
    const result = buildSessionExerciseList(progress, phase1)
    expect(result).toHaveLength(5)
    expect(result).toEqual(buildCervReleaseList())
  })

  // C4 — CERV_DOMINANT, Option 1, resistance → 8 IDs (cervical release + cervical retraining, no TMJ per P3-16)
  it('C4: CERV_DOMINANT / Option 1 / resistance → 8 IDs (no TMJ cross-pickup per P3-16)', () => {
    const phase1 = makePhase1({ profile_type: 'CERV_DOMINANT', tmj_protocol_assigned: false, cerv_protocol_assigned: true })
    const progress = makeProgress({ protocol_option: 1, resistance_phase_start: '2026-04-01T00:00:00Z' })
    const result = buildSessionExerciseList(progress, phase1)
    expect(result).toHaveLength(8)
    expect(result.slice(0, 5)).toEqual(buildCervReleaseList())
    expect(result.slice(5, 8)).toEqual(buildCervRetainingList())
  })

  // C5 — DUAL_DRIVER, Option 2, no resistance → 11 IDs (cervical release + TMJ release)
  it('C5: DUAL_DRIVER / Option 2 / no resistance → 11 IDs', () => {
    const phase1 = makePhase1()  // default DUAL_DRIVER, both assigned
    const progress = makeProgress({ protocol_option: 2 })
    const result = buildSessionExerciseList(progress, phase1)
    expect(result).toHaveLength(11)
    expect(result.slice(0, 5)).toEqual(buildCervReleaseList())
    expect(result.slice(5, 11)).toEqual(buildTmjReleaseList())
  })

  // C6 — DUAL_DRIVER, Option 2, resistance → 17 IDs
  it('C6: DUAL_DRIVER / Option 2 / resistance → 17 IDs', () => {
    const phase1 = makePhase1()
    const progress = makeProgress({ protocol_option: 2, resistance_phase_start: '2026-04-01T00:00:00Z' })
    const result = buildSessionExerciseList(progress, phase1)
    expect(result).toHaveLength(17)
    expect(result.slice(0, 5)).toEqual(buildCervReleaseList())
    expect(result.slice(5, 11)).toEqual(buildTmjReleaseList())
    expect(result.slice(11, 14)).toEqual(buildCervRetainingList())
    expect(result.slice(14, 17)).toEqual(buildTmjResistanceList())
  })

  // C7 — TMJ_PRIMARY_WITH_SECONDARY, Option 3, no resistance → 7 IDs (TMJ release + 1 reduced cervical)
  it('C7: TMJ_PRIMARY_WITH_SECONDARY / Option 3 / no resistance → 7 IDs', () => {
    const phase1 = makePhase1({ profile_type: 'TMJ_PRIMARY_WITH_SECONDARY', tmj_protocol_assigned: true, cerv_protocol_assigned: true })
    const progress = makeProgress({ protocol_option: 3 })
    const result = buildSessionExerciseList(progress, phase1)
    expect(result).toHaveLength(7)
    expect(result.slice(0, 6)).toEqual(buildTmjReleaseList())
    expect(result.slice(6, 7)).toEqual(buildReducedCervList('TMJ_PRIMARY_WITH_SECONDARY'))
  })

  // C8 — TMJ_PRIMARY_WITH_SECONDARY, Option 3, resistance → 13 IDs
  it('C8: TMJ_PRIMARY_WITH_SECONDARY / Option 3 / resistance → 13 IDs', () => {
    const phase1 = makePhase1({ profile_type: 'TMJ_PRIMARY_WITH_SECONDARY', tmj_protocol_assigned: true, cerv_protocol_assigned: true })
    const progress = makeProgress({ protocol_option: 3, resistance_phase_start: '2026-04-01T00:00:00Z' })
    const result = buildSessionExerciseList(progress, phase1)
    expect(result).toHaveLength(13)
    expect(result.slice(0, 6)).toEqual(buildTmjReleaseList())
    expect(result.slice(6, 7)).toEqual(buildReducedCervList('TMJ_PRIMARY_WITH_SECONDARY'))
    expect(result.slice(7, 10)).toEqual(buildCervRetainingList())
    expect(result.slice(10, 13)).toEqual(buildTmjResistanceList())
  })

  // C9 — TMJ_PRIMARY_STRONG_SECONDARY, Option 3, no resistance → 8 IDs
  it('C9: TMJ_PRIMARY_STRONG_SECONDARY / Option 3 / no resistance → 8 IDs', () => {
    const phase1 = makePhase1({ profile_type: 'TMJ_PRIMARY_STRONG_SECONDARY', tmj_protocol_assigned: true, cerv_protocol_assigned: true })
    const progress = makeProgress({ protocol_option: 3 })
    const result = buildSessionExerciseList(progress, phase1)
    expect(result).toHaveLength(8)
    expect(result.slice(0, 6)).toEqual(buildTmjReleaseList())
    expect(result.slice(6, 8)).toEqual(buildReducedCervList('TMJ_PRIMARY_STRONG_SECONDARY'))
  })

  // C10 — CERV_PRIMARY_WITH_SECONDARY, Option 3, no resistance → 6 IDs
  it('C10: CERV_PRIMARY_WITH_SECONDARY / Option 3 / no resistance → 6 IDs', () => {
    const phase1 = makePhase1({ profile_type: 'CERV_PRIMARY_WITH_SECONDARY', tmj_protocol_assigned: true, cerv_protocol_assigned: true })
    const progress = makeProgress({ protocol_option: 3 })
    const result = buildSessionExerciseList(progress, phase1)
    expect(result).toHaveLength(6)
    expect(result.slice(0, 5)).toEqual(buildCervReleaseList())
    expect(result.slice(5, 6)).toEqual(buildReducedTmjList('CERV_PRIMARY_WITH_SECONDARY'))
  })

  // C11 — CERV_PRIMARY_STRONG_SECONDARY, Option 3, no resistance → 7 IDs
  it('C11: CERV_PRIMARY_STRONG_SECONDARY / Option 3 / no resistance → 7 IDs', () => {
    const phase1 = makePhase1({ profile_type: 'CERV_PRIMARY_STRONG_SECONDARY', tmj_protocol_assigned: true, cerv_protocol_assigned: true })
    const progress = makeProgress({ protocol_option: 3 })
    const result = buildSessionExerciseList(progress, phase1)
    expect(result).toHaveLength(7)
    expect(result.slice(0, 5)).toEqual(buildCervReleaseList())
    expect(result.slice(5, 7)).toEqual(buildReducedTmjList('CERV_PRIMARY_STRONG_SECONDARY'))
  })

  // C12 — DUAL_DRIVER, Option 3, no resistance → 11 IDs (same as Option 2)
  it('C12: DUAL_DRIVER / Option 3 / no resistance → 11 IDs (same as Option 2)', () => {
    const phase1 = makePhase1()
    const progress = makeProgress({ protocol_option: 3 })
    const result = buildSessionExerciseList(progress, phase1)
    expect(result).toHaveLength(11)
    expect(result.slice(0, 5)).toEqual(buildCervReleaseList())
    expect(result.slice(5, 11)).toEqual(buildTmjReleaseList())
  })

  // C13 — DUAL_DRIVER, Option 3, resistance → 17 IDs
  it('C13: DUAL_DRIVER / Option 3 / resistance → 17 IDs', () => {
    const phase1 = makePhase1()
    const progress = makeProgress({ protocol_option: 3, resistance_phase_start: '2026-04-01T00:00:00Z' })
    const result = buildSessionExerciseList(progress, phase1)
    expect(result).toHaveLength(17)
  })

  // C14 — Low-confidence (norm 17/12), null protocol_option, no resistance → 2 IDs
  it('C14: low-confidence (norm 17, 12) / null option / no resistance → 2 IDs', () => {
    const phase1 = makePhase1({ tmj_normalised_score: 17, cerv_normalised_score: 12 })
    const progress = makeProgress({ protocol_option: null })
    const result = buildSessionExerciseList(progress, phase1)
    expect(result).toHaveLength(2)
    expect(result).toEqual(buildLowConfidenceList())
  })

  // C15 — Low-confidence, null protocol_option, resistance → 8 IDs (2 + 3 cerv + 3 TMJ)
  it('C15: low-confidence / null option / resistance → 8 IDs (both resistance lists per P3-16)', () => {
    const phase1 = makePhase1({ tmj_normalised_score: 17, cerv_normalised_score: 12 })
    const progress = makeProgress({ protocol_option: null, resistance_phase_start: '2026-04-01T00:00:00Z' })
    const result = buildSessionExerciseList(progress, phase1)
    expect(result).toHaveLength(8)
    expect(result.slice(0, 2)).toEqual(buildLowConfidenceList())
    expect(result.slice(2, 5)).toEqual(buildCervRetainingList())
    expect(result.slice(5, 8)).toEqual(buildTmjResistanceList())
  })

  // C16 — DUAL_DRIVER, Option 2, no resistance, Phase 4 opt-in → 13 IDs
  it('C16: DUAL_DRIVER / Option 2 / no resistance / Phase 4 added → 13 IDs (Phase 4 last)', () => {
    const phase1 = makePhase1()
    const progress = makeProgress({ phase4_exercises_added: ['F5_breath', 'F8_neut'] })
    const result = buildSessionExerciseList(progress, phase1)
    expect(result).toHaveLength(13)
    expect(result.slice(0, 11)).toEqual([...buildCervReleaseList(), ...buildTmjReleaseList()])
    expect(result.slice(11)).toEqual(['F5_breath', 'F8_neut'])
  })

  // C17 — TMJ_DOMINANT, Option 1, resistance, Phase 4 opt-in → 10 IDs
  it('C17: TMJ_DOMINANT / Option 1 / resistance / Phase 4 added → 10 IDs (Phase 4 last)', () => {
    const phase1 = makePhase1({ profile_type: 'TMJ_DOMINANT', tmj_protocol_assigned: true, cerv_protocol_assigned: false })
    const progress = makeProgress({
      protocol_option: 1,
      resistance_phase_start: '2026-04-01T00:00:00Z',
      phase4_exercises_added: ['F5_breath'],
    })
    const result = buildSessionExerciseList(progress, phase1)
    expect(result).toHaveLength(10)
    expect(result.slice(0, 6)).toEqual(buildTmjReleaseList())
    expect(result.slice(6, 9)).toEqual(buildTmjResistanceList())
    expect(result.slice(9)).toEqual(['F5_breath'])
  })
})

// ── Block D — Order verification tests ───────────────────────────────────────

describe('session list ordering', () => {
  it('D1: DUAL_DRIVER Option 2 — cervical release IDs precede TMJ release IDs', () => {
    const result = buildSessionExerciseList(makeProgress({ protocol_option: 2 }), makePhase1())
    const cervIds = buildCervReleaseList()
    const tmjIds = buildTmjReleaseList()
    const firstTmjIndex = result.indexOf(tmjIds[0])
    const lastCervIndex = result.lastIndexOf(cervIds[cervIds.length - 1])
    expect(lastCervIndex).toBeLessThan(firstTmjIndex)
    expect(result.slice(0, cervIds.length)).toEqual(cervIds)
    expect(result.slice(cervIds.length, cervIds.length + tmjIds.length)).toEqual(tmjIds)
  })

  it('D2: DUAL_DRIVER Option 2 with resistance — all resistance IDs come after all release IDs', () => {
    const progress = makeProgress({ protocol_option: 2, resistance_phase_start: '2026-04-01T00:00:00Z' })
    const result = buildSessionExerciseList(progress, makePhase1())
    const releaseCount = buildCervReleaseList().length + buildTmjReleaseList().length  // 11
    const cervRetaining = buildCervRetainingList()
    const tmjResistance = buildTmjResistanceList()
    expect(result.slice(releaseCount, releaseCount + cervRetaining.length)).toEqual(cervRetaining)
    expect(result.slice(releaseCount + cervRetaining.length)).toEqual(tmjResistance)
  })

  it('D3: Phase 4 opt-in IDs always appear at the END of the session list', () => {
    const phase4Ids = ['F5_breath', 'F8_neut']
    const progress = makeProgress({ phase4_exercises_added: phase4Ids })
    const result = buildSessionExerciseList(progress, makePhase1())
    expect(result.slice(-phase4Ids.length)).toEqual(phase4Ids)
  })
})
