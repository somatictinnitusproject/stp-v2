import { describe, it, expect } from 'vitest'
import { calculateTmjRawScore, calculateCervRawScore, normaliseTmj, normaliseCerv } from '../index'
import type { Phase1AssessmentRow, UserIntakeRow } from '../index'

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

// ── TMJ score tests ──────────────────────────────────────────────────────────

describe('calculateTmjRawScore', () => {
  it('returns 0 when all inputs are null/false', () => {
    expect(calculateTmjRawScore(blankAssessment(), blankUser())).toBe(0)
  })

  it('returns 30 (maximum) when all indicators are positive', () => {
    const a = blankAssessment()
    a.tmj_jaw_drift = true
    a.tmj_m1_jaw_opening = true
    a.tmj_m2_jaw_protrusion = true
    a.tmj_pterygoid_tenderness = true
    a.tmj_masseter_asymmetry = true
    a.tmj_opening_restriction = true
    a.tmj_worse_after_chewing = true
    a.tmj_daytime_clenching = true
    a.tmj_pain_eating = true

    a.tmj_joint_sounds = true
    a.tmj_morning_soreness = true

    const u = blankUser()

    expect(calculateTmjRawScore(a, u)).toBe(30)
  })

  it('scores only high-specificity indicators: 4+4+4+4+4 = 20', () => {
    const a = blankAssessment()
    a.tmj_jaw_drift = true
    a.tmj_m1_jaw_opening = true
    a.tmj_m2_jaw_protrusion = true
    a.tmj_pterygoid_tenderness = true
    a.tmj_joint_sounds = true

    expect(calculateTmjRawScore(a, blankUser())).toBe(20)
  })

  // Overlapping indicator rule: Phase 1 FALSE overrides positive S1
  it('TMJ overlapping rule: Phase 1 FALSE overrides intake positive (daytime clenching)', () => {
    const a = blankAssessment()
    a.tmj_daytime_clenching = false   // Phase 1 answered: no

    const u = blankUser()
    u.s1_score = 1                    // intake said yes — should be overridden

    expect(calculateTmjRawScore(a, u)).toBe(0)
  })

  // Overlapping indicator rule: NULL → fall back to intake
  it('TMJ overlapping rule: NULL Phase 1 falls back to intake S6 (pain eating)', () => {
    const a = blankAssessment()
    a.tmj_pain_eating = null          // Phase 1 not answered

    const u = blankUser()
    u.s6_score = 1                    // intake positive — should score 1

    expect(calculateTmjRawScore(a, u)).toBe(1)
  })

  // Overlapping indicator rule: Phase 1 TRUE scores directly, no intake needed
  it('TMJ overlapping rule: Phase 1 TRUE scores without intake', () => {
    const a = blankAssessment()
    a.tmj_daytime_clenching = true

    const u = blankUser()
    u.s1_score = null

    expect(calculateTmjRawScore(a, u)).toBe(1)
  })

  // Phase 1 TRUE + intake NEGATIVE = Phase 1 wins (1 pt)
  it('TMJ overlapping rule: Phase 1 TRUE + intake negative = Phase 1 wins', () => {
    const a = blankAssessment()
    a.tmj_daytime_clenching = true

    const u = blankUser()
    u.s1_score = 0

    expect(calculateTmjRawScore(a, u)).toBe(1)
  })

  // Explicit false on a boolean field scores 0, not null-coerced
  it('tmj_jaw_drift = false (not null) contributes 0 pts', () => {
    const a = blankAssessment()
    a.tmj_jaw_drift = false
    expect(calculateTmjRawScore(a, blankUser())).toBe(0)
  })

  // tmj_joint_sounds = true scores 4 pts (E12: source switched from intake user.s5_score)
  it('tmj_joint_sounds = true scores 4 pts (ERRATA E12)', () => {
    const a = blankAssessment()
    a.tmj_joint_sounds = true
    expect(calculateTmjRawScore(a, blankUser())).toBe(4)
  })
})

// ── Cervical score tests ─────────────────────────────────────────────────────

