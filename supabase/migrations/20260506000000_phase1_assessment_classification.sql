-- Adds classification column to phase1_assessment for onboarding Step 3.
-- Values: A (likely somatic), B (possibly somatic), C (unlikely somatic).
-- NULL = not yet set (users who completed onboarding before Step 3 existed).
-- Run manually in Supabase SQL editor.

ALTER TABLE phase1_assessment
  ADD COLUMN IF NOT EXISTS classification VARCHAR(1)
    CHECK (classification IN ('A', 'B', 'C'));
