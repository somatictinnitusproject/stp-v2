-- M13i: is_shorter_session flag on session_logs
--
-- Marks whether a session_logs row represents a full session or the
-- shorter-session option (per pre-launch §4.2 + M13i locked decisions).
-- Default false — existing rows are full sessions.
-- Members never see this; it's for founder-facing analytics queries
-- that track shorter-session frequency without surfacing it visually.

ALTER TABLE session_logs
  ADD COLUMN IF NOT EXISTS is_shorter_session BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN session_logs.is_shorter_session IS
  'TRUE when the row was written by a /session/short finalise call.
   FALSE for full /session finalises. Default FALSE — existing rows
   from before M13i are all full sessions.';
