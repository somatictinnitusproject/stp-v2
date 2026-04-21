import type { ParagraphContext } from './types'

// Doc 13 §4.3 pseudocode (exact):
//   FUNCTION generateSection2_FindingsSummary(assessment, user):
//     blocks = []
//     // ── Jaw findings ──────────────────────────────────────────────────
//     jawFindings = []
//     IF assessment.tmj_jaw_drift = TRUE
//       jawFindings.push('Jaw drift on opening — ' + assessment.tmj_jaw_drift_direction + ' deviation confirmed')
//     IF user.m1_score > 0
//       jawFindings.push('Jaw opening response positive on movement test')
//     IF user.m2_score > 0
//       jawFindings.push('Jaw protrusion response positive on movement test')
//     IF user.s5_score > 0
//       jawFindings.push('Joint sounds confirmed')
//     IF assessment.tmj_pterygoid_tenderness = TRUE
//       jawFindings.push('Lateral pterygoid tenderness reproduced — ' + assessment.tmj_pterygoid_tender_side)
//     IF assessment.tmj_masseter_asymmetry = TRUE
//       jawFindings.push('Masseter asymmetry — dominant side: ' + assessment.tmj_masseter_dominant_side)
//     IF assessment.tmj_opening_restriction = TRUE
//       jawFindings.push('Maximum opening restriction noted')
//     IF assessment.tmj_morning_soreness = TRUE OR user.s2_score > 0
//       jawFindings.push('Morning jaw soreness or facial tension on waking')
//     IF assessment.tmj_worse_after_chewing = TRUE
//       jawFindings.push('Tinnitus noticeably worse after prolonged chewing')
//     IF jawFindings.length > 0
//       blocks.push('Jaw findings confirmed:\n' + jawFindings.map(f => '• ' + f).join('\n'))
//     // ── Cervical findings ────────────────────────────────────────────
//     cervFindings = []
//     IF user.m3_score > 0
//       cervFindings.push('Neck curl on floor response positive on movement test')
//     IF user.m4_score > 0
//       IF user.m4_asymmetric = TRUE
//         cervFindings.push('Head rotation response positive — asymmetric between sides')
//       ELSE
//         cervFindings.push('Head rotation response positive')
//     IF assessment.cerv_suboccipital_tenderness = TRUE
//       cervFindings.push('Suboccipital tenderness reproduced'
//         + (assessment.cerv_suboccipital_asymmetric ? ' — asymmetric, dominant side: ' + assessment.cerv_suboccipital_tender_side : ''))
//     IF assessment.cerv_floor_relief_test = 'clear'
//       cervFindings.push('Floor lying relief test — clear tinnitus reduction')
//     ELSE IF assessment.cerv_floor_relief_test = 'slight'
//       cervFindings.push('Floor lying relief test — slight tinnitus reduction')
//     IF assessment.cerv_worse_desk_work = TRUE
//       cervFindings.push('Tinnitus noticeably worse after desk work or driving')
//     IF assessment.cerv_rotation_restriction = TRUE
//       cervFindings.push('Restricted or asymmetric rotation range — restricted side: ' + assessment.cerv_restricted_side)
//     IF assessment.cerv_forward_head_posture = TRUE
//       cervFindings.push('Forward head posture confirmed')
//     IF assessment.cerv_scm_asymmetry = TRUE OR assessment.cerv_trap_asymmetry = TRUE
//       cervFindings.push('Asymmetric SCM or upper trapezius tenderness')
//     IF cervFindings.length > 0
//       blocks.push('Cervical findings confirmed:\n' + cervFindings.map(f => '• ' + f).join('\n'))
//     // ── Maintaining factors ──────────────────────────────────────────
//     maintainingFindings = []
//     IF assessment.post_shoulder_asymmetry = TRUE
//       maintainingFindings.push('Shoulder height asymmetry — elevated side: ' + assessment.post_elevated_side)
//     IF assessment.post_sustained_desk_load = TRUE
//       maintainingFindings.push('Sustained desk posture load confirmed')
//     IF assessment.post_asymmetric_exercise = TRUE
//       maintainingFindings.push('Asymmetric exercise or movement patterns confirmed')
//     IF assessment.post_dominant_chewing_side IS NOT NULL
//       maintainingFindings.push('Dominant chewing side: ' + assessment.post_dominant_chewing_side)
//     IF maintainingFindings.length > 0
//       blocks.push('Maintaining factors confirmed:\n' + maintainingFindings.map(f => '• ' + f).join('\n'))
//     // ── Nervous system flags ─────────────────────────────────────────
//     nsFindings = []
//     IF assessment.ns_stress_tinnitus_correlation = TRUE
//       nsFindings.push('Tinnitus clearly tracks stress levels')
//     IF assessment.ns_hypervigilance = TRUE
//       nsFindings.push('Hypervigilance pattern identified')
//     IF assessment.ns_sleep_disruption = TRUE
//       nsFindings.push('Sleep disruption linked to tinnitus')
//     IF assessment.ns_anxiety_loop = TRUE
//       nsFindings.push('Anxiety-tinnitus feedback loop present')
//     IF nsFindings.length > 0
//       blocks.push('Nervous system flags:\n' + nsFindings.map(f => '• ' + f).join('\n'))
//     IF blocks.length = 0
//       RETURN NULL
//     RETURN blocks.join('\n\n')
//   END FUNCTION