describe('calculateCervRawScore', () => {
  it('returns 0 when all inputs are null/false', () => {
    expect(calculateCervRawScore(blankAssessment(), blankUser())).toBe(0)
  })

  it('returns 25 (maximum) when all indicators are positive', () => {
    const a = blankAssessment()
    a.cerv_m3_neck_curl = true
    a.cerv_m4_head_rotation = true
    a.cerv_m5_chin_tuck = true
    a.cerv_suboccipital_tenderness = true
    a.cerv_worse_desk_work = true
    a.cerv_rotation_restriction = true
    a.cerv_scm_asymmetry = true
    a.cerv_trap_asymmetry = true    // same slot as SCM — still only 2 pts
    a.cerv_forward_head_posture = true
    a.cerv_neck_pain = true
    a.cerv_cervicogenic_headaches = true

    expect(calculateCervRawScore(a, blankUser())).toBe(25)
  })

  // SCM/trap OR logic — both true = 2 pts, not 4
  it('SCM and trap asymmetry: both true = 2 pts (OR, not additive)', () => {
    const a = blankAssessment()
    a.cerv_scm_asymmetry = true
    a.cerv_trap_asymmetry = true
    expect(calculateCervRawScore(a, blankUser())).toBe(2)
  })

  it('SCM only = 2 pts', () => {
    const a = blankAssessment()
    a.cerv_scm_asymmetry = true
    expect(calculateCervRawScore(a, blankUser())).toBe(2)
  })

  it('trap only = 2 pts', () => {
    const a = blankAssessment()
    a.cerv_trap_asymmetry = true
    expect(calculateCervRawScore(a, blankUser())).toBe(2)
  })

  // Overlapping indicator rule — neck pain
  it('Cerv overlapping rule: Phase 1 FALSE overrides intake positive (neck pain)', () => {
    const a = blankAssessment()
    a.cerv_neck_pain = false

    const u = blankUser()
    u.s7_score = 1

    expect(calculateCervRawScore(a, u)).toBe(0)
  })

  it('Cerv overlapping rule: NULL Phase 1 falls back to intake S7 (neck pain)', () => {
    const a = blankAssessment()
    a.cerv_neck_pain = null

    const u = blankUser()
    u.s7_score = 1

    expect(calculateCervRawScore(a, u)).toBe(1)
  })

  it('Cerv overlapping rule: NULL Phase 1 falls back to intake S8 (cervicogenic headaches)', () => {
    const a = blankAssessment()
    a.cerv_cervicogenic_headaches = null

    const u = blankUser()
    u.s8_score = 1

    expect(calculateCervRawScore(a, u)).toBe(1)
  })

  // Combinatorial mid-range: cerv_m3(4) + suboccipital(4) + cerv_m5(2) = 10/25
  it('Cerv combinatorial mid-range: 10/25', () => {
    const a = blankAssessment()
    a.cerv_m3_neck_curl = true              // 4
    a.cerv_suboccipital_tenderness = true   // 4
    a.cerv_m5_chin_tuck = true             // 2

    expect(calculateCervRawScore(a, blankUser())).toBe(10)
  })
})

// ── Normalisation tests ──────────────────────────────────────────────────────

describe('normaliseTmj', () => {
  it('0 raw → 0 normalised', () => {
    expect(normaliseTmj(0)).toBe(0)
  })

  it('30 raw (max) → 100 normalised', () => {
    expect(normaliseTmj(30)).toBe(100)
  })

  it('15 raw → 50 normalised', () => {
    expect(normaliseTmj(15)).toBe(50)
  })

  // Doc 13 §1.5 example: ROUND(normalisedScore, 2) e.g. 66.67
  it('20 raw → 66.67 (2 decimal places per §1.5)', () => {
    expect(normaliseTmj(20)).toBe(66.67)
  })

  it('10 raw → 33.33', () => {
    expect(normaliseTmj(10)).toBe(33.33)
  })

  it('clamps above 100', () => {
    expect(normaliseTmj(99)).toBe(100)
  })
})

describe('normaliseCerv', () => {
  it('0 raw → 0 normalised', () => {
    expect(normaliseCerv(0)).toBe(0)
  })

  it('25 raw (max) → 100 normalised', () => {
    expect(normaliseCerv(25)).toBe(100)
  })

  it('10 raw → 40 normalised', () => {
    expect(normaliseCerv(10)).toBe(40)
  })

  // 1/25 = 4.0 (2 dp per §1.8)
  it('1 raw → 4', () => {
    expect(normaliseCerv(1)).toBe(4)
  })

  it('13 raw → 52', () => {
    expect(normaliseCerv(13)).toBe(52)
  })
})
