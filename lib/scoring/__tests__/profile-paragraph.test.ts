import { describe, it, expect } from 'vitest'
import {
  getPrimaryDriver,
  getSecondaryDriver,
  getDominantSide,
  resolvePlaceholders,
} from '../profile-paragraph/placeholders'
import { generateSection1_ProfileTypeStatement } from '../profile-paragraph/section1-statements'
import { generateSection2_FindingsSummary } from '../profile-paragraph/section2-findings'
import { generateSection3_PersonalisedParagraph } from '../profile-paragraph/section3-paragraphs'
import { generateSection4_AsymmetryOutput } from '../profile-paragraph/section4-asymmetry'
import { generateSection5_ProtocolAssignment } from '../profile-paragraph/section5-protocol'
import { generateSection6_SessionStructureChoice } from '../profile-paragraph/section6-structure'
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
    const ctx = makeCtx({ cerv_m3_neck_curl: true })
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
    const ctx = makeCtx({
      tmj_jaw_drift: true,
      tmj_jaw_drift_direction: 'right',
      ns_hypervigilance: true,
      cerv_m3_neck_curl: true,
    })
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

  it('cerv_m4_head_rotation=true, cerv_m4_asymmetric_side=true → asymmetric between sides', () => {
    const ctx = makeCtx({ cerv_m4_head_rotation: true, cerv_m4_asymmetric_side: true })
    expect(generateSection2_FindingsSummary(ctx)).toContain('asymmetric between sides')
  })

  it('cerv_m4_head_rotation=true, cerv_m4_asymmetric_side=false → no asymmetric qualifier', () => {
    const ctx = makeCtx({ cerv_m4_head_rotation: true, cerv_m4_asymmetric_side: false })
    const result = generateSection2_FindingsSummary(ctx)!
    expect(result).toContain('Head rotation response positive')
    expect(result).not.toContain('asymmetric between sides')
  })
})

// ── generateSection3_PersonalisedParagraph — base templates ───────────────────

