import { describe, it, expect } from 'vitest'
import {
  getPrimaryDriver,
  getSecondaryDriver,
  getDominantSide,
  resolvePlaceholders,
} from '../profile-paragraph/placeholders'
import { generateSection1_ProfileTypeStatement } from '../profile-paragraph/section1-statements'
import { generateSection2_FindingsSummary } from '../profile-paragraph/section2-findings'
import { generateProfileParagraph } from '../profile-paragraph'
import type { ParagraphContext } from '../profile-paragraph/types'
import type { Phase1AssessmentRow, UserIntakeRow } from '../types'
import type { EdgeCaseFlags } from '../edge-cases'

// ── Helpers ──────────────────────────────────────────────────────────────────

function blankAssessment(): Phase1AssessmentRow {
  return {
    id: 'test',
    user_id: 'test',
    created_at: '2026-01-01T00:00:00Z',
    completed_at: null,
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
    cerv_floor_relief_test: null,
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

function blankFlags(): EdgeCaseFlags {
  return {
    lowConfidence: null,
    strongSingleFindings: { tmj: [], cerv: [] },
    contralateralPattern: false,
    asymmetryPattern: 'NO_ASYMMETRY',
  }
}

function makeCtx(
  assessmentOverrides: Partial<Phase1AssessmentRow> = {},
  userOverrides: Partial<UserIntakeRow> = {},
  flagsOverrides: Partial<EdgeCaseFlags> = {},
): ParagraphContext {
  return {
    assessment: { ...blankAssessment(), ...assessmentOverrides },
    user: { ...blankUser(), ...userOverrides },
    tmjNorm: 50,
    cervNorm: 10,
    edgeCaseFlags: { ...blankFlags(), ...flagsOverrides },
  }
}

// ── getPrimaryDriver ──────────────────────────────────────────────────────────

describe('getPrimaryDriver', () => {
  it('TMJ_DOMINANT → jaw', () => {
    expect(getPrimaryDriver('TMJ_DOMINANT')).toBe('jaw')
  })
  it('CERV_DOMINANT → cervical', () => {
    expect(getPrimaryDriver('CERV_DOMINANT')).toBe('cervical')
  })
  it('DUAL_DRIVER → jaw (defensive default — §4.2 templates do not use [primary driver])', () => {
    expect(getPrimaryDriver('DUAL_DRIVER')).toBe('jaw')
  })
  it('TMJ_PRIMARY_STRONG_SECONDARY → jaw', () => {
    expect(getPrimaryDriver('TMJ_PRIMARY_STRONG_SECONDARY')).toBe('jaw')
  })
  it('CERV_PRIMARY_STRONG_SECONDARY → cervical', () => {
    expect(getPrimaryDriver('CERV_PRIMARY_STRONG_SECONDARY')).toBe('cervical')
  })
  it('null → jaw (defensive default)', () => {
    expect(getPrimaryDriver(null)).toBe('jaw')
  })
})

// ── getSecondaryDriver ────────────────────────────────────────────────────────

describe('getSecondaryDriver', () => {
  it('TMJ_DOMINANT → cervical', () => {
    expect(getSecondaryDriver('TMJ_DOMINANT')).toBe('cervical')
  })
  it('CERV_DOMINANT → jaw', () => {
    expect(getSecondaryDriver('CERV_DOMINANT')).toBe('jaw')
  })
})

// ── getDominantSide ───────────────────────────────────────────────────────────

describe('getDominantSide', () => {
  it('all four asym fields left → left', () => {
    const a = blankAssessment()
    a.asym_jaw_drift_direction    = 'left'
    a.asym_masseter_dominant_side = 'left'
    a.asym_scm_dominant_side      = 'left'
    a.asym_shoulder_elevated_side = 'left'
    expect(getDominantSide(a)).toBe('left')
  })

  it('3 left, 1 right → left', () => {
    const a = blankAssessment()
    a.asym_jaw_drift_direction    = 'left'
    a.asym_masseter_dominant_side = 'left'
    a.asym_scm_dominant_side      = 'left'
    a.asym_shoulder_elevated_side = 'right'
    expect(getDominantSide(a)).toBe('left')
  })

  it('2 left, 2 right → null (tie)', () => {
    const a = blankAssessment()
    a.asym_jaw_drift_direction    = 'left'
    a.asym_masseter_dominant_side = 'left'
    a.asym_scm_dominant_side      = 'right'
    a.asym_shoulder_elevated_side = 'right'
    expect(getDominantSide(a)).toBe(null)
  })

  it('all null → null', () => {
    expect(getDominantSide(blankAssessment())).toBe(null)
  })
})

// ── resolvePlaceholders ───────────────────────────────────────────────────────

describe('resolvePlaceholders', () => {
  it('[primary driver] with TMJ_DOMINANT → jaw', () => {
    const ctx = makeCtx({ profile_type: 'TMJ_DOMINANT' })
    expect(resolvePlaceholders('[primary driver]', ctx)).toBe('jaw')
  })

  it('[primary driver] with CERV_DOMINANT → cervical', () => {
    const ctx = makeCtx({ profile_type: 'CERV_DOMINANT' })
    expect(resolvePlaceholders('[primary driver]', ctx)).toBe('cervical')
  })

  it('[primary driver] with DUAL_DRIVER → jaw (defensive default)', () => {
    const ctx = makeCtx({ profile_type: 'DUAL_DRIVER' })
    expect(resolvePlaceholders('[primary driver]', ctx)).toBe('jaw')
  })

  it('[secondary driver] with TMJ_DOMINANT → cervical', () => {
    const ctx = makeCtx({ profile_type: 'TMJ_DOMINANT' })
    expect(resolvePlaceholders('[secondary driver]', ctx)).toBe('cervical')
  })

  it('[drift direction] pulls from assessment.tmj_jaw_drift_direction', () => {
    const ctx = makeCtx({ tmj_jaw_drift_direction: 'left' })
    expect(resolvePlaceholders('[drift direction]', ctx)).toBe('left')
  })

  it('[worse ear] pulls from assessment.asym_tinnitus_worse_ear', () => {
    const ctx = makeCtx({ asym_tinnitus_worse_ear: 'right' })
    expect(resolvePlaceholders('[worse ear]', ctx)).toBe('right')
  })

  it('multiple placeholders in one string resolved simultaneously', () => {
    const ctx = makeCtx({
      profile_type: 'TMJ_DOMINANT',
      tmj_jaw_drift_direction: 'left',
      asym_tinnitus_worse_ear: 'right',
    })
    expect(resolvePlaceholders('[primary driver] [drift direction] [worse ear]', ctx))
      .toBe('jaw left right')
  })

  it('string with no placeholders returns unchanged', () => {
    const ctx = makeCtx({ profile_type: 'TMJ_DOMINANT' })
    expect(resolvePlaceholders('no placeholders here', ctx)).toBe('no placeholders here')
  })
})

// ── generateSection1_ProfileTypeStatement ─────────────────────────────────────

describe('generateSection1_ProfileTypeStatement', () => {
  it('TMJ_DOMINANT → contains key jaw phrase', () => {
    expect(generateSection1_ProfileTypeStatement(makeCtx({ profile_type: 'TMJ_DOMINANT' })))
      .toContain('jaw and masticatory system')
  })

  it('CERV_DOMINANT → contains key cervical phrase', () => {
    expect(generateSection1_ProfileTypeStatement(makeCtx({ profile_type: 'CERV_DOMINANT' })))
      .toContain('upper cervical spine')
  })

  it('DUAL_DRIVER → contains dual primary drivers', () => {
    expect(generateSection1_ProfileTypeStatement(makeCtx({ profile_type: 'DUAL_DRIVER' })))
      .toContain('dual primary drivers')
  })

  it('TMJ_PRIMARY_STRONG_SECONDARY → driver names substituted, no bracket tokens remain', () => {
    const result = generateSection1_ProfileTypeStatement(makeCtx({ profile_type: 'TMJ_PRIMARY_STRONG_SECONDARY' }))
    expect(result).toContain('jaw system, with significant secondary cervical')
    expect(result).not.toContain('[')
  })

  it('CERV_PRIMARY_STRONG_SECONDARY → cervical leads', () => {
    expect(generateSection1_ProfileTypeStatement(makeCtx({ profile_type: 'CERV_PRIMARY_STRONG_SECONDARY' })))
      .toContain('cervical system, with significant secondary jaw')
  })

  it('TMJ_PRIMARY_WITH_SECONDARY → mild secondary cervical', () => {
    expect(generateSection1_ProfileTypeStatement(makeCtx({ profile_type: 'TMJ_PRIMARY_WITH_SECONDARY' })))
      .toContain('jaw system, with mild secondary cervical')
  })

  it('CERV_PRIMARY_WITH_SECONDARY → mild secondary jaw', () => {
    expect(generateSection1_ProfileTypeStatement(makeCtx({ profile_type: 'CERV_PRIMARY_WITH_SECONDARY' })))
      .toContain('cervical system, with mild secondary jaw')
  })
})

// ── generateSection2_FindingsSummary ─────────────────────────────────────────

describe('generateSection2_FindingsSummary', () => {
  it('empty assessment and user → returns null', () => {
    expect(generateSection2_FindingsSummary(makeCtx())).toBe(null)
  })

  it('only jaw findings → Jaw findings confirmed, no Cervical findings confirmed', () => {
    const ctx = makeCtx({ tmj_jaw_drift: true, tmj_jaw_drift_direction: 'left' })
    const result = generateSection2_FindingsSummary(ctx)
    expect(result).toContain('Jaw findings confirmed:')
    expect(result).not.toContain('Cervical findings confirmed:')
  })

  it('only cervical findings → Cervical findings confirmed, no Jaw findings confirmed', () => {
    const ctx = makeCtx({}, { m3_score: 4 })
    const result = generateSection2_FindingsSummary(ctx)
    expect(result).toContain('Cervical findings confirmed:')
    expect(result).not.toContain('Jaw findings confirmed:')
  })

  it('maintaining factors only → Maintaining factors confirmed', () => {
    const ctx = makeCtx({ post_shoulder_asymmetry: true, post_elevated_side: 'right' })
    const result = generateSection2_FindingsSummary(ctx)
    expect(result).toContain('Maintaining factors confirmed:')
    expect(result).not.toContain('Jaw findings confirmed:')
  })

  it('NS flags only → Nervous system flags', () => {
    const ctx = makeCtx({ ns_stress_tinnitus_correlation: true })
    const result = generateSection2_FindingsSummary(ctx)
    expect(result).toContain('Nervous system flags:')
    expect(result).not.toContain('Jaw findings confirmed:')
  })

  it('multiple categories → all headings present, blocks separated by double newline', () => {
    const ctx = makeCtx(
      { tmj_jaw_drift: true, tmj_jaw_drift_direction: 'right', ns_hypervigilance: true },
      { m3_score: 4 },
    )
    const result = generateSection2_FindingsSummary(ctx)!
    expect(result).toContain('Jaw findings confirmed:')
    expect(result).toContain('Cervical findings confirmed:')
    expect(result).toContain('Nervous system flags:')
    expect(result).toContain('\n\n')
  })

  it('cerv_suboccipital_asymmetric=true → includes dominant side suffix', () => {
    const ctx = makeCtx({
      cerv_suboccipital_tenderness: true,
      cerv_suboccipital_asymmetric: true,
      cerv_suboccipital_tender_side: 'left',
    })
    expect(generateSection2_FindingsSummary(ctx)).toContain('— asymmetric, dominant side: left')
  })

  it('cerv_suboccipital_asymmetric=false → no dominant side suffix', () => {
    const ctx = makeCtx({
      cerv_suboccipital_tenderness: true,
      cerv_suboccipital_asymmetric: false,
    })
    const result = generateSection2_FindingsSummary(ctx)!
    expect(result).toContain('Suboccipital tenderness reproduced')
    expect(result).not.toContain('asymmetric')
  })

  it('m4_score>0, m4_asymmetric=true → asymmetric between sides', () => {
    const ctx = makeCtx({}, { m4_score: 3, m4_asymmetric: true })
    expect(generateSection2_FindingsSummary(ctx)).toContain('asymmetric between sides')
  })

  it('m4_score>0, m4_asymmetric=false → no asymmetric qualifier', () => {
    const ctx = makeCtx({}, { m4_score: 3, m4_asymmetric: false })
    const result = generateSection2_FindingsSummary(ctx)!
    expect(result).toContain('Head rotation response positive')
    expect(result).not.toContain('asymmetric between sides')
  })
})

// ── generateProfileParagraph (structural) ─────────────────────────────────────

describe('generateProfileParagraph', () => {
  it('TMJ_DOMINANT with no findings → contains section 1 phrase and all four stub strings', () => {
    const ctx = makeCtx({ profile_type: 'TMJ_DOMINANT' })
    const result = generateProfileParagraph(ctx)
    expect(result).toContain('jaw and masticatory system')
    expect(result).toContain('[SECTION 3 — M5b WILL POPULATE]')
    expect(result).toContain('[SECTION 4 — M5b WILL POPULATE]')
    expect(result).toContain('[SECTION 5 — M5b WILL POPULATE]')
    expect(result).toContain('[SECTION 6 — M5b WILL POPULATE]')
  })

  it('no findings → section 2 absent (no findings confirmed text)', () => {
    const ctx = makeCtx({ profile_type: 'TMJ_DOMINANT' })
    expect(generateProfileParagraph(ctx)).not.toContain('findings confirmed')
  })

  it('with jaw finding → section 2 present in assembled output', () => {
    const ctx = makeCtx({
      profile_type: 'TMJ_DOMINANT',
      tmj_jaw_drift: true,
      tmj_jaw_drift_direction: 'left',
    })
    expect(generateProfileParagraph(ctx)).toContain('Jaw findings confirmed:')
  })

  it('resolvePlaceholders runs on final output — no §4.4 tokens remain unresolved', () => {
    const ctx = makeCtx({
      profile_type: 'TMJ_DOMINANT',
      tmj_jaw_drift_direction: 'left',
      asym_tinnitus_worse_ear: 'right',
    })
    const result = generateProfileParagraph(ctx)
    expect(result).not.toContain('[primary driver]')
    expect(result).not.toContain('[secondary driver]')
    expect(result).not.toContain('[drift direction]')
    expect(result).not.toContain('[worse ear]')
    expect(result).not.toContain('[dominant side]')
  })
})
