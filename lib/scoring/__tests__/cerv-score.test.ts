import { describe, it, expect } from 'vitest'
import { calculateCervRawScore } from '../cerv-score'
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

// ── M3/M4/M5 live Phase 1 tests (E13) ────────────────────────────────────────

describe('calculateCervRawScore — M3/M4/M5 live assessment fields (ERRATA E13)', () => {
  it('cerv_m3_neck_curl = true scores 4 pts', () => {
    const a = blankAssessment()
    a.cerv_m3_neck_curl = true
    expect(calculateCervRawScore(a, blankUser())).toBe(4)
  })

  it('cerv_m4_head_rotation = true scores 4 pts', () => {
    const a = blankAssessment()
    a.cerv_m4_head_rotation = true
    expect(calculateCervRawScore(a, blankUser())).toBe(4)
  })

  it('cerv_m5_chin_tuck = true scores 2 pts', () => {
    const a = blankAssessment()
    a.cerv_m5_chin_tuck = true
    expect(calculateCervRawScore(a, blankUser())).toBe(2)
  })

  it('cerv_m4_asymmetric_side = true contributes 0 pts (flag only — §1.7)', () => {
    const a = blankAssessment()
    a.cerv_m4_asymmetric_side = true
    expect(calculateCervRawScore(a, blankUser())).toBe(0)
  })

  it('all four M3/M4/M4-asym/M5 null → 0 contribution from those fields (§1.11)', () => {
    const a = blankAssessment()
    // cerv_m3_neck_curl, cerv_m4_head_rotation, cerv_m4_asymmetric_side, cerv_m5_chin_tuck all null
    expect(calculateCervRawScore(a, blankUser())).toBe(0)
  })

  it('M3 + M4 + M5 all true → 10 pts (4+4+2)', () => {
    const a = blankAssessment()
    a.cerv_m3_neck_curl = true
    a.cerv_m4_head_rotation = true
    a.cerv_m5_chin_tuck = true
    expect(calculateCervRawScore(a, blankUser())).toBe(10)
  })

  it('user.m3_score > 0 does NOT contribute (intake fallback removed per E13)', () => {
    const a = blankAssessment()
    const u = blankUser()
    u.m3_score = 5
    expect(calculateCervRawScore(a, u)).toBe(0)
  })

  it('user.m4_score > 0 does NOT contribute (intake fallback removed per E13)', () => {
    const a = blankAssessment()
    const u = blankUser()
    u.m4_score = 5
    expect(calculateCervRawScore(a, u)).toBe(0)
  })

  it('user.m5_score > 0 does NOT contribute (intake fallback removed per E13)', () => {
    const a = blankAssessment()
    const u = blankUser()
    u.m5_score = 5
    expect(calculateCervRawScore(a, u)).toBe(0)
  })
})

// ── Full-payload maximum (E13) ────────────────────────────────────────────────

describe('calculateCervRawScore — full payload maximum', () => {
  it('all indicators true → 25 pts (module maximum)', () => {
    const a = blankAssessment()
    a.cerv_m3_neck_curl = true             // 4
    a.cerv_m4_head_rotation = true         // 4
    a.cerv_suboccipital_tenderness = true  // 4
    a.cerv_worse_desk_work = true          // 3
    a.cerv_m5_chin_tuck = true             // 2
    a.cerv_rotation_restriction = true     // 2
    a.cerv_scm_asymmetry = true            // 2 (OR slot)
    a.cerv_forward_head_posture = true     // 2
    a.cerv_neck_pain = true                // 1
    a.cerv_cervicogenic_headaches = true   // 1
    expect(calculateCervRawScore(a, blankUser())).toBe(25)
  })
})
