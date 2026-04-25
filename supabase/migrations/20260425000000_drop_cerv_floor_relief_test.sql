-- E16: Floor lying relief test removed from Phase 1 Module 2.
-- No V2 member data exists in this column — pre-launch drop is safe.
-- See ERRATA_AND_BUILD_INSTRUCTIONS.md §E16 for full rationale.

ALTER TABLE phase1_assessment DROP COLUMN IF EXISTS cerv_floor_relief_test;
