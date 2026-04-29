// /lib/session/get-today-status.ts
// ─────────────────────────────────────────────────────────────────────────────
// Pure helper: determines a Phase 3 member's session state for today.
// Used by /dashboard and /session to share consistent state detection.
//
// Branch order matters:
//   1. session_logs for today → 'done' (authoritative completion signal)
//   2. session_in_progress.session_date === today → 'in_progress'
//   3. Otherwise → 'not_started'
//
// session_logs takes precedence over session_in_progress to handle the
// inconsistency state where session_logs was written but session_in_progress
// failed to clear (the M13h finalise sequential-write recovery case).
// ─────────────────────────────────────────────────────────────────────────────

export type TodayStatus =
  | { kind: 'not_started' }
  | { kind: 'in_progress'; completedCount: number; totalCount: number }
  | { kind: 'done'; completedAt: string }

export interface GetTodayStatusInput {
  sessionInProgress: Record<string, unknown> | null
  todaysSessionLog: { completed_at: string } | null
  totalExerciseCount: number
  today: string
}

export function getTodayStatus(input: GetTodayStatusInput): TodayStatus {
  if (input.todaysSessionLog) {
    return { kind: 'done', completedAt: input.todaysSessionLog.completed_at }
  }

  const sip = input.sessionInProgress as null | {
    session_date: string
    completed_exercises: string[]
  }

  if (sip && sip.session_date === input.today) {
    const completedCount = (sip.completed_exercises ?? []).length
    return {
      kind: 'in_progress',
      completedCount,
      totalCount: input.totalExerciseCount,
    }
  }

  return { kind: 'not_started' }
}
