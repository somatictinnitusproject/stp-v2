// lib/analytics/streaks.ts
// ─────────────────────────────────────────────────────────────────
// Streak helpers for the analytics feature. All pure functions —
// no DB calls. Input: ProgressLog[] sorted or unsorted.
//
// Streak rules (D9):
//   currentLoggingStreak  — start from today; if today not logged,
//     start from yesterday. Walk backwards counting consecutive
//     logged calendar days. Multiple logs same day = 1 day.
//   longestLoggingStreak  — dedupe log_dates, find longest run of
//     consecutive calendar days across full log history.
//   longestSubNStreak     — dedupe same-day to lowest tinnitus_score,
//     count longest consecutive run where score <= threshold.
// ─────────────────────────────────────────────────────────────────

import type { ProgressLog } from './types'
import { toLocalDateStr } from './timeWindow'

export function currentLoggingStreak(logs: ProgressLog[]): number {
  if (logs.length === 0) return 0

  const loggedDays = new Set(logs.map((l) => l.log_date))

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = toLocalDateStr(today)

  const cursor = new Date(today)
  if (!loggedDays.has(todayStr)) {
    cursor.setDate(cursor.getDate() - 1)
  }

  let streak = 0
  while (true) {
    const dateStr = toLocalDateStr(cursor)
    if (!loggedDays.has(dateStr)) break
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

export function longestLoggingStreak(logs: ProgressLog[]): {
  length: number
  endDate: string | null
} {
  if (logs.length === 0) return { length: 0, endDate: null }

  const days = Array.from(new Set(logs.map((l) => l.log_date))).sort()

  let maxLength = 1
  let maxEndDate = days[0]
  let currentLength = 1
  let currentEndDate = days[0]

  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1])
    const curr = new Date(days[i])
    const diff = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24))

    if (diff === 1) {
      currentLength++
      currentEndDate = days[i]
    } else {
      currentLength = 1
      currentEndDate = days[i]
    }

    if (currentLength > maxLength) {
      maxLength = currentLength
      maxEndDate = currentEndDate
    }
  }

  return { length: maxLength, endDate: maxEndDate }
}

export function longestSubNStreak(
  logs: ProgressLog[],
  threshold: number
): { length: number; endDate: string | null } {
  if (logs.length === 0) return { length: 0, endDate: null }

  // Dedupe same day to lowest tinnitus_score
  const dayMap = new Map<string, number>()
  for (const log of logs) {
    const existing = dayMap.get(log.log_date)
    if (existing === undefined || log.tinnitus_score < existing) {
      dayMap.set(log.log_date, log.tinnitus_score)
    }
  }

  // Filter to qualifying days and sort ASC
  const qualifying = Array.from(dayMap.entries())
    .filter(([, score]) => score <= threshold)
    .sort((a, b) => a[0].localeCompare(b[0]))

  if (qualifying.length === 0) return { length: 0, endDate: null }

  let maxLength = 1
  let maxEndDate = qualifying[0][0]
  let currentLength = 1
  let currentEndDate = qualifying[0][0]

  for (let i = 1; i < qualifying.length; i++) {
    const prev = new Date(qualifying[i - 1][0])
    const curr = new Date(qualifying[i][0])
    const diff = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24))

    if (diff === 1) {
      currentLength++
      currentEndDate = qualifying[i][0]
    } else {
      currentLength = 1
      currentEndDate = qualifying[i][0]
    }

    if (currentLength > maxLength) {
      maxLength = currentLength
      maxEndDate = currentEndDate
    }
  }

  return { length: maxLength, endDate: maxEndDate }
}
