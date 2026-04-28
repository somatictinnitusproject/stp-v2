// TypeScript interfaces for Phase 1 scoring inputs.
// Phase1AssessmentRow mirrors the phase1_assessment table (Document 7 §2.2 + ERRATA A1).
// UserIntakeRow contains only the columns read by scoring logic (Document 13 §1.9).

export interface Phase1AssessmentRow {
  id: string
  user_id: string
  created_at: string
  completed_at: string | null

  // TMJ module
  tmj_m1_jaw_opening: boolean | null     // D1: live movement test, replaces intake fallback
  tmj_m2_jaw_protrusion: boolean | null  // D1: live movement test, replaces intake fallback
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
  cerv_m3_neck_curl: boolean | null           // E13: live movement test, replaces intake fallback
  cerv_m4_head_rotation: boolean | null       // E13: live movement test, replaces intake fallback
  cerv_m4_asymmetric_side: boolean | null     // E13: asymmetry flag for profile output (no pts)
  cerv_m5_chin_tuck: boolean | null           // E13: live movement test, replaces intake fallback
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

// Shape of the framework_progress table row. Read by session list builders
// (M13d), /session page (M13g), and ExerciseView component (M13e).
//
// tmj_protocol_assigned and cerv_protocol_assigned live on phase1_assessment,
// NOT here — per errata P3-14. Do not add them to this type.
//
// phase4_exercises_added is the Phase 4 explicit opt-in array per errata P3-15.
// Added to the DB in M13d migration 20260428000000_add_phase4_exercises_added.sql.
export interface FrameworkProgressRow {
  user_id: string

  // Phase advancement state
  current_phase: number
  current_session: number
  protocol_option: 1 | 2 | 3 | null  // null for single-driver and low-confidence members
  started_at: string | null           // TIMESTAMPTZ

  // Phase completion timestamps (TIMESTAMPTZ)
  phase1_completed_at: string | null
  phase2_completed_at: string | null
  phase3_completed_at: string | null
  phase4_completed_at: string | null
  phase5_completed_at: string | null

  // Phase milestones
  resistance_phase_start: string | null        // TIMESTAMPTZ — non-null once member enters resistance phase
  phase2_habits_acknowledged: Record<string, unknown>  // JSONB NOT NULL default {} — engagement telemetry per M12a
  phase3_first_accessed: string | null         // TIMESTAMPTZ — set on first /framework/phase-3 visit
  phase4_first_accessed: string | null         // TIMESTAMPTZ — analytics only; does NOT drive session list (P3-15)
  phase5_outcome_type: string | null           // VARCHAR(30)

  // Session state (JSONB)
  exercises_viewed: Record<string, boolean>            // JSONB NOT NULL — exercise ID → true on first view (P3-4)
  session_in_progress: Record<string, unknown> | null  // JSONB NULLABLE — in-progress session timer state (P3-8)
  nudges_dismissed: Record<string, boolean>            // JSONB NOT NULL — nudge ID → dismissed

  // Phase 4 explicit opt-in per errata P3-15
  // Array of Phase 4 exercise IDs the member has opted into for daily /session.
  // Default [] — no Phase 4 exercises appear in /session unless explicitly added.
  phase4_exercises_added: string[]
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
