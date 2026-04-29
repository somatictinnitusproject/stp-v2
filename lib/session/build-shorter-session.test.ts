// /lib/session/build-shorter-session.test.ts
// ─────────────────────────────────────────────────────────────────────────────
// Tests for buildShorterSessionExerciseList and getShorterSessionDuration.
// Pure function tests only — no database hits.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest'
import { buildShorterSessionExerciseList, getShorterSessionDuration } from './build-shorter-session'
import type { Phase1AssessmentRow, FrameworkProgressRow } from '@/lib/scoring/types'

// ── Fixture builders ──────────────────────────────────────────────────────────

function makePhase1(overrides: Partial<Phase1AssessmentRow> = {}): Phase1AssessmentRow {
  return {
    id: 'test-phase1-id',
    user_id: 'test-user-id',
    created_at: '2026-01-01T00:00:00Z',
    completed_at: '2026-01-02T00:00:00Z',
    profile_type: 'DUAL_DRIVER',
    tmj_protocol_assigned: true,
    cerv_protocol_assigned: true,
    tmj_normalised_score: 43,
    cerv_normalised_score: 44,
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

// ── buildShorterSessionExerciseList ──────────────────────────────────────────

describe('buildShorterSessionExerciseList', () => {
  it('TMJ-only returns [D6, D7]', () => {
    const phase1 = makePhase1({ tmj_protocol_assigned: true, cerv_protocol_assigned: false, profile_type: 'TMJ_ONLY' })
    const result = buildShorterSessionExerciseList(makeProgress(), phase1)
    expect(result).toEqual(['D6_masseter_release', 'D7_intraoral_pterygoid_release'])
  })

  it('Cervical-only returns [E5, E6, E7]', () => {
    const phase1 = makePhase1({ tmj_protocol_assigned: false, cerv_protocol_assigned: true, profile_type: 'CERV_ONLY' })
    const result = buildShorterSessionExerciseList(makeProgress(), phase1)
    expect(result).toEqual(['E5_suboccipital_tennis_ball', 'E6_scm_stretching', 'E7_levator_scapulae_stretching'])
  })

  it('Dual-driver (both true) returns [D6, E5]', () => {
    const phase1 = makePhase1({ tmj_protocol_assigned: true, cerv_protocol_assigned: true, profile_type: 'DUAL_DRIVER' })
    const result = buildShorterSessionExerciseList(makeProgress(), phase1)
    expect(result).toEqual(['D6_masseter_release', 'E5_suboccipital_tennis_ball'])
  })

  it('Both false (defensive) returns []', () => {
    const phase1 = makePhase1({ tmj_protocol_assigned: false, cerv_protocol_assigned: false })
    const result = buildShorterSessionExerciseList(makeProgress(), phase1)
    expect(result).toEqual([])
  })

  it('Resistance phase active — shorter list is still release-only (no resistance exercises)', () => {
    const phase1 = makePhase1({ tmj_protocol_assigned: true, cerv_protocol_assigned: false })
    const progress = makeProgress({ resistance_phase_start: '2026-04-01T00:00:00Z' })
    const result = buildShorterSessionExerciseList(progress, phase1)
    // Should still be TMJ-only short list — no resistance exercises appended
    expect(result).toEqual(['D6_masseter_release', 'D7_intraoral_pterygoid_release'])
  })

  it('Phase 4 exercises_added are not appended to shorter list', () => {
    const phase1 = makePhase1({ tmj_protocol_assigned: true, cerv_protocol_assigned: true })
    const progress = makeProgress({ phase4_exercises_added: ['D14_chin_tucks', 'D15_neck_flexion'] })
    const result = buildShorterSessionExerciseList(progress, phase1)
    expect(result).toEqual(['D6_masseter_release', 'E5_suboccipital_tennis_ball'])
  })
})

// ── getShorterSessionDuration ─────────────────────────────────────────────────

describe('getShorterSessionDuration', () => {
  it('E5_suboccipital_tennis_ball returns 5 (overrides full-session 10)', () => {
    expect(getShorterSessionDuration('E5_suboccipital_tennis_ball', 10)).toBe(5)
  })

  it('D6_masseter_release returns its default (no override)', () => {
    expect(getShorterSessionDuration('D6_masseter_release', 5)).toBe(5)
  })

  it('D7_intraoral_pterygoid_release returns its default', () => {
    expect(getShorterSessionDuration('D7_intraoral_pterygoid_release', 2)).toBe(2)
  })

  it('E6_scm_stretching returns its default', () => {
    expect(getShorterSessionDuration('E6_scm_stretching', 4)).toBe(4)
  })

  it('Any unknown ID returns the provided default', () => {
    expect(getShorterSessionDuration('SOME_FUTURE_EXERCISE', 8)).toBe(8)
  })
})
