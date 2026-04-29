-- M13i.A: Apply NOT NULL DEFAULT now() to framework_progress.phase_started_at
-- Per errata P3-19 and P3-20.
-- Doc 7 specified started_at TIMESTAMPTZ NOT NULL DEFAULT now().
-- The live column was created as phase_started_at TIMESTAMPTZ NULL DEFAULT NULL.
-- Both the constraint and default were missed at table-creation time.
-- Backfill: any existing NULL rows are set to created_at — conservative,
-- preserves seeded test data from M13b/M13h. Production accounts won't have
-- NULL rows since the constraint will be in place from this migration onward.

-- Step 1: backfill NULL rows from created_at
UPDATE framework_progress
SET phase_started_at = created_at
WHERE phase_started_at IS NULL;

-- Step 2: set NOT NULL constraint (will fail loudly if backfill missed any row)
ALTER TABLE framework_progress
ALTER COLUMN phase_started_at SET NOT NULL;

-- Step 3: set DEFAULT now() so future inserts that omit the column don't
-- recreate the silent-fail problem.
ALTER TABLE framework_progress
ALTER COLUMN phase_started_at SET DEFAULT now();

COMMENT ON COLUMN framework_progress.phase_started_at IS
'When the member started the framework. Originally specified in Doc 7
as started_at NOT NULL DEFAULT now(); the column drifted to
phase_started_at NULL DEFAULT NULL and was corrected in M13i.A
per errata P3-19 and P3-20.';
