-- Sequential protocol (Option 1) cervical phase tracking columns.
-- Only written for dual-driver members who chose to run jaw and cervical
-- protocols separately. Single-driver members and Options 2/3 leave both NULL.
--
-- cerv_sequential_phase_start  — set when the member taps "Begin cervical release"
--                                on the Phase 3 page, after jaw resistance has started.
--                                Gates cervical release exercises entering /session.
--
-- cerv_sequential_resistance_start — set when the member taps "Begin cervical
--                                     resistance phase", mirroring the jaw resistance
--                                     unlock flow. Gates cervical retraining exercises
--                                     (E13/E14/E15) entering /session.

ALTER TABLE framework_progress
  ADD COLUMN IF NOT EXISTS cerv_sequential_phase_start TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS cerv_sequential_resistance_start TIMESTAMPTZ DEFAULT NULL;

COMMENT ON COLUMN framework_progress.cerv_sequential_phase_start IS
  'Option 1 (Sequential) dual-driver only. Timestamp when the member began the
   cervical release phase. NULL for all other protocol options and single-driver
   members. When non-null, cervical release exercises enter the daily session
   alongside jaw release + jaw resistance.';

COMMENT ON COLUMN framework_progress.cerv_sequential_resistance_start IS
  'Option 1 (Sequential) dual-driver only. Timestamp when the member began the
   cervical resistance phase (E13/E14/E15). Set after cerv_sequential_phase_start.
   NULL for all other protocol options and single-driver members.';
