-- TFI (Tinnitus Functional Index) response capture infrastructure.
-- Creates tfi_responses table, RLS policies, adds tfi_dismissals JSONB
-- to framework_progress, and an index on the common query pattern.
--
-- Run manually in Supabase SQL editor.
-- Per Meikle et al. 2012 — 25-item validated outcome instrument.

-- ─────────────────────────────────────────────────────────────────
-- 1. tfi_responses table
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tfi_responses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  capture_point VARCHAR(20) NOT NULL CHECK (
    capture_point IN ('intake', 'completion', 'follow_up_6m')
  ),

  -- 25 individual items, 0–10 each (Meikle 2012).
  -- Items 4, 5, 14, 15 are reverse-scored by the application before
  -- storing subscale scores; raw item values stored as entered.
  item_1  SMALLINT NOT NULL CHECK (item_1  BETWEEN 0 AND 10),
  item_2  SMALLINT NOT NULL CHECK (item_2  BETWEEN 0 AND 10),
  item_3  SMALLINT NOT NULL CHECK (item_3  BETWEEN 0 AND 10),
  item_4  SMALLINT NOT NULL CHECK (item_4  BETWEEN 0 AND 10),
  item_5  SMALLINT NOT NULL CHECK (item_5  BETWEEN 0 AND 10),
  item_6  SMALLINT NOT NULL CHECK (item_6  BETWEEN 0 AND 10),
  item_7  SMALLINT NOT NULL CHECK (item_7  BETWEEN 0 AND 10),
  item_8  SMALLINT NOT NULL CHECK (item_8  BETWEEN 0 AND 10),
  item_9  SMALLINT NOT NULL CHECK (item_9  BETWEEN 0 AND 10),
  item_10 SMALLINT NOT NULL CHECK (item_10 BETWEEN 0 AND 10),
  item_11 SMALLINT NOT NULL CHECK (item_11 BETWEEN 0 AND 10),
  item_12 SMALLINT NOT NULL CHECK (item_12 BETWEEN 0 AND 10),
  item_13 SMALLINT NOT NULL CHECK (item_13 BETWEEN 0 AND 10),
  item_14 SMALLINT NOT NULL CHECK (item_14 BETWEEN 0 AND 10),
  item_15 SMALLINT NOT NULL CHECK (item_15 BETWEEN 0 AND 10),
  item_16 SMALLINT NOT NULL CHECK (item_16 BETWEEN 0 AND 10),
  item_17 SMALLINT NOT NULL CHECK (item_17 BETWEEN 0 AND 10),
  item_18 SMALLINT NOT NULL CHECK (item_18 BETWEEN 0 AND 10),
  item_19 SMALLINT NOT NULL CHECK (item_19 BETWEEN 0 AND 10),
  item_20 SMALLINT NOT NULL CHECK (item_20 BETWEEN 0 AND 10),
  item_21 SMALLINT NOT NULL CHECK (item_21 BETWEEN 0 AND 10),
  item_22 SMALLINT NOT NULL CHECK (item_22 BETWEEN 0 AND 10),
  item_23 SMALLINT NOT NULL CHECK (item_23 BETWEEN 0 AND 10),
  item_24 SMALLINT NOT NULL CHECK (item_24 BETWEEN 0 AND 10),
  item_25 SMALLINT NOT NULL CHECK (item_25 BETWEEN 0 AND 10),

  -- Computed subscale scores (0–100), set by application on insert.
  subscale_intrusive        NUMERIC(5,2) NOT NULL,
  subscale_sense_of_control NUMERIC(5,2) NOT NULL,
  subscale_cognitive        NUMERIC(5,2) NOT NULL,
  subscale_sleep            NUMERIC(5,2) NOT NULL,
  subscale_auditory         NUMERIC(5,2) NOT NULL,
  subscale_relaxation       NUMERIC(5,2) NOT NULL,
  subscale_quality_of_life  NUMERIC(5,2) NOT NULL,
  subscale_emotional        NUMERIC(5,2) NOT NULL,

  -- Computed total score (0–100), mean of 8 subscale scores.
  total_score NUMERIC(5,2) NOT NULL,

  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One response per member per capture point.
  UNIQUE(user_id, capture_point)
);

-- ─────────────────────────────────────────────────────────────────
-- 2. Enable RLS
-- ─────────────────────────────────────────────────────────────────

ALTER TABLE tfi_responses ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────
-- 3. RLS policies
--    SELECT and INSERT scoped to own rows.
--    No UPDATE policy (responses are immutable after submission).
--    No DELETE policy for authenticated users (service role only).
-- ─────────────────────────────────────────────────────────────────

CREATE POLICY "tfi_responses_select_own"
  ON tfi_responses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "tfi_responses_insert_own"
  ON tfi_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────
-- 4. Add tfi_dismissals to framework_progress
--    Stores dismissal timestamps keyed by capture_point.
--    e.g. { "intake": "2026-05-05T12:00:00Z" }
--    Empty object {} means nothing dismissed yet.
-- ─────────────────────────────────────────────────────────────────

ALTER TABLE framework_progress
  ADD COLUMN IF NOT EXISTS tfi_dismissals JSONB NOT NULL DEFAULT '{}'::jsonb;

-- ─────────────────────────────────────────────────────────────────
-- 5. Index for common query: member checking own capture points
-- ─────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_tfi_responses_user_capture
  ON tfi_responses(user_id, capture_point);