describe('generateSection3 — base templates', () => {
  it('TMJ_DOMINANT → contains jaw pathway phrase', () => {
    const ctx = makeCtx({ profile_type: 'TMJ_DOMINANT' })
    expect(generateSection3_PersonalisedParagraph(ctx)).toContain('jaw pathway')
  })

  it('CERV_DOMINANT → contains upper cervical pathway phrase', () => {
    const ctx = makeCtx({ profile_type: 'CERV_DOMINANT' }, {}, {})
    expect(generateSection3_PersonalisedParagraph(ctx)).toContain('upper cervical pathway')
  })

  it('DUAL_DRIVER → contains both jaw and cervical pathways phrase', () => {
    const ctx = makeCtx({ profile_type: 'DUAL_DRIVER' })
    expect(generateSection3_PersonalisedParagraph(ctx)).toContain('jaw and cervical')
  })

  it('TMJ_PRIMARY_STRONG_SECONDARY → contains [primary driver] token (resolved later by main generator)', () => {
    const ctx = makeCtx({ profile_type: 'TMJ_PRIMARY_STRONG_SECONDARY' })
    expect(generateSection3_PersonalisedParagraph(ctx)).toContain('[primary driver]')
  })

  it('CERV_PRIMARY_WITH_SECONDARY → contains [secondary driver] token', () => {
    const ctx = makeCtx({ profile_type: 'CERV_PRIMARY_WITH_SECONDARY' })
    expect(generateSection3_PersonalisedParagraph(ctx)).toContain('[secondary driver]')
  })

  it('TMJ_DOMINANT + jaw finding → finding name appears in template', () => {
    const ctx = makeCtx({
      profile_type: 'TMJ_DOMINANT',
      tmj_jaw_drift: true,
      tmj_jaw_drift_direction: 'left',
    })
    expect(generateSection3_PersonalisedParagraph(ctx)).toContain('jaw drift to the left')
  })

  it('TMJ_DOMINANT + morning soreness → includes morning soreness sentence', () => {
    const ctx = makeCtx({ profile_type: 'TMJ_DOMINANT', tmj_morning_soreness: true })
    expect(generateSection3_PersonalisedParagraph(ctx)).toContain('nocturnal clenching')
  })

  it('TMJ_DOMINANT, no soreness flags → no nocturnal clenching sentence', () => {
    const ctx = makeCtx({ profile_type: 'TMJ_DOMINANT' })
    expect(generateSection3_PersonalisedParagraph(ctx)).not.toContain('nocturnal clenching')
  })

  it('TMJ_DOMINANT + daytime clenching → includes daytime clenching sentence', () => {
    const ctx = makeCtx({ profile_type: 'TMJ_DOMINANT', tmj_daytime_clenching: true })
    expect(generateSection3_PersonalisedParagraph(ctx)).toContain('daytime clenching')
  })

  it('TMJ_DOMINANT, cervNorm=0 → no cervical involvement sentence', () => {
    const ctx = { ...makeCtx({ profile_type: 'TMJ_DOMINANT' }), cervNorm: 0 }
    expect(generateSection3_PersonalisedParagraph(ctx)).not.toContain('cervical involvement is present')
  })

  it('TMJ_DOMINANT, cervNorm>0 → includes cervical involvement sentence', () => {
    const ctx = { ...makeCtx({ profile_type: 'TMJ_DOMINANT' }), cervNorm: 15 }
    expect(generateSection3_PersonalisedParagraph(ctx)).toContain('cervical involvement is present')
  })

  it('CERV_DOMINANT + forward head posture → includes forward head posture sentence', () => {
    const ctx = makeCtx({ profile_type: 'CERV_DOMINANT', cerv_forward_head_posture: true })
    expect(generateSection3_PersonalisedParagraph(ctx)).toContain('forward head posture')
  })

  it('DUAL_DRIVER + UNILATERAL_COHERENT → includes asymmetric pattern sentence', () => {
    const ctx = makeCtx(
      { profile_type: 'DUAL_DRIVER' },
      {},
      { asymmetryPattern: 'UNILATERAL_COHERENT' },
    )
    expect(generateSection3_PersonalisedParagraph(ctx)).toContain('consistent ipsilateral')
  })

  it('DUAL_DRIVER + NO_ASYMMETRY → no asymmetric pattern sentence', () => {
    const ctx = makeCtx({ profile_type: 'DUAL_DRIVER' }, {}, { asymmetryPattern: 'NO_ASYMMETRY' })
    expect(generateSection3_PersonalisedParagraph(ctx)).not.toContain('asymmetric pattern')
  })
})

// ── generateSection3 — modifier stacking ──────────────────────────────────────

