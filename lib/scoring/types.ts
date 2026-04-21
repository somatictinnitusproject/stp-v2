// TypeScript interfaces for Phase 1 scoring inputs.
// Phase1AssessmentRow mirrors the phase1_assessment table (Document 7 §2.2 + ERRATA A1).
// UserIntakeRow contains only the columns read by scoring logic (Document 13 §1.9).

export interface Phase1AssessmentRow {
  id: string
  user_id: string
  created_at: string
  completed_at: string | null

  // TMJ module
  tmj_jaw_drift: boolean | null
  tmj_jaw_drift_direction: string | null
  tmj_masseter_asymmetry: boolean | null
  tmj_masseter_dominant_side: string | null
  tmj_joint_sounds: boolean | null
  tmj_pterygoid_tenderness: boolean | null
  tmj_pterygoid_tender_side: string | null
  tmj_opening_restriction: boolean | null
  tmj_morning_soreness: boolean | null
  tmj_daytime_clenching: boolean | null   // overlapping indicator — see §1.2
  tmj_pain_eating: boolean | null         // overlapping indicator — see §1.2
  tmj_worse_after_chewing: boolean | null
  ctx_orthodontic_history: boolean | null
  ctx_dental_extractions: boolean | null
  ctx_jaw_surgery: boolean | null
  ctx_jaw_injury: boolean | null
  tmj_raw_score: number | null
  tmj_normalised_score: number | null

  // Cervical module
  cerv_suboccipital_tenderness: boolean | null
  cerv_suboccipital_asymmetric: boolean | null
  cerv_suboccipital_tender_side: string | null
  cerv_scm_asymmetry: boolean | null
  cerv_scm_dominant_side: string | null
  cerv_trap_asymmetry: boolean | null
  cerv_trap_dominant_side: string | null
  cerv_rotation_restriction: boolean | null
  cerv_restricted_side: string | null
  cerv_forward_head_posture: boolean | null
  // VARCHAR(10) per ERRATA A1 — 'clear' | 'slight' | 'none' | NULL
  cerv_floor_relief_test: 'clear' | 'slight' | 'none' | null
  cerv_neck_pain: boolean | null              // overlapping indicator — see §1.2
  cerv_cervicogenic_headaches: boolean | null // overlapping indicator — see §1.2
  cerv_worse_desk_work: boolean | null
  ctx_whiplash_history: boolean | null
  ctx_sedentary_occupation: boolean | null
  ctx_one_sided_sport: boolean | null
  cerv_raw_score: number | null
  cerv_normalised_score: number | null

  // Postural module (flags only — no score)
  post_shoulder_asymmetry: boolean | null
  post_elevated_side: string | null
  post_dominant_chewing_side: string | null
  post_sustained_desk_load: boolean | null
  post_asymmetric_exercise: boolean | null

  // Nervous system module (flags only — no score)
  ns_stress_tinnitus_correlation: boolean | null
  ns_hypervigilance: boolean | null
  ns_sleep_disruption: boolean | null
  ns_anxiety_loop: boolean | null

  // Asymmetry module
  asym_jaw_drift_direction: string | null
  asym_masseter_dominant_side: string | null
  asym_shoulder_elevated_side: string | null
  asym_scm_dominant_side: string | null
  asym_tinnitus_worse_ear: string | null
  asym_contralateral_pattern: boolean | null

  // Profile output
  profile_type: string | null
  tmj_protocol_assigned: boolean | null
  cerv_protocol_assigned: boolean | null
  profile_paragraph: string | null
}

// Only the columns read by scoring logic — keeps server action queries minimal.
export interface UserIntakeRow {
  m1_score: number | null
  m2_score: number | null
  m3_score: number | null
  m4_score: number | null
  m4_asymmetric: boolean | null   // §1.7: recorded for profile output; does not affect raw cervical score
  m5_score: number | null
  s1_score: number | null
  s2_score: number | null
  s5_score: number | null
  s6_score: number | null
  s7_score: number | null
  s8_score: number | null
  symptom_score: number | null
}
