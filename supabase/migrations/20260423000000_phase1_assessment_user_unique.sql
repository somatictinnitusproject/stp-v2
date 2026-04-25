-- ERRATA E8: phase1_assessment requires UNIQUE (user_id) for the B.1 acknowledge
-- route's ON CONFLICT DO NOTHING upsert to work correctly. Without this constraint,
-- concurrent acknowledge requests silently insert duplicate rows and subsequent
-- module UPDATEs write to a nondeterministic row.
--
-- Design decision: one Phase 1 assessment per user, ever. Phase 1 is not repeatable
-- without a manual row reset in Supabase. This matches the spec — no Phase 1 re-run
-- path is described anywhere in Documents 8, 12, or 13.
--
-- If this migration fails with "could not create unique index" it means duplicate
-- user_id rows already exist — resolve manually in Supabase before re-running.

ALTER TABLE phase1_assessment
  ADD CONSTRAINT phase1_assessment_user_id_key UNIQUE (user_id);