describe('generateSection3 — modifier stacking', () => {
  it('ctx_jaw_injury=true + TMJ_DOMINANT → jaw injury modifier appended', () => {
    const ctx = makeCtx({ profile_type: 'TMJ_DOMINANT', ctx_jaw_injury: true })
    expect(generateSection3_PersonalisedParagraph(ctx)).toContain('post-traumatic')
  })

  it('ctx_jaw_injury=true + CERV_DOMINANT → jaw injury modifier NOT appended', () => {
    const ctx = makeCtx({ profile_type: 'CERV_DOMINANT', ctx_jaw_injury: true })
    expect(generateSection3_PersonalisedParagraph(ctx)).not.toContain('post-traumatic')
  })

  it('ctx_orthodontic_history=true + TMJ_DOMINANT → orthodontic modifier appended', () => {
    const ctx = makeCtx({ profile_type: 'TMJ_DOMINANT', ctx_orthodontic_history: true })
    expect(generateSection3_PersonalisedParagraph(ctx)).toContain('orthodontic history')
  })

  it('ctx_dental_extractions=true + TMJ_DOMINANT → dental extractions modifier appended', () => {
    const ctx = makeCtx({ profile_type: 'TMJ_DOMINANT', ctx_dental_extractions: true })
    expect(generateSection3_PersonalisedParagraph(ctx)).toContain('posterior teeth')
    expect(generateSection3_PersonalisedParagraph(ctx)).toContain('is worth noting as part of your profile')
  })

  it('ctx_jaw_surgery=true + TMJ_DOMINANT → jaw surgery modifier appended', () => {
    const ctx = makeCtx({ profile_type: 'TMJ_DOMINANT', ctx_jaw_surgery: true })
    expect(generateSection3_PersonalisedParagraph(ctx)).toContain('jaw surgery')
  })

  it('ctx_whiplash_history=true + CERV_DOMINANT → whiplash modifier appended', () => {
    const ctx = makeCtx({ profile_type: 'CERV_DOMINANT', ctx_whiplash_history: true })
    expect(generateSection3_PersonalisedParagraph(ctx)).toContain('whiplash')
  })

  it('ctx_whiplash_history=true + TMJ_DOMINANT → whiplash modifier NOT appended', () => {
    const ctx = makeCtx({ profile_type: 'TMJ_DOMINANT', ctx_whiplash_history: true })
    expect(generateSection3_PersonalisedParagraph(ctx)).not.toContain('whiplash')
  })

  it('ctx_sedentary_occupation=true + CERV_DOMINANT → sedentary modifier appended', () => {
    const ctx = makeCtx({ profile_type: 'CERV_DOMINANT', ctx_sedentary_occupation: true })
    expect(generateSection3_PersonalisedParagraph(ctx)).toContain('sustained postures')
  })

  it('ctx_one_sided_sport=true + CERV_DOMINANT → one-sided sport modifier appended', () => {
    const ctx = makeCtx({ profile_type: 'CERV_DOMINANT', ctx_one_sided_sport: true })
    expect(generateSection3_PersonalisedParagraph(ctx)).toContain('one-sided sport or asymmetric activity')
    expect(generateSection3_PersonalisedParagraph(ctx)).toContain("Phase 4's postural correction section")
  })

  it('DUAL_DRIVER receives both jaw AND cervical modifiers', () => {
    const ctx = makeCtx({
      profile_type: 'DUAL_DRIVER',
      ctx_jaw_injury: true,
      ctx_whiplash_history: true,
    })
    const result = generateSection3_PersonalisedParagraph(ctx)
    expect(result).toContain('post-traumatic')
    expect(result).toContain('whiplash')
  })

  it('3 NS flags → high nervous system modifier', () => {
    const ctx = makeCtx({
      profile_type: 'TMJ_DOMINANT',
      ns_stress_tinnitus_correlation: true,
      ns_hypervigilance: true,
      ns_sleep_disruption: true,
    })
    expect(generateSection3_PersonalisedParagraph(ctx)).toContain('significant nervous system involvement')
  })

  it('1 NS flag → mild nervous system modifier', () => {
    const ctx = makeCtx({ profile_type: 'TMJ_DOMINANT', ns_anxiety_loop: true })
    expect(generateSection3_PersonalisedParagraph(ctx)).toContain('some nervous system involvement')
    expect(generateSection3_PersonalisedParagraph(ctx)).toContain('not enough to indicate the full Phase 4 breath work as an immediate priority')
  })

  it('0 NS flags → neither NS modifier phrase present', () => {
    const ctx = makeCtx({ profile_type: 'TMJ_DOMINANT' })
    const result = generateSection3_PersonalisedParagraph(ctx)
    expect(result).not.toContain('significant nervous system involvement')
    expect(result).not.toContain('some nervous system involvement')
  })

  it('lowConfidence=LOW_CONFIDENCE_SYMPTOM_DOMINANT → low-confidence wrapper text replaces base', () => {
    const ctx = makeCtx(
      { profile_type: 'TMJ_DOMINANT' },
      {},
      { lowConfidence: 'LOW_CONFIDENCE_SYMPTOM_DOMINANT' },
    )
    const result = generateSection3_PersonalisedParagraph(ctx)
    expect(result).toContain('symptom picture suggests somatic involvement')
    expect(result).not.toContain('jaw pathway')
  })

  it('lowConfidence=LOW_CONFIDENCE_LOW_ALL → low-all wrapper text', () => {
    const ctx = makeCtx(
      { profile_type: 'TMJ_DOMINANT' },
      {},
      { lowConfidence: 'LOW_CONFIDENCE_LOW_ALL' },
    )
    expect(generateSection3_PersonalisedParagraph(ctx)).toContain('did not produce strong findings')
  })

  it('strongSingleFindings.tmj=[jaw_drift] → strong-single-finding note appended', () => {
    const ctx = makeCtx(
      { profile_type: 'TMJ_DOMINANT' },
      {},
      { strongSingleFindings: { tmj: ['jaw_drift'], cerv: [] } },
    )
    expect(generateSection3_PersonalisedParagraph(ctx)).toContain('jaw drift is a high-specificity indicator')
  })

  it('strongSingleFindings tmj + cerv → both pathways mentioned', () => {
    const ctx = makeCtx(
      { profile_type: 'DUAL_DRIVER' },
      {},
      { strongSingleFindings: { tmj: ['M1'], cerv: ['M3'] } },
    )
    const result = generateSection3_PersonalisedParagraph(ctx)
    expect(result).toContain('trigeminal pathway')
    expect(result).toContain('upper cervical pathway')
  })

  it('lowConfidence fires AND strongSingleFindings → strong-finding note still appended after wrapper', () => {
    const ctx = makeCtx(
      { profile_type: 'TMJ_DOMINANT' },
      {},
      {
        lowConfidence: 'LOW_CONFIDENCE_SYMPTOM_DOMINANT',
        strongSingleFindings: { tmj: ['pterygoid_tenderness'], cerv: [] },
      },
    )
    const result = generateSection3_PersonalisedParagraph(ctx)
    expect(result).toContain('symptom picture suggests somatic involvement')
    expect(result).toContain('pterygoid tenderness is a high-specificity indicator')
  })
})

