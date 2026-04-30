// /lib/session/get-session-state.ts
// ─────────────────────────────────────────────────────────────────────────────
// Pure helper: maps member state to a rendered /session branch.
// Called server-side from /app/session/page.tsx after phase gating and
// stale-clear have already been handled upstream.
// ─────────────────────────────────────────────────────────────────────────────

import type { FrameworkProgressRow } from '@/lib/scoring/types'

export type SessionStateKind = 'fresh' | 'resume' | 'complete' | 'empty'

export interface SessionState {
  kind: SessionStateKind
  completedIds: string[]
  activeIndex: number  // index into sessionList; -1 when complete or empty
}

// Shape of the session_in_progress JSONB stored in framework_progress.
// Written by M13h; read here for resume/complete detection.
interface SessionInProgress {
  session_date: string          // YYYY-MM-DD UTC
  completed_exercises: string[]
  started_at: string            // ISO timestamp
}

/**
 * Pure function. Computes the rendered state of /session for a member.
 * Phase gating (current_phase < 3) and stale-clear (session_in_progress
 * with a past date) must be handled upstream before this is called.
 *
 * 'empty'    — sessionList.length === 0 (theoretical; should not fire for Phase 3)
 * 'fresh'    — no in-progress session today; member starts from the top
 * 'resume'   — partial completion today; first non-completed item is active
 * 'complete' — all items done today; render the completion screen
 */
export function getSessionState(
  framework: Pick<FrameworkProgressRow, 'session_in_progress'>,
  sessionList: Array<{ id: string }>,
  today: string,
): SessionState {
  if (sessionList.length === 0) {
    return { kind: 'empty', completedIds: [], activeIndex: -1 }
  }

  const sip = framework.session_in_progress as SessionInProgress | null

  if (!sip || sip.session_date !== today) {
    return { kind: 'fresh', completedIds: [], activeIndex: 0 }
  }

  const completedIds = sip.completed_exercises ?? []
  const completedSet = new Set(completedIds)
  const allDone = sessionList.every((item) => completedSet.has(item.id))

  if (allDone) {
    return { kind: 'complete', completedIds, activeIndex: -1 }
  }

  const activeIndex = sessionList.findIndex((item) => !completedSet.has(item.id))
  return { kind: 'resume', completedIds, activeIndex }
}
