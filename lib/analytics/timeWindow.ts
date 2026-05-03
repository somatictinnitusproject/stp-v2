// lib/analytics/timeWindow.ts
// ─────────────────────────────────────────────────────────────────
// Time-window filtering for analytics log arrays.
// All boundaries are inclusive on the near end and computed from
// today (the day the function is called).
//
// Window boundaries (D12):
//   '7d':  log_date >= today − 6 days  (7-day inclusive window)
//   '30d': log_date >= today − 29 days
//   '3m':  log_date >= today − 89 days (90-day window)
//   'all': no filter
// ─────────────────────────────────────────────────────────────────

import type { ProgressLog } from './types'

// Convert a Date to a YYYY-MM-DD string in the local timezone.
// Use this everywhere we need to compare against progress_logs.log_date,
// which is stored as a date string reflecting the user's local date.
export function toLocalDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export type TimeWindow = '7d' | '30d' | '3m' | 'all'

export const WINDOW_OPTIONS: { value: TimeWindow; label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '3m', label: '3 months' },
  { value: 'all', label: 'All time' },
]

const CUTOFF_DAYS: Record<Exclude<TimeWindow, 'all'>, number> = {
  '7d': 6,
  '30d': 29,
  '3m': 89,
}

export function filterByWindow(logs: ProgressLog[], window: TimeWindow): ProgressLog[] {
  if (window === 'all') return logs

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const cutoff = new Date(today)
  cutoff.setDate(cutoff.getDate() - CUTOFF_DAYS[window])
  const cutoffStr = toLocalDateStr(cutoff)

  return logs.filter((log) => log.log_date >= cutoffStr)
}