// ── generateSection4_AsymmetryOutput ─────────────────────────────────────────

describe('generateSection4_AsymmetryOutput', () => {
  it('NO_ASYMMETRY → did not identify significant asymmetric patterns', () => {
    const ctx = makeCtx({}, {}, { asymmetryPattern: 'NO_ASYMMETRY' })
    expect(generateSection4_AsymmetryOutput(ctx)).toContain('did not identify significant asymmetric patterns')
  })

  it('UNILATERAL_COHERENT → consistent pattern phrase with side', () => {
    const ctx = makeCtx(
      { asym_jaw_drift_direction: 'left', asym_masseter_dominant_side: 'left', asym_tinnitus_worse_ear: 'left' },
      {},
      { asymmetryPattern: 'UNILATERAL_COHERENT' },
    )
    const result = generateSection4_AsymmetryOutput(ctx)
    expect(result).toContain('consistent pattern on your left side')
    expect(result).toContain('asymmetric emphasis to your left side')
  })

  it('STRUCTURAL_ASYMMETRY → structural pattern phrase', () => {
    const ctx = makeCtx(
      { asym_jaw_drift_direction: 'right', asym_masseter_dominant_side: 'right' },
      {},
      { asymmetryPattern: 'STRUCTURAL_ASYMMETRY' },
    )
    expect(generateSection4_AsymmetryOutput(ctx)).toContain('structural pattern on your right side')
    expect(generateSection4_AsymmetryOutput(ctx)).toContain('which limits the confidence of the lateralisation — but the structural findings are real')
  })

  it('MIXED_ASYMMETRY → multiple structures without a single consistent pattern', () => {
    const ctx = makeCtx(
      { asym_jaw_drift_direction: 'left', asym_masseter_dominant_side: 'right' },
      {},
      { asymmetryPattern: 'MIXED_ASYMMETRY' },
    )
    expect(generateSection4_AsymmetryOutput(ctx)).toContain('without a single consistent pattern')
  })

  it('SINGLE_FINDING → one asymmetric finding phrase', () => {
    const ctx = makeCtx(
      { asym_jaw_drift_direction: 'left' },
      {},
      { asymmetryPattern: 'SINGLE_FINDING' },
    )
    expect(generateSection4_AsymmetryOutput(ctx)).toContain('one asymmetric finding')
    expect(generateSection4_AsymmetryOutput(ctx)).toContain('A single finding is noted and will influence your protocol where relevant')
  })

  it('contralateralPattern=true + drift=left + ear=right → contralateral text appended with values', () => {
    const ctx = makeCtx(
      { asym_jaw_drift_direction: 'left', asym_tinnitus_worse_ear: 'right' },
      {},
      { asymmetryPattern: 'NO_ASYMMETRY', contralateralPattern: true },
    )
    const result = generateSection4_AsymmetryOutput(ctx)
    expect(result).toContain('jaw drifts to the left on opening')
    expect(result).toContain('tinnitus is louder in the right ear')
    expect(result).toContain('emphasis toward the left side')
  })

  it('contralateralPattern=false → no contralateral text', () => {
    const ctx = makeCtx(
      { asym_jaw_drift_direction: 'left', asym_tinnitus_worse_ear: 'right' },
      {},
      { asymmetryPattern: 'NO_ASYMMETRY', contralateralPattern: false },
    )
    expect(generateSection4_AsymmetryOutput(ctx)).not.toContain('potentially significant asymmetric pattern')
  })
})

