-- Add phase3_first_accessed timestamp column to framework_progress.
--
-- Set when member first navigates to /framework/phase-3/session-1 after
-- confirming Phase 2 completion. Used by the C.9 transition screen to
-- display once and only once. Subsequent visits to /framework/phase-3/
-- session-1 fall through to the regular Phase 3 content (currently
-- default stub until Phase 3 build).
--
-- Parallels existing phase4_first_accessed pattern.

ALTER TABLE framework_progress
  ADD COLUMN IF NOT EXISTS phase3_first_accessed TIMESTAMPTZ NULL;

COMMENT ON COLUMN framework_progress.phase3_first_accessed IS
  'Set on first navigation to Phase 3 / Session 1 after Phase 2 completion. Used to display C.9 transition screen once.';
