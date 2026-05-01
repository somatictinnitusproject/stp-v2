import { describe, it, expect } from 'vitest'
import {
  checkLowConfidenceEdgeCase,
  checkSingleStrongMovement,
  checkContralateralPattern,
  classifyAsymmetryPattern,
  runAllEdgeCaseChecks,
} from '../edge-cases'
import type { Phase1AssessmentRow, UserIntakeRow } from '../types'

// ── Helpers ──────────────────────────────────────────────────────────────────

function blankAssessment(): Phase1AssessmentRow {
  return {
    id: 'test',
    user_id: 'test',
    created_at: '2026-01-01T00:00:00Z',
    completed_at: null,
    tmj_m1_jaw_opening: null,
    tmj_m2_jaw_protrusion: null,
    jaw_clicking: null,
    jaw_locking: null,
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
    tmj_normalised_score: null,
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
    cerv_normalised_score: null,
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
    profile_type: null,
    tmj_protocol_assigned: null,
    cerv_protocol_assigned: null,
    profile_paragraph: null,
  }
}

function blankUser(): UserIntakeRow {
  return {
    m1_score: null,
    m2_score: null,
    m3_score: null,
    m4_score: null,
    m4_asymmetric: null,
    m5_score: null,
    s1_score: null,
    s2_score: null,
    s5_score: null,
    s6_score: null,
    s7_score: null,
    s8_score: null,
    symptom_score: null,
  }
}

// ── checkLowConfidenceEdgeCase ────────────────────────────────────────────────

describe('checkLowConfidenceEdgeCase', () => {
  it('sub-case A: tmjNorm=15, cervNorm=12, symptom_score=8 → LOW_CONFIDENCE_SYMPTOM_DOMINANT', () => {
    const u = blankUser(); u.symptom_score = 8
    expect(checkLowConfidenceEdgeCase(15, 12, u)).toBe('LOW_CONFIDENCE_SYMPTOM_DOMINANT')
  })

  it('sub-case A boundary: symptom_score=6 (= threshold) → LOW_CONFIDENCE_SYMPTOM_DOMINANT', () => {
    const u = blankUser(); u.symptom_score = 6
    expect(checkLowConfidenceEdgeCase(15, 12, u)).toBe('LOW_CONFIDENCE_SYMPTOM_DOMINANT')
  })

  it('sub-case A just-below: symptom_score=5 → LOW_CONFIDENCE_LOW_ALL', () => {
    const u = blankUser(); u.symptom_score = 5
    expect(checkLowConfidenceEdgeCase(15, 12, u)).toBe('LOW_CONFIDENCE_LOW_ALL')
  })

  it('sub-case B: tmjNorm=15, cervNorm=12, symptom_score=3 → LOW_CONFIDENCE_LOW_ALL', () => {
    const u = blankUser(); u.symptom_score = 3
    expect(checkLowConfidenceEdgeCase(15, 12, u)).toBe('LOW_CONFIDENCE_LOW_ALL')
  })

  it('sub-case B null: symptom_score=null → LOW_CONFIDENCE_LOW_ALL', () => {
    expect(checkLowConfidenceEdgeCase(15, 12, blankUser())).toBe('LOW_CONFIDENCE_LOW_ALL')
  })

  it('not low-confidence: tmjNorm=25, cervNorm=12 → null (tmj not below 20)', () => {
    expect(checkLowConfidenceEdgeCase(25, 12, blankUser())).toBe(null)
  })

  it('not low-confidence boundary: tmjNorm=20, cervNorm=12 → null (20 is not < 20)', () => {
    expect(checkLowConfidenceEdgeCase(20, 12, blankUser())).toBe(null)
  })

  it('not low-confidence: tmjNorm=15, cervNorm=20 → null (cerv not below 20)', () => {
    expect(checkLowConfidenceEdgeCase(15, 20, blankUser())).toBe(null)
  })
})

// ── checkSingleStrongMovement ─────────────────────────────────────────────────