// ── generateSection5_ProtocolAssignment ──────────────────────────────────────

describe('generateSection5_ProtocolAssignment', () => {
  it('TMJ_DOMINANT → Full jaw release protocol', () => {
    expect(generateSection5_ProtocolAssignment(makeCtx({ profile_type: 'TMJ_DOMINANT' })))
      .toContain('Full jaw release protocol')
  })

  it('CERV_DOMINANT → Full cervical release protocol', () => {
    expect(generateSection5_ProtocolAssignment(makeCtx({ profile_type: 'CERV_DOMINANT' })))
      .toContain('Full cervical release protocol')
  })

  it('DUAL_DRIVER → Both full protocols', () => {
    expect(generateSection5_ProtocolAssignment(makeCtx({ profile_type: 'DUAL_DRIVER' })))
      .toContain('Both full protocols')
  })

  it('TMJ_PRIMARY_STRONG_SECONDARY → two to three key cervical', () => {
    expect(generateSection5_ProtocolAssignment(makeCtx({ profile_type: 'TMJ_PRIMARY_STRONG_SECONDARY' })))
      .toContain('two to three key cervical')
  })

  it('CERV_PRIMARY_STRONG_SECONDARY → two to three key jaw', () => {
    expect(generateSection5_ProtocolAssignment(makeCtx({ profile_type: 'CERV_PRIMARY_STRONG_SECONDARY' })))
      .toContain('two to three key jaw')
  })

  it('TMJ_PRIMARY_WITH_SECONDARY → one key cervical exercise', () => {
    expect(generateSection5_ProtocolAssignment(makeCtx({ profile_type: 'TMJ_PRIMARY_WITH_SECONDARY' })))
      .toContain('one key cervical exercise')
  })

  it('CERV_PRIMARY_WITH_SECONDARY → one key jaw exercise', () => {
    expect(generateSection5_ProtocolAssignment(makeCtx({ profile_type: 'CERV_PRIMARY_WITH_SECONDARY' })))
      .toContain('one key jaw exercise')
  })

  it('no unresolved bracket tokens in any output', () => {
    const profileTypes = [
      'TMJ_DOMINANT', 'CERV_DOMINANT', 'DUAL_DRIVER',
      'TMJ_PRIMARY_STRONG_SECONDARY', 'CERV_PRIMARY_STRONG_SECONDARY',
      'TMJ_PRIMARY_WITH_SECONDARY', 'CERV_PRIMARY_WITH_SECONDARY',
    ]
    for (const pt of profileTypes) {
      const result = generateSection5_ProtocolAssignment(makeCtx({ profile_type: pt }))
      expect(result).not.toContain('[')
    }
  })
})

// ── generateSection6_SessionStructureChoice ───────────────────────────────────

