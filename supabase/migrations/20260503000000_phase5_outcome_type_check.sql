-- Add CHECK constraint to phase5_outcome_type on framework_progress.
-- Existing column: VARCHAR(30), nullable, added in initial schema.
-- Constraint allows only the three valid outcome values or NULL.
-- Values mirror PHASE5_OUTCOME_VALUES in content/framework/phase-5/types.ts.
--
-- Run manually in Supabase SQL editor — cannot be applied by Cursor.

ALTER TABLE framework_progress
  ADD CONSTRAINT phase5_outcome_type_valid
  CHECK (
    phase5_outcome_type IS NULL OR
    phase5_outcome_type IN ('full_resolution', 'significant_improvement', 'plateau')
  );

COMMENT ON CONSTRAINT phase5_outcome_type_valid ON framework_progress IS
  'Phase 5 G.1 outcome selection. Values defined in content/framework/phase-5/types.ts as Phase5OutcomeType.';