describe('checkSingleStrongMovement', () => {
  it('jaw_drift=true, tmjNorm=50 → result.tmj contains "jaw_drift"', () => {
    const a = blankAssessment(); a.tmj_jaw_drift = true
    const r = checkSingleStrongMovement(a, blankUser(), 50, 50)
    expect(r.tmj).toContain('jaw_drift')
  })

  it('jaw_drift=true, tmjNorm=60 → result.tmj empty (60 fails strict < 60)', () => {
    const a = blankAssessment(); a.tmj_jaw_drift = true
    const r = checkSingleStrongMovement(a, blankUser(), 60, 50)
    expect(r.tmj).toHaveLength(0)
  })

  it('tmj_m1_jaw_opening=true, tmjNorm=40 → result.tmj contains "M1"', () => {
    const a = blankAssessment(); a.tmj_m1_jaw_opening = true
    const r = checkSingleStrongMovement(a, blankUser(), 40, 50)
    expect(r.tmj).toContain('M1')
  })

  it('pterygoid_tenderness=true, tmjNorm=55 → result.tmj contains "pterygoid_tenderness"', () => {
    const a = blankAssessment(); a.tmj_pterygoid_tenderness = true
    const r = checkSingleStrongMovement(a, blankUser(), 55, 50)
    expect(r.tmj).toContain('pterygoid_tenderness')
  })

  it('all four TMJ indicators firing, tmjNorm=50 → result.tmj length = 4', () => {
    const a = blankAssessment()
    a.tmj_jaw_drift = true
    a.tmj_m1_jaw_opening = true
    a.tmj_m2_jaw_protrusion = true
    a.tmj_pterygoid_tenderness = true
    const r = checkSingleStrongMovement(a, blankUser(), 50, 50)
    expect(r.tmj).toHaveLength(4)
    expect(r.tmj).toEqual(['jaw_drift', 'M1', 'M2', 'pterygoid_tenderness'])
  })

  it('cerv_m3_neck_curl=true, cervNorm=50 → result.cerv contains "M3"', () => {
    const a = blankAssessment(); a.cerv_m3_neck_curl = true
    const r = checkSingleStrongMovement(a, blankUser(), 50, 50)
    expect(r.cerv).toContain('M3')
  })

  it('suboccipital_tenderness=true, cervNorm=55 → result.cerv contains "suboccipital_tenderness"', () => {
    const a = blankAssessment(); a.cerv_suboccipital_tenderness = true
    const r = checkSingleStrongMovement(a, blankUser(), 50, 55)
    expect(r.cerv).toContain('suboccipital_tenderness')
  })

  it('empty case: all null/false, tmjNorm=50, cervNorm=50 → both empty arrays', () => {
    const r = checkSingleStrongMovement(blankAssessment(), blankUser(), 50, 50)
    expect(r.tmj).toHaveLength(0)
    expect(r.cerv).toHaveLength(0)
  })
})

// ── checkContralateralPattern ─────────────────────────────────────────────────

describe('checkContralateralPattern', () => {
  it('jaw_drift=true, direction=left, worse_ear=right → true', () => {
    const a = blankAssessment()
    a.tmj_jaw_drift = true
    a.asym_jaw_drift_direction = 'left'
    a.asym_tinnitus_worse_ear = 'right'
    expect(checkContralateralPattern(a)).toBe(true)
  })

  it('jaw_drift=true, direction=right, worse_ear=left → true', () => {
    const a = blankAssessment()
    a.tmj_jaw_drift = true
    a.asym_jaw_drift_direction = 'right'
    a.asym_tinnitus_worse_ear = 'left'
    expect(checkContralateralPattern(a)).toBe(true)
  })

  it('jaw_drift=true, direction=left, worse_ear=left → false (same side)', () => {
    const a = blankAssessment()
    a.tmj_jaw_drift = true
    a.asym_jaw_drift_direction = 'left'
    a.asym_tinnitus_worse_ear = 'left'
    expect(checkContralateralPattern(a)).toBe(false)
  })

  it('jaw_drift=true, direction=left, worse_ear=bilateral → false', () => {
    const a = blankAssessment()
    a.tmj_jaw_drift = true
    a.asym_jaw_drift_direction = 'left'
    a.asym_tinnitus_worse_ear = 'bilateral'
    expect(checkContralateralPattern(a)).toBe(false)
  })

  it('jaw_drift=true, direction=left, worse_ear=null → false', () => {
    const a = blankAssessment()
    a.tmj_jaw_drift = true
    a.asym_jaw_drift_direction = 'left'
    a.asym_tinnitus_worse_ear = null
    expect(checkContralateralPattern(a)).toBe(false)
  })

  it('jaw_drift=false, direction=left, worse_ear=right → false (no drift to compare)', () => {
    const a = blankAssessment()
    a.tmj_jaw_drift = false
    a.asym_jaw_drift_direction = 'left'
    a.asym_tinnitus_worse_ear = 'right'
    expect(checkContralateralPattern(a)).toBe(false)
  })

  it('jaw_drift=null, direction=left, worse_ear=right → false (null != TRUE)', () => {
    const a = blankAssessment()
    a.tmj_jaw_drift = null
    a.asym_jaw_drift_direction = 'left'
    a.asym_tinnitus_worse_ear = 'right'
    expect(checkContralateralPattern(a)).toBe(false)
  })
})

