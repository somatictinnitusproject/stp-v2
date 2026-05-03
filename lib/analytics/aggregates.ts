// lib/analytics/aggregates.ts
// ─────────────────────────────────────────────────────────────────
// Aggregate helpers for the analytics feature. All pure functions.
//
// weeklyAverage      — average tinnitus_score for a given ISO week
//                      (Monday start). Null if count < 2.
// thisWeekVsLastWeek — compare this ISO week (Mon–today) vs last
//                      full ISO week (Mon–Sun). change = this − last.
// bestWeekRollingAverage — minimum rolling 7-day average across all
//                      windows with ≥7 logs. Null if no such window.
// lowestLoudness     — lowest tinnitus_score; tie → earliest date.
// loudnessDistribution — split logs at count midpoint (odd middle
//                      → recent half); count per score value 1–10.
// ─────────────────────────────────────────────────────────────────

import type { ProgressLog } from './types'

// Shared helper — average from a log slice; null if count < 2.
function avgOrNull(sliceLogs: ProgressLog[]): { average: number | null; count: number } {
  if (sliceLogs.length < 2) return { average: null, count: sliceLogs.length }
  const sum = sliceLogs.reduce((s, l) => s + l.tinnitus_score, 0)
  return { average: sum / sliceLogs.length, count: sliceLogs.length }
}

// weekStartDate: YYYY-MM-DD string representing the Monday of the week.
export function weeklyAverage(
  logs: ProgressLog[],
  weekStartDate: string
): { average: number | null; count: number } {
  const start = new Date(weekStartDate)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const endStr = end.toISOString().split('T')[0]

  const weekLogs = logs.filter((l) => l.log_date >= weekStartDate && l.log_date <= endStr)
  return avgOrNull(weekLogs)
}

export function thisWeekVsLastWeek(
  logs: ProgressLog[],
  today: string
): {
  thisWeek: { average: number | null; count: number }
  lastWeek: { average: number | null; count: number }
  change: number | null
} {
  // ISO week: starts Monday. Find Monday of current week.
  const todayDate = new Date(today)
  const dayOfWeek = todayDate.getDay() // 0=Sun … 6=Sat
  const daysSinceMonday = (dayOfWeek + 6) % 7

  const thisMonday = new Date(todayDate)
  thisMonday.setDate(thisMonday.getDate() - daysSinceMonday)
  const thisMondayStr = thisMonday.toISOString().split('T')[0]

  const lastMonday = new Date(thisMonday)
  lastMonday.setDate(lastMonday.getDate() - 7)
  const lastMondayStr = lastMonday.toISOString().split('T')[0]

  const lastSunday = new Date(thisMonday)
  lastSunday.setDate(lastSunday.getDate() - 1)
  const lastSundayStr = lastSunday.toISOString().split('T')[0]

  const thisWeekLogs = logs.filter((l) => l.log_date >= thisMondayStr && l.log_date <= today)
  const lastWeekLogs = logs.filter((l) => l.log_date >= lastMondayStr && l.log_date <= lastSundayStr)

  const thisWeek = avgOrNull(thisWeekLogs)
  const lastWeek = avgOrNull(lastWeekLogs)

  const change =
    thisWeek.average !== null && lastWeek.average !== null
      ? thisWeek.average - lastWeek.average
      : null

  return { thisWeek, lastWeek, change }
}

// For each log_date, if ≥7 logs exist in the 7-calendar-day window
// ending on that date (inclusive), compute the mean. Return the
// minimum such mean with its end date. Null if no full window exists.
export function bestWeekRollingAverage(
  logs: ProgressLog[]
): { value: number; endDate: string } | null {
  if (logs.length < 7) return null

  const sorted = [...logs].sort((a, b) => a.log_date.localeCompare(b.log_date))

  let bestValue: number | null = null
  let bestEndDate: string | null = null

  for (const anchor of sorted) {
    const endDate = anchor.log_date
    const endMs = new Date(endDate).getTime()
    const startMs = endMs - 6 * 24 * 60 * 60 * 1000
    const startStr = new Date(startMs).toISOString().split('T')[0]

    const windowLogs = sorted.filter((l) => l.log_date >= startStr && l.log_date <= endDate)

    if (windowLogs.length >= 7) {
      const avg = windowLogs.reduce((s, l) => s + l.tinnitus_score, 0) / windowLogs.length
      if (bestValue === null || avg < bestValue) {
        bestValue = avg
        bestEndDate = endDate
      }
    }
  }

  if (bestValue === null || bestEndDate === null) return null
  return { value: bestValue, endDate: bestEndDate }
}

export function lowestLoudness(logs: ProgressLog[]): { value: number; date: string } | null {
  if (logs.length === 0) return null

  const sorted = [...logs].sort((a, b) => {
    if (a.tinnitus_score !== b.tinnitus_score) return a.tinnitus_score - b.tinnitus_score
    return a.log_date.localeCompare(b.log_date)
  })

  return { value: sorted[0].tinnitus_score, date: sorted[0].log_date }
}

// Split logs at count midpoint by log_date ASC. Odd middle → recent half.
// Returns array of { score, earlier, recent } for scores 1–10.
// Empty array if logs.length < 2.
export function loudnessDistribution(
  logs: ProgressLog[]
): { score: number; earlier: number; recent: number }[] {
  if (logs.length < 2) return []

  const sorted = [...logs].sort((a, b) => a.log_date.localeCompare(b.log_date))
  const mid = Math.floor(sorted.length / 2)
  const earlier = sorted.slice(0, mid)
  const recent = sorted.slice(mid)

  const result: { score: number; earlier: number; recent: number }[] = []
  for (let score = 1; score <= 10; score++) {
    result.push({
      score,
      earlier: earlier.filter((l) => l.tinnitus_score === score).length,
      recent: recent.filter((l) => l.tinnitus_score === score).length,
    })
  }
  return result
}
