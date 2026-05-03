import { describe, it, expect } from 'vitest'
import { currentLoggingStreak, longestLoggingStreak, longestSubNStreak } from '../streaks'
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

function daysAgo(n: number): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - n)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// ── currentLoggingStreak ──────────────────────────────────────────

describe('currentLoggingStreak', () => {
  it('today logged → counts from today', () => {
    const logs = [makeLog(daysAgo(0)), makeLog(daysAgo(1)), makeLog(daysAgo(2))]
    expect(currentLoggingStreak(logs)).toBe(3)
  })

  it('today not logged but yesterday logged → counts from yesterday', () => {
    const logs = [makeLog(daysAgo(1)), makeLog(daysAgo(2)), makeLog(daysAgo(3))]
    expect(currentLoggingStreak(logs)).toBe(3)
  })

  it('gap of 1 day breaks streak', () => {
    // today logged, yesterday not, 2 days ago logged → streak is 1
    const logs = [makeLog(daysAgo(0)), makeLog(daysAgo(2))]
    expect(currentLoggingStreak(logs)).toBe(1)
  })

  it('0 logs → 0', () => {
    expect(currentLoggingStreak([])).toBe(0)
  })

  it('same day logged twice → counts as 1 day', () => {
    const today = daysAgo(0)
    const logs = [
      { ...makeLog(today), id: 'a' },
      { ...makeLog(today), id: 'b' },
    ]
    expect(currentLoggingStreak(logs)).toBe(1)
  })
})

// ── longestLoggingStreak ──────────────────────────────────────────

describe('longestLoggingStreak', () => {
  it('3 separate runs → returns the longest', () => {
    // Run A: 3 days ending 20 days ago
    // Run B: 5 days ending 10 days ago
    // Run C: 2 days ending 2 days ago
    const logs = [
      makeLog(daysAgo(22)),
      makeLog(daysAgo(21)),
      makeLog(daysAgo(20)),
      makeLog(daysAgo(14)),
      makeLog(daysAgo(13)),
      makeLog(daysAgo(12)),
      makeLog(daysAgo(11)),
      makeLog(daysAgo(10)),
      makeLog(daysAgo(3)),
      makeLog(daysAgo(2)),
    ]
    const result = longestLoggingStreak(logs)
    expect(result.length).toBe(5)
    expect(result.endDate).toBe(daysAgo(10))
  })
})

// ── longestSubNStreak ─────────────────────────────────────────────

describe('longestSubNStreak', () => {
  it('threshold=4, mixed loudness → counts only consecutive sub-4 days', () => {
    // Scores over 5 consecutive days: 2, 3, 5, 2, 2
    // Qualifying runs: [2,3] (len 2), [2,2] (len 2) — max = 2
    const logs = [
      makeLog(daysAgo(4), 2),
      makeLog(daysAgo(3), 3),
      makeLog(daysAgo(2), 5),
      makeLog(daysAgo(1), 2),
      makeLog(daysAgo(0), 2),
    ]
    const result = longestSubNStreak(logs, 4)
    expect(result.length).toBe(2)
  })

  it('same day logged twice with one >4 and one ≤4 → uses lowest', () => {
    // Yesterday: two logs, scores 6 and 3. Lowest = 3 (≤4) → qualifies.
    // Today: score 2 → qualifies.
    // Both days consecutive → streak = 2.
    const yesterday = daysAgo(1)
    const today = daysAgo(0)
    const logs = [
      makeLog(yesterday, 6),
      { ...makeLog(yesterday, 3), id: `${yesterday}-b` },
      makeLog(today, 2),
    ]
    const result = longestSubNStreak(logs, 4)
    expect(result.length).toBe(2)
  })
})