describe('generateSection6_SessionStructureChoice', () => {
  it('lowConfidence=LOW_CONFIDENCE_SYMPTOM_DOMINANT → returns null', () => {
    const ctx = makeCtx(
      { profile_type: 'DUAL_DRIVER' },
      {},
      { lowConfidence: 'LOW_CONFIDENCE_SYMPTOM_DOMINANT' },
    )
    expect(generateSection6_SessionStructureChoice(ctx)).toBe(null)
  })

  it('lowConfidence=LOW_CONFIDENCE_LOW_ALL → returns null', () => {
    const ctx = makeCtx(
      { profile_type: 'DUAL_DRIVER' },
      {},
      { lowConfidence: 'LOW_CONFIDENCE_LOW_ALL' },
    )
    expect(generateSection6_SessionStructureChoice(ctx)).toBe(null)
  })

  it('TMJ_DOMINANT + cervNorm=10 → returns null (pure single driver)', () => {
    const ctx = { ...makeCtx({ profile_type: 'TMJ_DOMINANT' }), cervNorm: 10 }
    expect(generateSection6_SessionStructureChoice(ctx)).toBe(null)
  })

  it('CERV_DOMINANT + tmjNorm=10 → returns null (pure single driver)', () => {
    const ctx = { ...makeCtx({ profile_type: 'CERV_DOMINANT' }), tmjNorm: 10, cervNorm: 70 }
    expect(generateSection6_SessionStructureChoice(ctx)).toBe(null)
  })

  it('TMJ_DOMINANT + cervNorm=25 → returns string (secondary above threshold, edge case)', () => {
    const ctx = { ...makeCtx({ profile_type: 'TMJ_DOMINANT' }), cervNorm: 25 }
    expect(generateSection6_SessionStructureChoice(ctx)).not.toBe(null)
  })

  it('DUAL_DRIVER → returns string containing Option 2 recommendation', () => {
    const ctx = makeCtx({ profile_type: 'DUAL_DRIVER' })
    const result = generateSection6_SessionStructureChoice(ctx)
    expect(result).not.toBe(null)
    expect(result).toContain('Option 2 is recommended')
  })

  it('TMJ_PRIMARY_STRONG_SECONDARY → Option 3 recommendation', () => {
    const ctx = makeCtx({ profile_type: 'TMJ_PRIMARY_STRONG_SECONDARY' })
    expect(generateSection6_SessionStructureChoice(ctx)).toContain('Option 3 is recommended')
  })

  it('TMJ_PRIMARY_WITH_SECONDARY → Option 3 recommendation', () => {
    const ctx = makeCtx({ profile_type: 'TMJ_PRIMARY_WITH_SECONDARY' })
    expect(generateSection6_SessionStructureChoice(ctx)).toContain('Option 3 is recommended')
  })

  it('returned string contains all three option descriptions', () => {
    const ctx = makeCtx({ profile_type: 'DUAL_DRIVER' })
    const result = generateSection6_SessionStructureChoice(ctx)!
    expect(result).toContain('Option 1 — Sequential')
    expect(result).toContain('Option 2 — Parallel')
    expect(result).toContain('Option 3 — Prioritised Parallel')
  })

  it('returned string contains session structure intro', () => {
    const ctx = makeCtx({ profile_type: 'DUAL_DRIVER' })
    expect(generateSection6_SessionStructureChoice(ctx)).toContain('assigned both protocols')
  })
})

// ── generateProfileParagraph (structural — updated for real implementations) ──

describe('generateProfileParagraph', () => {
  it('TMJ_DOMINANT → contains section 1 phrase and section 3 jaw phrase', () => {
    const ctx = makeCtx({ profile_type: 'TMJ_DOMINANT' })
    const result = generateProfileParagraph(ctx)
    expect(result).toContain('jaw and masticatory system')
    expect(result).toContain('jaw pathway')
  })

  it('no findings → section 2 absent (no "findings confirmed" text)', () => {
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

  it('resolvePlaceholders runs on final output — no §4.4 tokens remain', () => {
    const ctx = makeCtx({
      profile_type: 'TMJ_PRIMARY_WITH_SECONDARY',
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

  it('low-confidence context → section 6 absent (null filtered), wrapper text present', () => {
    const ctx = makeCtx(
      { profile_type: 'TMJ_DOMINANT' },
      {},
      { lowConfidence: 'LOW_CONFIDENCE_LOW_ALL' },
    )
    const result = generateProfileParagraph(ctx)
    expect(result).toContain('did not produce strong findings')
    expect(result).not.toContain('assigned both protocols')
  })

  it('DUAL_DRIVER → section 6 present in output', () => {
    const ctx = makeCtx({ profile_type: 'DUAL_DRIVER' })
    expect(generateProfileParagraph(ctx)).toContain('assigned both protocols')
  })
})
