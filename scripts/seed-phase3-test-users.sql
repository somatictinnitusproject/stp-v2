-- ─────────────────────────────────────────────────────────────────────────────
-- SOMATIC TINNITUS PROJECT — V2
-- Phase 3 Test User Seed Script (M13b)
--
-- Creates 7 test users in seven distinct Phase 3 states for smoke testing
-- across all branches of buildSessionExerciseList (Doc 13 §5.4 + errata
-- P3-12, P3-14).
--
-- PREREQUISITE: 7 auth users created via Supabase Auth dashboard with
-- "Auto Confirm User" ticked. Their UUIDs are pasted into the constants
-- block below.
--
-- This script is RE-RUNNABLE. It deletes and re-inserts public-table rows
-- for the 7 users on every run. Auth users are never touched.
--
-- DO NOT run on production member data. The 7 UUIDs below should be test
-- users only.
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  -- ── 7 AUTH USER UUIDs ────────────────────────────────────────────────────
  u1_tmj_dom       UUID := '5a93e93f-89d1-437a-b9e8-92449ec4c980';  -- test-tmj-dom@stp-test.local
  u2_cerv_dom      UUID := 'e823ae7c-3b58-4244-923c-4d0d2a14cd9a';  -- test-cerv-dom@stp-test.local
  u3_dual_rel      UUID := '4a15b2ed-45e7-425a-b579-3d2c722393cf';  -- existing user (oliverturmore@gmail.com)
  u4_dual_res      UUID := '2f47c284-b04a-4b90-bd64-76c567ee6100';  -- test-dual-res@stp-test.local
  u5_tmj_secondary UUID := '3d63da89-382b-449a-be54-7de865e4fbbd';  -- test-tmj-secondary@stp-test.local
  u6_cerv_strong   UUID := '49b66974-2930-4758-8581-b88082cef443';  -- test-cerv-strong@stp-test.local
  u7_low_conf      UUID := 'd5418dd8-3d09-46c0-b65d-8fd688513487';  -- test-low-conf@stp-test.local