// ── classifyAsymmetryPattern ──────────────────────────────────────────────────

describe('classifyAsymmetryPattern', () => {
  it('no findings → NO_ASYMMETRY', () => {
    expect(classifyAsymmetryPattern(blankAssessment())).toBe('NO_ASYMMETRY')
  })

  it('one finding only (jaw_drift=left, rest null) → SINGLE_FINDING', () => {
    const a = blankAssessment(); a.asym_jaw_drift_direction = 'left'
    expect(classifyAsymmetryPattern(a)).toBe('SINGLE_FINDING')
  })

  it('two findings same side, tinnitus=left → UNILATERAL_COHERENT', () => {
    const a = blankAssessment()
    a.asym_jaw_drift_direction = 'left'
    a.asym_masseter_dominant_side = 'left'
    a.asym_tinnitus_worse_ear = 'left'
    expect(classifyAsymmetryPattern(a)).toBe('UNILATERAL_COHERENT')
  })

  it('two findings same side, tinnitus=bilateral → STRUCTURAL_ASYMMETRY', () => {
    const a = blankAssessment()
    a.asym_jaw_drift_direction = 'left'
    a.asym_masseter_dominant_side = 'left'
    a.asym_tinnitus_worse_ear = 'bilateral'
    expect(classifyAsymmetryPattern(a)).toBe('STRUCTURAL_ASYMMETRY')
  })

  it('two findings same side, tinnitus=null → STRUCTURAL_ASYMMETRY', () => {
    const a = blankAssessment()
    a.asym_jaw_drift_direction = 'right'
    a.asym_masseter_dominant_side = 'right'
    a.asym_tinnitus_worse_ear = null
    expect(classifyAsymmetryPattern(a)).toBe('STRUCTURAL_ASYMMETRY')
  })

  it('two findings mixed sides (jaw=left, scm=right) → MIXED_ASYMMETRY', () => {
    const a = blankAssessment()
    a.asym_jaw_drift_direction = 'left'
    a.asym_scm_dominant_side = 'right'
    expect(classifyAsymmetryPattern(a)).toBe('MIXED_ASYMMETRY')
  })

  it('three findings mixed → MIXED_ASYMMETRY', () => {
    const a = blankAssessment()
    a.asym_jaw_drift_direction = 'left'
    a.asym_masseter_dominant_side = 'left'
    a.asym_scm_dominant_side = 'right'
    expect(classifyAsymmetryPattern(a)).toBe('MIXED_ASYMMETRY')
  })
})

// ── runAllEdgeCaseChecks ──────────────────────────────────────────────────────

describe('runAllEdgeCaseChecks', () => {
  it('returns proper EdgeCaseFlags shape', () => {
    const flags = runAllEdgeCaseChecks(blankAssessment(), blankUser(), 50, 50)
    expect(flags).toHaveProperty('lowConfidence')
    expect(flags).toHaveProperty('strongSingleFindings')
    expect(flags).toHaveProperty('contralateralPattern')
    expect(flags).toHaveProperty('asymmetryPattern')
  })

  it('low-confidence + asymmetry + contralateral together in one fixture', () => {
    const a = blankAssessment()
    a.tmj_jaw_drift = true
    a.asym_jaw_drift_direction = 'left'
    a.asym_masseter_dominant_side = 'left'
    a.asym_tinnitus_worse_ear = 'right'
    const u = blankUser(); u.symptom_score = 8

    const flags = runAllEdgeCaseChecks(a, u, 10, 10)
    expect(flags.lowConfidence).toBe('LOW_CONFIDENCE_SYMPTOM_DOMINANT')
    expect(flags.contralateralPattern).toBe(true)
    expect(flags.asymmetryPattern).toBe('UNILATERAL_COHERENT')
  })

  it('pure single-driver fixture (no edge cases fire) → all nulls/empty', () => {
    const flags = runAllEdgeCaseChecks(blankAssessment(), blankUser(), 75, 10)
    expect(flags.lowConfidence).toBe(null)
    expect(flags.strongSingleFindings.tmj).toHaveLength(0)
    expect(flags.strongSingleFindings.cerv).toHaveLength(0)
    expect(flags.contralateralPattern).toBe(false)
    expect(flags.asymmetryPattern).toBe('NO_ASYMMETRY')
  })
})
