-- Add profile output columns to phase1_assessment.
-- These were specified in Doc 7 §2.2 but were absent from the live DB,
-- causing generateAndSaveProfile to fail with "Failed to generate profile."
-- All columns are guarded with IF NOT EXISTS — safe to run on any env.

ALTER TABLE phase1_assessment
  -- Raw scores (integer — TMJ max 30, CERV max 25 after E16)
  ADD COLUMN IF NOT EXISTS tmj_raw_score        SMALLINT,
  ADD COLUMN IF NOT EXISTS cerv_raw_score       SMALLINT,

  -- Normalised scores (percent 0–100, 2dp — e.g. 73.33)
  ADD COLUMN IF NOT EXISTS tmj_normalised_score NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS cerv_normalised_score NUMERIC(5,2),

  -- Profile classification (VARCHAR(40) per ERRATA §2.2 note)
  ADD COLUMN IF NOT EXISTS profile_type VARCHAR(40),

  -- Protocol assignments
  ADD COLUMN IF NOT EXISTS tmj_protocol_assigned  BOOLEAN,
  ADD COLUMN IF NOT EXISTS cerv_protocol_assigned BOOLEAN,

  -- Asymmetry computed flag (set by generateAndSaveProfile after asym_* fields are written)
  ADD COLUMN IF NOT EXISTS asym_contralateral_pattern BOOLEAN,

  -- Profile paragraph (generated text block, stored as plain text)
  ADD COLUMN IF NOT EXISTS profile_paragraph TEXT,

  -- Timestamps
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at   TIMESTAMPTZ;
