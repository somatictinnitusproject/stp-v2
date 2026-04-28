-- M13d: Phase 4 explicit opt-in column
-- Per errata P3-15: Phase 4 exercises are added to the daily session only
-- when the member explicitly opts in via an "Add to my daily session" button
-- on Phase 4 content sections. Auto-appending on phase4_first_accessed is wrong.
--
-- Default empty array: no Phase 4 exercises appear in /session for any member
-- by default, regardless of phase4_first_accessed state.

ALTER TABLE framework_progress
  ADD COLUMN IF NOT EXISTS phase4_exercises_added JSONB NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN framework_progress.phase4_exercises_added IS
  'Phase 4 exercise IDs the member has explicitly opted into for their daily session.
   Default empty — no Phase 4 exercises appear in /session unless the member taps
   "Add to my daily session" on a Phase 4 exercise section. Managed as an append/remove
   array per errata P3-15. Built in M13d.';
