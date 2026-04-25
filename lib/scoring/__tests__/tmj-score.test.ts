import { describe, it, expect } from 'vitest'
import { calculateTmjRawScore } from '../tmj-score'
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

// ── M1/M2 live Phase 1 tests (D1/D2 — ERRATA E9) ────────────────────────────

describe('calculateTmjRawScore — M1/M2 live assessment fields', () => {
  it('tmj_m1_jaw_opening = true scores 4 pts', () => {
    const a = blankAssessment()
    a.tmj_m1_jaw_opening = true
    expect(calculateTmjRawScore(a, blankUser())).toBe(4)
  })

  it('tmj_m2_jaw_protrusion = true scores 4 pts', () => {
    const a = blankAssessment()
    a.tmj_m2_jaw_protrusion = true
    expect(calculateTmjRawScore(a, blankUser())).toBe(4)
  })

  it('M1 true + M2 false scores 4 pts (M1 only)', () => {
    const a = blankAssessment()
    a.tmj_m1_jaw_opening = true
    a.tmj_m2_jaw_protrusion = false
    expect(calculateTmjRawScore(a, blankUser())).toBe(4)
  })

  it('M1 false + M2 true scores 4 pts (M2 only)', () => {
    const a = blankAssessment()
    a.tmj_m1_jaw_opening = false
    a.tmj_m2_jaw_protrusion = true
    expect(calculateTmjRawScore(a, blankUser())).toBe(4)
  })

  it('M1 true + M2 true scores 8 pts', () => {
    const a = blankAssessment()
    a.tmj_m1_jaw_opening = true
    a.tmj_m2_jaw_protrusion = true
    expect(calculateTmjRawScore(a, blankUser())).toBe(8)
  })

  it('M1 null scores 0 pts (§1.11 — NULL = FALSE)', () => {
    const a = blankAssessment()
    a.tmj_m1_jaw_opening = null
    expect(calculateTmjRawScore(a, blankUser())).toBe(0)
  })

  it('M2 null scores 0 pts (§1.11 — NULL = FALSE)', () => {
    const a = blankAssessment()
    a.tmj_m2_jaw_protrusion = null
    expect(calculateTmjRawScore(a, blankUser())).toBe(0)
  })

  // D2 — intake m1_score/m2_score no longer contribute to TMJ score
  it('user.m1_score > 0 does NOT contribute (intake fallback removed per D2)', () => {
    const a = blankAssessment()
    // a.tmj_m1_jaw_opening stays null
    const u = blankUser()
    u.m1_score = 5
    expect(calculateTmjRawScore(a, u)).toBe(0)
  })

  it('user.m2_score > 0 does NOT contribute (intake fallback removed per D2)', () => {
    const a = blankAssessment()
    // a.tmj_m2_jaw_protrusion stays null
    const u = blankUser()
    u.m2_score = 5
    expect(calculateTmjRawScore(a, u)).toBe(0)
  })
})

// ── S5/S2 live Phase 1 tests (ERRATA E12) ────────────────────────────────────

describe('calculateTmjRawScore — S5/S2 live assessment fields (ERRATA E12)', () => {
  it('tmj_joint_sounds = true scores 4 pts', () => {
    const a = blankAssessment()
    a.tmj_joint_sounds = true
    expect(calculateTmjRawScore(a, blankUser())).toBe(4)
  })

  it('tmj_morning_soreness = true scores 2 pts', () => {
    const a = blankAssessment()
    a.tmj_morning_soreness = true
    expect(calculateTmjRawScore(a, blankUser())).toBe(2)
  })

  it('tmj_joint_sounds = true + tmj_morning_soreness = true scores 6 pts', () => {
    const a = blankAssessment()
    a.tmj_joint_sounds = true
    a.tmj_morning_soreness = true
    expect(calculateTmjRawScore(a, blankUser())).toBe(6)
  })

  it('tmj_joint_sounds = null scores 0 pts (§1.11)', () => {
    const a = blankAssessment()
    // stays null
    expect(calculateTmjRawScore(a, blankUser())).toBe(0)
  })

  it('tmj_morning_soreness = null scores 0 pts (§1.11)', () => {
    const a = blankAssessment()
    // stays null
    expect(calculateTmjRawScore(a, blankUser())).toBe(0)
  })

  it('user.s5_score > 0 does NOT contribute (intake fallback removed per E12)', () => {
    const a = blankAssessment()
    const u = blankUser()
    u.s5_score = 5
    expect(calculateTmjRawScore(a, u)).toBe(0)
  })

  it('user.s2_score > 0 does NOT contribute (intake fallback removed per E12)', () => {
    const a = blankAssessment()
    const u = blankUser()
    u.s2_score = 5
    expect(calculateTmjRawScore(a, u)).toBe(0)
  })
})
