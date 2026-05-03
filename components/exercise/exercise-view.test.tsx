// /components/exercise/exercise-view.test.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Tests for filterQualifyingModifiers — the profile modifier filter helper
// exported from exercise-view.tsx.
//
// @testing-library/react is NOT in this codebase (vitest uses node environment).
// Helper-test path: extract and test the pure filter logic in isolation.
//
// Coverage: errata P3-13 silent-omission policy — five Phase 1 flags that
// don't exist on phase1_assessment resolve to undefined at runtime, so
// undefined !== any triggerValue → modifier is silently omitted.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest'
import { filterQualifyingModifiers } from './exercise-view'
import type { ProfileModifier } from '@/content/exercises/_types'
import type { Phase1AssessmentRow } from '@/lib/scoring/types'

// ── Fixture helpers ───────────────────────────────────────────────────────────

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

function makeMod(
  triggerFlag: keyof Phase1AssessmentRow,
  triggerValue: boolean | string,
  title = 'Test modifier',
): ProfileModifier {
  return { triggerFlag, triggerValue, title, content: [] }
}

function makeModValuesIn(
  triggerFlag: keyof Phase1AssessmentRow,
  triggerValuesIn: (boolean | string)[],
  title = 'Test modifier',
): ProfileModifier {
  return { triggerFlag, triggerValuesIn, title, content: [] }
}

// ── filterQualifyingModifiers tests ───────────────────────────────────────────

describe('filterQualifyingModifiers', () => {
  it('includes modifier when triggerFlag strictly equals triggerValue (boolean true)', () => {
    const phase1 = makePhase1({ tmj_morning_soreness: true })
    const mod = makeMod('tmj_morning_soreness', true)
    const result = filterQualifyingModifiers([mod], phase1)
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Test modifier')
  })

  it('omits modifier when flag value does not match triggerValue (false !== true)', () => {
    const phase1 = makePhase1({ tmj_morning_soreness: false })
    const mod = makeMod('tmj_morning_soreness', true)
    expect(filterQualifyingModifiers([mod], phase1)).toHaveLength(0)
  })

  it('omits modifier when flag is null (null !== true) — P3-13 silent omission', () => {
    const phase1 = makePhase1({ tmj_morning_soreness: null })
    const mod = makeMod('tmj_morning_soreness', true)
    expect(filterQualifyingModifiers([mod], phase1)).toHaveLength(0)
  })

  it('omits modifier when flag is undefined (missing DB column) — P3-13 silent omission', () => {
    // Simulate a missing column (like masseter_tenderness) by deleting the field
    // at runtime. TypeScript cast allows the simulation.
    const phase1 = makePhase1({ tmj_morning_soreness: true })
    const phase1WithGap = { ...phase1 } as Record<string, unknown>
    delete phase1WithGap['tmj_morning_soreness']
    const mod = makeMod('tmj_morning_soreness', true)
    expect(
      filterQualifyingModifiers([mod], phase1WithGap as unknown as Phase1AssessmentRow)
    ).toHaveLength(0)
  })

  it('includes modifier when triggerValue is a string and matches exactly', () => {
    const phase1 = makePhase1({ tmj_jaw_drift_direction: 'left' })
    const mod = makeMod('tmj_jaw_drift_direction', 'left')
    const result = filterQualifyingModifiers([mod], phase1)
    expect(result).toHaveLength(1)
  })

  it('omits modifier when string triggerValue does not match (right !== left)', () => {
    const phase1 = makePhase1({ tmj_jaw_drift_direction: 'right' })
    const mod = makeMod('tmj_jaw_drift_direction', 'left')
    expect(filterQualifyingModifiers([mod], phase1)).toHaveLength(0)
  })

  it('returns empty array when modifiers array is empty', () => {
    const phase1 = makePhase1()
    expect(filterQualifyingModifiers([], phase1)).toEqual([])
  })

  it('filters correctly across mixed qualifying and non-qualifying modifiers', () => {
    const phase1 = makePhase1({
      tmj_morning_soreness: true,
      tmj_daytime_clenching: false,
      tmj_jaw_drift_direction: 'left',
    })
    const modifiers: ProfileModifier[] = [
      makeMod('tmj_morning_soreness', true, 'Should include'),
      makeMod('tmj_daytime_clenching', true, 'Should omit — false !== true'),
      makeMod('tmj_jaw_drift_direction', 'left', 'Should include — string match'),
      makeMod('tmj_jaw_drift_direction', 'right', 'Should omit — wrong side'),
    ]
    const result = filterQualifyingModifiers(modifiers, phase1)
    expect(result).toHaveLength(2)
    expect(result.map((m) => m.title)).toEqual([
      'Should include',
      'Should include — string match',
    ])
  })

  // ── triggerValuesIn tests ─────────────────────────────────────────────────

  it('triggerValuesIn: includes modifier when field matches first element', () => {
    const phase1 = makePhase1({ profile_type: 'CERV_DOMINANT' })
    const mod = makeModValuesIn('profile_type', ['CERV_DOMINANT', 'CERV_PRIMARY_WITH_SECONDARY'])
    expect(filterQualifyingModifiers([mod], phase1)).toHaveLength(1)
  })

  it('triggerValuesIn: includes modifier when field matches second element', () => {
    const phase1 = makePhase1({ profile_type: 'CERV_PRIMARY_WITH_SECONDARY' })
    const mod = makeModValuesIn('profile_type', ['CERV_DOMINANT', 'CERV_PRIMARY_WITH_SECONDARY'])
    expect(filterQualifyingModifiers([mod], phase1)).toHaveLength(1)
  })

  it('triggerValuesIn: omits modifier when field value is not in the list', () => {
    const phase1 = makePhase1({ profile_type: 'TMJ_DOMINANT' })
    const mod = makeModValuesIn('profile_type', ['CERV_DOMINANT', 'CERV_PRIMARY_WITH_SECONDARY'])
    expect(filterQualifyingModifiers([mod], phase1)).toHaveLength(0)
  })

  it('triggerValuesIn: omits modifier when field is null', () => {
    const phase1 = makePhase1({ profile_type: null })
    const mod = makeModValuesIn('profile_type', ['CERV_DOMINANT', 'CERV_PRIMARY_WITH_SECONDARY'])
    expect(filterQualifyingModifiers([mod], phase1)).toHaveLength(0)
  })

  it('triggerValuesIn: omits modifier when field is empty string', () => {
    const phase1 = makePhase1({ profile_type: '' })
    const mod = makeModValuesIn('profile_type', ['CERV_DOMINANT', 'CERV_PRIMARY_WITH_SECONDARY'])
    expect(filterQualifyingModifiers([mod], phase1)).toHaveLength(0)
  })

  it('triggerValuesIn: omits modifier when array is empty', () => {
    const phase1 = makePhase1({ profile_type: 'TMJ_DOMINANT' })
    const mod = makeModValuesIn('profile_type', [])
    expect(filterQualifyingModifiers([mod], phase1)).toHaveLength(0)
  })
})
