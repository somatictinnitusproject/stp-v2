// /lib/session/get-today-status.test.ts
// ─────────────────────────────────────────────────────────────────────────────
// Tests for getTodayStatus — the Phase 3 session state helper.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest'
import { getTodayStatus } from './get-today-status'

const TODAY = '2026-04-29'
const YESTERDAY = '2026-04-28'

function makeSip(overrides: Partial<{ session_date: string; completed_exercises: string[] }> = {}) {
  return {
    session_date: TODAY,
    completed_exercises: ['D4_heat_application', 'D5_temporalis_release'],
    ...overrides,
  }
}

describe('getTodayStatus', () => {
  it('returns done when todaysSessionLog is present', () => {
    const result = getTodayStatus({
      sessionInProgress: null,
      todaysSessionLog: { completed_at: '2026-04-29T10:00:00Z' },
      totalExerciseCount: 13,
      today: TODAY,
    })
    expect(result).toEqual({ kind: 'done', completedAt: '2026-04-29T10:00:00Z' })
  })

  it('returns done even when sessionInProgress is also present (session_logs takes precedence)', () => {
    const result = getTodayStatus({
      sessionInProgress: makeSip(),
      todaysSessionLog: { completed_at: '2026-04-29T11:30:00Z' },
      totalExerciseCount: 13,
      today: TODAY,
    })
    expect(result).toEqual({ kind: 'done', completedAt: '2026-04-29T11:30:00Z' })
  })

  it('returns in_progress with correct counts when SIP exists for today', () => {
    const result = getTodayStatus({
      sessionInProgress: makeSip({ completed_exercises: ['D4_heat_application', 'D5_temporalis_release'] }),
      todaysSessionLog: null,
      totalExerciseCount: 13,
      today: TODAY,
    })
    expect(result).toEqual({ kind: 'in_progress', completedCount: 2, totalCount: 13 })
  })

  it('returns not_started when SIP is null and no session log', () => {
    const result = getTodayStatus({
      sessionInProgress: null,
      todaysSessionLog: null,
      totalExerciseCount: 13,
      today: TODAY,
    })
    expect(result).toEqual({ kind: 'not_started' })
  })

  it('returns not_started when SIP date is stale (yesterday)', () => {
    const result = getTodayStatus({
      sessionInProgress: makeSip({ session_date: YESTERDAY }),
      todaysSessionLog: null,
      totalExerciseCount: 13,
      today: TODAY,
    })
    expect(result).toEqual({ kind: 'not_started' })
  })

  it('returns in_progress with completedCount=0 when SIP exists with empty completed array', () => {
    const result = getTodayStatus({
      sessionInProgress: makeSip({ completed_exercises: [] }),
      todaysSessionLog: null,
      totalExerciseCount: 10,
      today: TODAY,
    })
    expect(result).toEqual({ kind: 'in_progress', completedCount: 0, totalCount: 10 })
  })

  it('handles SIP missing completed_exercises field gracefully', () => {
    const sipWithoutCompleted = { session_date: TODAY } as Record<string, unknown>
    const result = getTodayStatus({
      sessionInProgress: sipWithoutCompleted,
      todaysSessionLog: null,
      totalExerciseCount: 7,
      today: TODAY,
    })
    expect(result).toEqual({ kind: 'in_progress', completedCount: 0, totalCount: 7 })
  })

  it('returns not_started when totalExerciseCount is 0 and no log or SIP', () => {
    const result = getTodayStatus({
      sessionInProgress: null,
      todaysSessionLog: null,
      totalExerciseCount: 0,
      today: TODAY,
    })
    expect(result).toEqual({ kind: 'not_started' })
  })
})
