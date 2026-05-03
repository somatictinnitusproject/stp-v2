import { describe, it, expect } from 'vitest'
import { filterByWindow } from '../timeWindow'
import type { ProgressLog } from '../types'

function makeLog(log_date: string): ProgressLog {
  return {
    id: log_date,
    user_id: 'u1',
    log_date,
    tinnitus_score: 5,
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

describe('filterByWindow', () => {
  it('7d: log exactly 6 days ago is included; 7 days ago is excluded', () => {
    const logs = [makeLog(daysAgo(6)), makeLog(daysAgo(7))]
    const result = filterByWindow(logs, '7d')
    expect(result.map((l) => l.log_date)).toContain(daysAgo(6))
    expect(result.map((l) => l.log_date)).not.toContain(daysAgo(7))
  })

  it('30d: log exactly 29 days ago is included; 30 days ago is excluded', () => {
    const logs = [makeLog(daysAgo(29)), makeLog(daysAgo(30))]
    const result = filterByWindow(logs, '30d')
    expect(result.map((l) => l.log_date)).toContain(daysAgo(29))
    expect(result.map((l) => l.log_date)).not.toContain(daysAgo(30))
  })

  it('3m: log exactly 89 days ago is included; 90 days ago is excluded', () => {
    const logs = [makeLog(daysAgo(89)), makeLog(daysAgo(90))]
    const result = filterByWindow(logs, '3m')
    expect(result.map((l) => l.log_date)).toContain(daysAgo(89))
    expect(result.map((l) => l.log_date)).not.toContain(daysAgo(90))
  })

  it('all: no filter, returns input unchanged', () => {
    const logs = [makeLog(daysAgo(500)), makeLog(daysAgo(1000)), makeLog(daysAgo(0))]
    const result = filterByWindow(logs, 'all')
    expect(result).toHaveLength(3)
    expect(result).toEqual(logs)
  })
})
