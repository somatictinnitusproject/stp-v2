import { describe, it, expect } from 'vitest'
import {
  thisWeekVsLastWeek,
  bestWeekRollingAverage,
  lowestLoudness,
  loudnessDistribution,
} from '../aggregates'
import type { ProgressLog } from '../types'

function makeLog(log_date: string, tinnitus_score = 5): ProgressLog {
  return {
    id: log_date,
    user_id: 'u1',
    log_date,
    tinnitus_score,
    jaw_tension: 5,
    neck_tension: 5,
    stress_level: 5,
    sleep_quality: 5,
    notes: null,
    created_at: `${log_date}T12:00:00Z`,
  }
}

// ── thisWeekVsLastWeek ────────────────────────────────────────────

describe('thisWeekVsLastWeek', () => {
  it('< 2 logs in this week → thisWeek.average is null', () => {
    // 2026-04-27 is a Monday. today = 2026-04-29 (Wednesday).
    // This week (Mon 27–Wed 29): 1 log → average null.
    // Last week (Mon 20–Sun 26): 3 logs → average not null.
    const today = '2026-04-29'
    const logs = [
      makeLog('2026-04-29', 4),
      makeLog('2026-04-21', 6),
      makeLog('2026-04-22', 4),
      makeLog('2026-04-24', 5),
    ]
    const result = thisWeekVsLastWeek(logs, today)
    expect(result.thisWeek.average).toBeNull()
    expect(result.thisWeek.count).toBe(1)
    expect(result.lastWeek.average).not.toBeNull()
    expect(result.lastWeek.count).toBe(3)
    expect(result.change).toBeNull()
  })

  it('< 2 logs in last week → lastWeek.average is null', () => {
    // today = 2026-04-29. This week: 3 logs. Last week: 1 log.
    const today = '2026-04-29'
    const logs = [
      makeLog('2026-04-27', 3),
      makeLog('2026-04-28', 4),
      makeLog('2026-04-29', 5),
      makeLog('2026-04-21', 6),
    ]
    const result = thisWeekVsLastWeek(logs, today)
    expect(result.thisWeek.average).not.toBeNull()
    expect(result.lastWeek.average).toBeNull()
    expect(result.change).toBeNull()
  })
})

// ── bestWeekRollingAverage ────────────────────────────────────────

describe('bestWeekRollingAverage', () => {
  it('< 7 logs total → null', () => {
    const logs = [
      makeLog('2026-01-01', 3),
      makeLog('2026-01-02', 4),
      makeLog('2026-01-03', 3),
    ]
    expect(bestWeekRollingAverage(logs)).toBeNull()
  })

  it('exactly 7 logs on 7 consecutive days → single window returned', () => {
    const logs = [
      makeLog('2026-01-01', 4),
      makeLog('2026-01-02', 3),
      makeLog('2026-01-03', 5),
      makeLog('2026-01-04', 2),
      makeLog('2026-01-05', 6),
      makeLog('2026-01-06', 4),
      makeLog('2026-01-07', 3),
    ]
    const result = bestWeekRollingAverage(logs)
    expect(result).not.toBeNull()
    expect(result!.endDate).toBe('2026-01-07')
    // sum = 4+3+5+2+6+4+3 = 27, avg = 27/7
    expect(result!.value).toBeCloseTo(27 / 7)
  })
})

// ── lowestLoudness ────────────────────────────────────────────────

describe('lowestLoudness', () => {
  it('tie on lowest → earliest date wins', () => {
    const logs = [
      makeLog('2026-02-10', 2),
      makeLog('2026-02-05', 2),
      makeLog('2026-02-15', 3),
    ]
    const result = lowestLoudness(logs)
    expect(result).not.toBeNull()
    expect(result!.value).toBe(2)
    expect(result!.date).toBe('2026-02-05')
  })
})

// ── loudnessDistribution ──────────────────────────────────────────

describe('loudnessDistribution', () => {
  it('even count → split evenly between earlier and recent', () => {
    // 4 logs sorted by date: earlier = [score3, score5], recent = [score2, score4]
    const logs = [
      makeLog('2026-01-01', 3),
      makeLog('2026-01-02', 5),
      makeLog('2026-01-03', 2),
      makeLog('2026-01-04', 4),
    ]
    const result = loudnessDistribution(logs)
    expect(result.find((r) => r.score === 3)?.earlier).toBe(1)
    expect(result.find((r) => r.score === 3)?.recent).toBe(0)
    expect(result.find((r) => r.score === 5)?.earlier).toBe(1)
    expect(result.find((r) => r.score === 5)?.recent).toBe(0)
    expect(result.find((r) => r.score === 2)?.earlier).toBe(0)
    expect(result.find((r) => r.score === 2)?.recent).toBe(1)
    expect(result.find((r) => r.score === 4)?.earlier).toBe(0)
    expect(result.find((r) => r.score === 4)?.recent).toBe(1)
  })

  it('odd count → middle log goes to recent half', () => {
    // 5 logs: mid = floor(5/2) = 2. earlier = [0..1], recent = [2..4].
    // Sorted: score3(01), score5(02), score7(03 — middle → recent), score4(04), score2(05)
    const logs = [
      makeLog('2026-01-01', 3),
      makeLog('2026-01-02', 5),
      makeLog('2026-01-03', 7),
      makeLog('2026-01-04', 4),
      makeLog('2026-01-05', 2),
    ]
    const result = loudnessDistribution(logs)
    // earlier: [score3, score5] — score7 not in earlier
    expect(result.find((r) => r.score === 7)?.earlier).toBe(0)
    expect(result.find((r) => r.score === 7)?.recent).toBe(1)
    expect(result.find((r) => r.score === 3)?.earlier).toBe(1)
    expect(result.find((r) => r.score === 3)?.recent).toBe(0)
  })

  it('< 2 logs → empty array', () => {
    expect(loudnessDistribution([])).toEqual([])
    expect(loudnessDistribution([makeLog('2026-01-01', 5)])).toEqual([])
  })
})
