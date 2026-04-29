-- M13h.2: UNIQUE constraint on session_logs(user_id, session_date, phase)
--
-- Prevents duplicate finalise writes for the same member, same day, same phase.
-- Discovered during M13h verification: User 3 had two session_logs rows for
-- 2026-04-29 phase 3 from a partial test run plus the full verification run.
-- The duplicate was deleted manually before this migration ran.
--
-- Together with the upsert(ignoreDuplicates: true) change in the finalise
-- route (next sub-step commit), this makes the finalise INSERT idempotent —
-- duplicate calls absorb silently rather than creating extra rows.
--
-- The constraint is added at the schema level even though application logic
-- handles dedupe, because schema-level guarantees beat application-level
-- checks. If a future code path bypasses the upsert, the constraint still
-- catches it.

ALTER TABLE session_logs
  ADD CONSTRAINT session_logs_user_date_phase_unique
  UNIQUE (user_id, session_date, phase);

COMMENT ON CONSTRAINT session_logs_user_date_phase_unique ON session_logs IS
  'One session_logs row per (user, date, phase). Enforces idempotent
   finalise behaviour. Added in M13h.2 after a duplicate was found
   during M13h verification.';