export function generateSection2_FindingsSummary(ctx: ParagraphContext): string | null {
  const { assessment, user } = ctx
  const blocks: string[] = []

  // ── Jaw findings ────────────────────────────────────────────────────
  const jawFindings: string[] = []
  if (assessment.tmj_jaw_drift === true)
    jawFindings.push('Jaw drift on opening — ' + assessment.tmj_jaw_drift_direction + ' deviation confirmed')
  if ((user.m1_score ?? 0) > 0)
    jawFindings.push('Jaw opening response positive on movement test')
  if ((user.m2_score ?? 0) > 0)
    jawFindings.push('Jaw protrusion response positive on movement test')
  if ((user.s5_score ?? 0) > 0)
    jawFindings.push('Joint sounds confirmed')
  if (assessment.tmj_pterygoid_tenderness === true)
    jawFindings.push('Lateral pterygoid tenderness reproduced — ' + assessment.tmj_pterygoid_tender_side)
  if (assessment.tmj_masseter_asymmetry === true)
    jawFindings.push('Masseter asymmetry — dominant side: ' + assessment.tmj_masseter_dominant_side)
  if (assessment.tmj_opening_restriction === true)
    jawFindings.push('Maximum opening restriction noted')
  if (assessment.tmj_morning_soreness === true || (user.s2_score ?? 0) > 0)
    jawFindings.push('Morning jaw soreness or facial tension on waking')
  if (assessment.tmj_worse_after_chewing === true)
    jawFindings.push('Tinnitus noticeably worse after prolonged chewing')
  if (jawFindings.length > 0)
    blocks.push('Jaw findings confirmed:\n' + jawFindings.map(f => '• ' + f).join('\n'))

  // ── Cervical findings ────────────────────────────────────────────────
  const cervFindings: string[] = []
  if ((user.m3_score ?? 0) > 0)
    cervFindings.push('Neck curl on floor response positive on movement test')
  if ((user.m4_score ?? 0) > 0) {
    if (user.m4_asymmetric === true)
      cervFindings.push('Head rotation response positive — asymmetric between sides')
    else
      cervFindings.push('Head rotation response positive')
  }
  if (assessment.cerv_suboccipital_tenderness === true)
    cervFindings.push(
      'Suboccipital tenderness reproduced' +
      (assessment.cerv_suboccipital_asymmetric
        ? ' — asymmetric, dominant side: ' + assessment.cerv_suboccipital_tender_side
        : '')
    )
  if (assessment.cerv_floor_relief_test === 'clear')
    cervFindings.push('Floor lying relief test — clear tinnitus reduction')
  else if (assessment.cerv_floor_relief_test === 'slight')
    cervFindings.push('Floor lying relief test — slight tinnitus reduction')
  if (assessment.cerv_worse_desk_work === true)
    cervFindings.push('Tinnitus noticeably worse after desk work or driving')
  if (assessment.cerv_rotation_restriction === true)
    cervFindings.push('Restricted or asymmetric rotation range — restricted side: ' + assessment.cerv_restricted_side)
  if (assessment.cerv_forward_head_posture === true)
    cervFindings.push('Forward head posture confirmed')
  if (assessment.cerv_scm_asymmetry === true || assessment.cerv_trap_asymmetry === true)
    cervFindings.push('Asymmetric SCM or upper trapezius tenderness')
  if (cervFindings.length > 0)
    blocks.push('Cervical findings confirmed:\n' + cervFindings.map(f => '• ' + f).join('\n'))

  // ── Maintaining factors ──────────────────────────────────────────────
  const maintainingFindings: string[] = []
  if (assessment.post_shoulder_asymmetry === true)
    maintainingFindings.push('Shoulder height asymmetry — elevated side: ' + assessment.post_elevated_side)
  if (assessment.post_sustained_desk_load === true)
    maintainingFindings.push('Sustained desk posture load confirmed')
  if (assessment.post_asymmetric_exercise === true)
    maintainingFindings.push('Asymmetric exercise or movement patterns confirmed')
  if (assessment.post_dominant_chewing_side !== null)
    maintainingFindings.push('Dominant chewing side: ' + assessment.post_dominant_chewing_side)
  if (maintainingFindings.length > 0)
    blocks.push('Maintaining factors confirmed:\n' + maintainingFindings.map(f => '• ' + f).join('\n'))

  // ── Nervous system flags ─────────────────────────────────────────────
  const nsFindings: string[] = []
  if (assessment.ns_stress_tinnitus_correlation === true)
    nsFindings.push('Tinnitus clearly tracks stress levels')
  if (assessment.ns_hypervigilance === true)
    nsFindings.push('Hypervigilance pattern identified')
  if (assessment.ns_sleep_disruption === true)
    nsFindings.push('Sleep disruption linked to tinnitus')
  if (assessment.ns_anxiety_loop === true)
    nsFindings.push('Anxiety-tinnitus feedback loop present')
  if (nsFindings.length > 0)
    blocks.push('Nervous system flags:\n' + nsFindings.map(f => '• ' + f).join('\n'))

  if (blocks.length === 0) return null

  return blocks.join('\n\n')
}
