-- M12a: Phase 2 foundation
-- Adds phase2_habits_acknowledged column to framework_progress
-- Spec: Doc 8 Part C, system note in C.8 — engagement telemetry only,
--       not used for access control. Phase 2 advancement gate is the
--       single confirmation button on C.8, not these acknowledges.

ALTER TABLE public.framework_progress
  ADD COLUMN IF NOT EXISTS phase2_habits_acknowledged JSONB
    DEFAULT '{}'::jsonb
    NOT NULL;

COMMENT ON COLUMN public.framework_progress.phase2_habits_acknowledged IS
  'Phase 2 engagement telemetry. Stores per-section and per-habit acknowledge
   timestamps as JSONB. Not used for access control. Phase 2 advancement is
   gated by C.8 confirmation submit, not by this column. Spec: Doc 8 C.8
   system note.';
