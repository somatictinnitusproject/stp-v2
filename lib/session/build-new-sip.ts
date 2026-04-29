// /lib/session/build-new-sip.ts
// ─────────────────────────────────────────────────────────────────────────────
// Pure helper: computes the next session_in_progress JSONB value given the
// current DB row and the incoming exerciseId.
//
// Handles:
//   - Null SIP       → fresh init with exerciseId as first completion
//   - Stale SIP      → same as null (stale-clear on the API side)
//   - Non-stale, new → append exerciseId
//   - Non-stale, dup → no-op (idempotent)
//
// Called by both /api/session/complete and /api/session/finalise so the
// stale-clear / dedupe / fresh-init logic lives in one tested place.
// ─────────────────────────────────────────────────────────────────────────────

export interface SessionInProgressShape {
  session_date: string          // YYYY-MM-DD UTC
  completed_exercises: string[]
  started_at: string            // ISO timestamp
}

export interface BuildSipResult {
  sip: SessionInProgressShape
  wasInitialised: boolean  // true if the SIP was null or stale — used by finalise to compute duration
}

/**
 * Pure function. Returns the next session_in_progress value after an exercise
 * is completed. Also returns whether the SIP was freshly initialised (needed
 * by the finalise endpoint to decide whether duration is computable).
 */
export function buildNewSip(
  existing: Record<string, unknown> | null,
  exerciseId: string,
  today: string,
  nowIso: string,
): BuildSipResult {
  const sip = existing as SessionInProgressShape | null

  // Null or stale → fresh init
  if (!sip || sip.session_date !== today) {
    return {
      sip: {
        session_date: today,
        completed_exercises: [exerciseId],
        started_at: nowIso,
      },
      wasInitialised: true,
    }
  }

  // Today's session — dedupe then append
  const completedExercises = sip.completed_exercises ?? []
  const alreadyPresent = completedExercises.includes(exerciseId)

  return {
    sip: {
      session_date: today,
      completed_exercises: alreadyPresent
        ? completedExercises
        : [...completedExercises, exerciseId],
      started_at: sip.started_at,
    },
    wasInitialised: false,
  }
}