BEGIN

  -- ── DELETE PHASE — reverse FK order ──────────────────────────────────────

  DELETE FROM progress_log_triggers
  WHERE log_id IN (
    SELECT id FROM progress_logs
    WHERE user_id IN (u1_tmj_dom, u2_cerv_dom, u3_dual_rel, u4_dual_res,
                      u5_tmj_secondary, u6_cerv_strong, u7_low_conf)
  );

  DELETE FROM progress_logs
  WHERE user_id IN (u1_tmj_dom, u2_cerv_dom, u3_dual_rel, u4_dual_res,
                    u5_tmj_secondary, u6_cerv_strong, u7_low_conf);

  DELETE FROM session_logs
  WHERE user_id IN (u1_tmj_dom, u2_cerv_dom, u3_dual_rel, u4_dual_res,
                    u5_tmj_secondary, u6_cerv_strong, u7_low_conf);

  DELETE FROM framework_progress
  WHERE user_id IN (u1_tmj_dom, u2_cerv_dom, u3_dual_rel, u4_dual_res,
                    u5_tmj_secondary, u6_cerv_strong, u7_low_conf);

  DELETE FROM phase1_assessment
  WHERE user_id IN (u1_tmj_dom, u2_cerv_dom, u3_dual_rel, u4_dual_res,
                    u5_tmj_secondary, u6_cerv_strong, u7_low_conf);

  DELETE FROM consents
  WHERE user_id IN (u1_tmj_dom, u2_cerv_dom, u3_dual_rel, u4_dual_res,
                    u5_tmj_secondary, u6_cerv_strong, u7_low_conf);

  DELETE FROM memberships
  WHERE user_id IN (u1_tmj_dom, u2_cerv_dom, u3_dual_rel, u4_dual_res,
                    u5_tmj_secondary, u6_cerv_strong, u7_low_conf);

  -- ── INSERT PHASE — forward FK order ──────────────────────────────────────

  -- 1. public.users — read email from auth.users, derive display_name
  INSERT INTO users (id, email, display_name, onboarding_completed, onboarding_step, is_admin, created_at)
  VALUES
    (u1_tmj_dom,
     (SELECT email FROM auth.users WHERE id = u1_tmj_dom),
     'Test TMJ Dominant',
     TRUE, 5, FALSE, NOW()),
    (u2_cerv_dom,
     (SELECT email FROM auth.users WHERE id = u2_cerv_dom),
     'Test Cervical Dominant',
     TRUE, 5, FALSE, NOW()),
    (u3_dual_rel,
     (SELECT email FROM auth.users WHERE id = u3_dual_rel),
     'Test Dual Driver Release',
     TRUE, 5, FALSE, NOW()),
    (u4_dual_res,
     (SELECT email FROM auth.users WHERE id = u4_dual_res),
     'Test Dual Driver Resistance',
     TRUE, 5, FALSE, NOW()),
    (u5_tmj_secondary,
     (SELECT email FROM auth.users WHERE id = u5_tmj_secondary),
     'Test TMJ Primary With Secondary',
     TRUE, 5, FALSE, NOW()),
    (u6_cerv_strong,
     (SELECT email FROM auth.users WHERE id = u6_cerv_strong),
     'Test Cervical Strong Secondary',
     TRUE, 5, FALSE, NOW()),
    (u7_low_conf,
     (SELECT email FROM auth.users WHERE id = u7_low_conf),
     'Test Low Confidence',
     TRUE, 5, FALSE, NOW())
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = EXCLUDED.display_name,
    onboarding_completed = TRUE,
    onboarding_step = 5,
    is_admin = FALSE;

  -- 2. memberships
  INSERT INTO memberships (user_id, is_founding_member, status, created_at)
  VALUES
    (u1_tmj_dom,       TRUE, 'active', NOW()),
    (u2_cerv_dom,      TRUE, 'active', NOW()),
    (u3_dual_rel,      TRUE, 'active', NOW()),
    (u4_dual_res,      TRUE, 'active', NOW()),
    (u5_tmj_secondary, TRUE, 'active', NOW()),
    (u6_cerv_strong,   TRUE, 'active', NOW()),
    (u7_low_conf,      TRUE, 'active', NOW());

  -- 3. consents
  INSERT INTO consents (user_id, health_data_consent, research_consent, consented_at)
  VALUES
    (u1_tmj_dom,       TRUE, TRUE, NOW()),
    (u2_cerv_dom,      TRUE, TRUE, NOW()),
    (u3_dual_rel,      TRUE, TRUE, NOW()),
    (u4_dual_res,      TRUE, TRUE, NOW()),
    (u5_tmj_secondary, TRUE, TRUE, NOW()),
    (u6_cerv_strong,   TRUE, TRUE, NOW()),
    (u7_low_conf,      TRUE, TRUE, NOW());

  -- 4. phase1_assessment

  -- USER 1 — TMJ_DOMINANT (Sequential)
  INSERT INTO phase1_assessment (
    user_id, completed_at,
    tmj_raw_score, tmj_normalised_score,
    cerv_raw_score, cerv_normalised_score,
    profile_type, tmj_protocol_assigned, cerv_protocol_assigned,
    profile_paragraph,
    tmj_jaw_drift, tmj_jaw_drift_direction,
    tmj_masseter_asymmetry, tmj_masseter_dominant_side,
    tmj_pterygoid_tenderness, tmj_pterygoid_tender_side,
    tmj_daytime_clenching, tmj_morning_soreness, tmj_joint_sounds,
    tmj_opening_restriction,
    cerv_suboccipital_tenderness, cerv_forward_head_posture,
    cerv_rotation_restriction
  ) VALUES (
    u1_tmj_dom, NOW() - INTERVAL '21 days',
    21, 70,
    3, 12,
    'TMJ_DOMINANT', TRUE, FALSE,
    'Test seed — TMJ_DOMINANT profile. Single-driver TMJ release-only.',
    TRUE, 'left',
    TRUE, 'right',
    TRUE, 'left',
    TRUE, TRUE, FALSE,
    FALSE,
    FALSE, FALSE,
    FALSE
  );

  -- USER 2 — CERV_DOMINANT (Sequential)
  INSERT INTO phase1_assessment (
    user_id, completed_at,
    tmj_raw_score, tmj_normalised_score,
    cerv_raw_score, cerv_normalised_score,
    profile_type, tmj_protocol_assigned, cerv_protocol_assigned,
    profile_paragraph,
    tmj_jaw_drift, tmj_masseter_asymmetry, tmj_pterygoid_tenderness,
    tmj_daytime_clenching, tmj_morning_soreness, tmj_joint_sounds,
    tmj_opening_restriction,
    cerv_suboccipital_tenderness, cerv_suboccipital_tender_side,
    cerv_scm_asymmetry, cerv_scm_dominant_side,
    cerv_forward_head_posture,
    cerv_rotation_restriction, cerv_restricted_side,
    cerv_floor_relief_test
  ) VALUES (
    u2_cerv_dom, NOW() - INTERVAL '21 days',
    3, 10,
    18, 72,
    'CERV_DOMINANT', FALSE, TRUE,
    'Test seed — CERV_DOMINANT profile. Single-driver cervical release-only.',
    FALSE, FALSE, FALSE,
    FALSE, FALSE, FALSE,
    FALSE,
    TRUE, 'right',
    TRUE, 'left',
    TRUE,
    TRUE, 'right',
    'clear'
  );

  -- USER 3 — DUAL_DRIVER (Parallel) — release-only — EXISTING USER
  INSERT INTO phase1_assessment (
    user_id, completed_at,
    tmj_raw_score, tmj_normalised_score,
    cerv_raw_score, cerv_normalised_score,
    profile_type, tmj_protocol_assigned, cerv_protocol_assigned,
    profile_paragraph,
    tmj_jaw_drift, tmj_jaw_drift_direction,
    tmj_masseter_asymmetry, tmj_masseter_dominant_side,
    tmj_pterygoid_tenderness, tmj_pterygoid_tender_side,
    tmj_daytime_clenching, tmj_morning_soreness, tmj_joint_sounds,
    cerv_suboccipital_tenderness, cerv_suboccipital_tender_side,
    cerv_scm_asymmetry, cerv_scm_dominant_side,
    cerv_forward_head_posture,
    cerv_rotation_restriction, cerv_restricted_side,
    cerv_floor_relief_test
  ) VALUES (
    u3_dual_rel, NOW() - INTERVAL '21 days',
    13, 43,
    11, 44,
    'DUAL_DRIVER', TRUE, TRUE,
    'Test seed — DUAL_DRIVER profile. Parallel option, release-only.',
    TRUE, 'left',
    TRUE, 'right',
    TRUE, 'left',
    TRUE, TRUE, FALSE,
    TRUE, 'right',
    TRUE, 'left',
    TRUE,
    TRUE, 'right',
    'slight'
  );

  -- USER 4 — DUAL_DRIVER (Parallel) — RESISTANCE ACTIVE
  INSERT INTO phase1_assessment (
    user_id, completed_at,
    tmj_raw_score, tmj_normalised_score,
    cerv_raw_score, cerv_normalised_score,
    profile_type, tmj_protocol_assigned, cerv_protocol_assigned,
    profile_paragraph,
    tmj_jaw_drift, tmj_jaw_drift_direction,
    tmj_masseter_asymmetry, tmj_pterygoid_tenderness,
    tmj_daytime_clenching, tmj_morning_soreness,
    cerv_suboccipital_tenderness, cerv_scm_asymmetry,
    cerv_forward_head_posture, cerv_rotation_restriction
  ) VALUES (
    u4_dual_res, NOW() - INTERVAL '35 days',
    13, 43,
    11, 44,
    'DUAL_DRIVER', TRUE, TRUE,
    'Test seed — DUAL_DRIVER profile. Resistance phase active.',
    TRUE, 'left',
    TRUE, TRUE,
    TRUE, TRUE,
    TRUE, TRUE,
    TRUE, TRUE
  );

  -- USER 5 — TMJ_PRIMARY_WITH_SECONDARY (Prioritised Parallel)
  INSERT INTO phase1_assessment (
    user_id, completed_at,
    tmj_raw_score, tmj_normalised_score,
    cerv_raw_score, cerv_normalised_score,
    profile_type, tmj_protocol_assigned, cerv_protocol_assigned,
    profile_paragraph,
    tmj_jaw_drift, tmj_jaw_drift_direction,
    tmj_masseter_asymmetry, tmj_pterygoid_tenderness,
    tmj_daytime_clenching, tmj_joint_sounds,
    cerv_suboccipital_tenderness, cerv_forward_head_posture
  ) VALUES (
    u5_tmj_secondary, NOW() - INTERVAL '21 days',
    14, 47,
    6, 24,
    'TMJ_PRIMARY_WITH_SECONDARY', TRUE, TRUE,
    'Test seed — TMJ_PRIMARY_WITH_SECONDARY profile. Prioritised Parallel.',
    TRUE, 'right',
    TRUE, TRUE,
    TRUE, FALSE,
    TRUE, TRUE
  );

  -- USER 6 — CERV_PRIMARY_STRONG_SECONDARY (Prioritised Parallel)
  INSERT INTO phase1_assessment (
    user_id, completed_at,
    tmj_raw_score, tmj_normalised_score,
    cerv_raw_score, cerv_normalised_score,
    profile_type, tmj_protocol_assigned, cerv_protocol_assigned,
    profile_paragraph,
    tmj_jaw_drift, tmj_masseter_asymmetry,
    tmj_pterygoid_tenderness, tmj_daytime_clenching,
    cerv_suboccipital_tenderness, cerv_suboccipital_tender_side,
    cerv_scm_asymmetry, cerv_scm_dominant_side,
    cerv_forward_head_posture,
    cerv_rotation_restriction, cerv_restricted_side,
    cerv_floor_relief_test
  ) VALUES (
    u6_cerv_strong, NOW() - INTERVAL '21 days',
    11, 38,
    15, 60,
    'CERV_PRIMARY_STRONG_SECONDARY', TRUE, TRUE,
    'Test seed — CERV_PRIMARY_STRONG_SECONDARY profile. Prioritised Parallel.',
    TRUE, TRUE,
    TRUE, TRUE,
    TRUE, 'left',
    TRUE, 'right',
    TRUE,
    TRUE, 'left',
    'clear'
  );

  -- USER 7 — LOW_CONFIDENCE
  INSERT INTO phase1_assessment (
    user_id, completed_at,
    tmj_raw_score, tmj_normalised_score,
    cerv_raw_score, cerv_normalised_score,
    profile_type, tmj_protocol_assigned, cerv_protocol_assigned,
    profile_paragraph,
    tmj_morning_soreness, cerv_suboccipital_tenderness
  ) VALUES (
    u7_low_conf, NOW() - INTERVAL '21 days',
    5, 17,
    3, 12,
    'TMJ_DOMINANT', TRUE, TRUE,
    'Test seed — LOW_CONFIDENCE profile (both norm scores < 20). Both protocols assigned.',
    TRUE, TRUE
  );

  -- 5. framework_progress

  INSERT INTO framework_progress (
    user_id, current_phase, current_session,
    protocol_option,
    phase1_completed_at, phase2_completed_at,
    resistance_phase_start,
    exercises_viewed, session_in_progress, nudges_dismissed,
    phase4_first_accessed, phase5_outcome_type,
    created_at, updated_at
  ) VALUES
    (u1_tmj_dom, 3, 1, 1,
     NOW() - INTERVAL '21 days', NOW() - INTERVAL '14 days',
     NULL,
     '{}'::jsonb, NULL, '{}'::jsonb,
     NULL, NULL,
     NOW() - INTERVAL '21 days', NOW()),
    (u2_cerv_dom, 3, 1, 1,
     NOW() - INTERVAL '21 days', NOW() - INTERVAL '14 days',
     NULL,
     '{}'::jsonb, NULL, '{}'::jsonb,
     NULL, NULL,
     NOW() - INTERVAL '21 days', NOW()),
    (u3_dual_rel, 3, 1, 2,
     NOW() - INTERVAL '21 days', NOW() - INTERVAL '14 days',
     NULL,
     '{}'::jsonb, NULL, '{}'::jsonb,
     NULL, NULL,
     NOW() - INTERVAL '21 days', NOW()),
    (u4_dual_res, 3, 1, 2,
     NOW() - INTERVAL '35 days', NOW() - INTERVAL '16 days',
     NOW() - INTERVAL '8 days',
     '{}'::jsonb, NULL, '{}'::jsonb,
     NULL, NULL,
     NOW() - INTERVAL '35 days', NOW()),
    (u5_tmj_secondary, 3, 1, 3,
     NOW() - INTERVAL '21 days', NOW() - INTERVAL '14 days',
     NULL,
     '{}'::jsonb, NULL, '{}'::jsonb,
     NULL, NULL,
     NOW() - INTERVAL '21 days', NOW()),
    (u6_cerv_strong, 3, 1, 3,
     NOW() - INTERVAL '21 days', NOW() - INTERVAL '14 days',
     NULL,
     '{}'::jsonb, NULL, '{}'::jsonb,
     NULL, NULL,
     NOW() - INTERVAL '21 days', NOW()),
    (u7_low_conf, 3, 1, NULL,
     NOW() - INTERVAL '21 days', NOW() - INTERVAL '14 days',
     NULL,
     '{}'::jsonb, NULL, '{}'::jsonb,
     NULL, NULL,
     NOW() - INTERVAL '21 days', NOW());

  RAISE NOTICE 'Phase 3 test user seed complete.';
  RAISE NOTICE 'users               %', (SELECT COUNT(*) FROM users WHERE id IN (u1_tmj_dom, u2_cerv_dom, u3_dual_rel, u4_dual_res, u5_tmj_secondary, u6_cerv_strong, u7_low_conf));
  RAISE NOTICE 'memberships         %', (SELECT COUNT(*) FROM memberships WHERE user_id IN (u1_tmj_dom, u2_cerv_dom, u3_dual_rel, u4_dual_res, u5_tmj_secondary, u6_cerv_strong, u7_low_conf));
  RAISE NOTICE 'consents            %', (SELECT COUNT(*) FROM consents WHERE user_id IN (u1_tmj_dom, u2_cerv_dom, u3_dual_rel, u4_dual_res, u5_tmj_secondary, u6_cerv_strong, u7_low_conf));
  RAISE NOTICE 'phase1_assessment   %', (SELECT COUNT(*) FROM phase1_assessment WHERE user_id IN (u1_tmj_dom, u2_cerv_dom, u3_dual_rel, u4_dual_res, u5_tmj_secondary, u6_cerv_strong, u7_low_conf));
  RAISE NOTICE 'framework_progress  %', (SELECT COUNT(*) FROM framework_progress WHERE user_id IN (u1_tmj_dom, u2_cerv_dom, u3_dual_rel, u4_dual_res, u5_tmj_secondary, u6_cerv_strong, u7_low_conf));

