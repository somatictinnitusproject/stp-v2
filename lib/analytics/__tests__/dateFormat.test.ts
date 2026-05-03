import { describe, it, expect } from 'vitest'
import { formatChartDate, formatLongChartDate } from '../dateFormat'

describe('formatChartDate', () => {
  it("'2026-01-15' returns '15 Jan'", () => {
    expect(formatChartDate('2026-01-15')).toBe('15 Jan')
  })

  it("'2026-12-03' returns '03 Dec'", () => {
    expect(formatChartDate('2026-12-03')).toBe('03 Dec')
  })
})

describe('formatLongChartDate', () => {
  it("'2026-06-20' returns '20 Jun 2026'", () => {
    expect(formatLongChartDate('2026-06-20')).toBe('20 Jun 2026')
  })
})