END $$;

-- ── POST-RUN SPOT CHECKS ─────────────────────────────────────────────────────

-- All 7 users at Phase 3:
SELECT
  u.id,
  fp.current_phase,
  fp.protocol_option,
  pa.profile_type,
  pa.tmj_protocol_assigned,
  pa.cerv_protocol_assigned,
  pa.tmj_normalised_score,
  pa.cerv_normalised_score,
  fp.resistance_phase_start IS NOT NULL AS resistance_active,
  fp.phase2_completed_at::date AS phase2_done
FROM users u
LEFT JOIN framework_progress fp ON fp.user_id = u.id
LEFT JOIN phase1_assessment pa ON pa.user_id = u.id
WHERE u.id IN (
  '5a93e93f-89d1-437a-b9e8-92449ec4c980',
  'e823ae7c-3b58-4244-923c-4d0d2a14cd9a',
  '4a15b2ed-45e7-425a-b579-3d2c722393cf',
  '2f47c284-b04a-4b90-bd64-76c567ee6100',
  '3d63da89-382b-449a-be54-7de865e4fbbd',
  '49b66974-2930-4758-8581-b88082cef443',
  'd5418dd8-3d09-46c0-b65d-8fd688513487'
)
ORDER BY u.id;

-- Low-confidence detection check — user 7 should match the runtime rule:
SELECT
  user_id,
  tmj_normalised_score,
  cerv_normalised_score,
  (tmj_normalised_score < 20 AND cerv_normalised_score < 20) AS is_low_confidence
FROM phase1_assessment
WHERE user_id = 'd5418dd8-3d09-46c0-b65d-8fd688513487';

-- 7-day resistance gate check:
SELECT
  user_id,
  phase2_completed_at,
  EXTRACT(DAY FROM (NOW() - phase2_completed_at)) AS days_since_phase2,
  (EXTRACT(DAY FROM (NOW() - phase2_completed_at)) >= 7) AS resistance_gate_satisfied
FROM framework_progress
WHERE user_id IN (
  '5a93e93f-89d1-437a-b9e8-92449ec4c980',
  'e823ae7c-3b58-4244-923c-4d0d2a14cd9a',
  '4a15b2ed-45e7-425a-b579-3d2c722393cf',
  '2f47c284-b04a-4b90-bd64-76c567ee6100',
  '3d63da89-382b-449a-be54-7de865e4fbbd',
  '49b66974-2930-4758-8581-b88082cef443',
  'd5418dd8-3d09-46c0-b65d-8fd688513487'
);
