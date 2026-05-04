import { describe, it, expect } from 'vitest'
import { formatTimeAgo } from '../format-time-ago'

const NOW = new Date('2026-05-04T12:00:00Z')
const ago = (sec: number) =>
  new Date(NOW.getTime() - sec * 1000).toISOString()

describe('formatTimeAgo', () => {
  it('returns "just now" under 45 seconds', () => {
    expect(formatTimeAgo(ago(10), NOW)).toBe('just now')
    expect(formatTimeAgo(ago(44), NOW)).toBe('just now')
  })

  it('returns minutes for under 1 hour', () => {
    expect(formatTimeAgo(ago(60), NOW)).toBe('1 minute ago')
    expect(formatTimeAgo(ago(60 * 5), NOW)).toBe('5 minutes ago')
    expect(formatTimeAgo(ago(60 * 59), NOW)).toBe('59 minutes ago')
  })

  it('returns hours for under 24 hours', () => {
    expect(formatTimeAgo(ago(60 * 60), NOW)).toBe('1 hour ago')
    expect(formatTimeAgo(ago(60 * 60 * 3), NOW)).toBe('3 hours ago')
  })

  it('returns "yesterday" for exactly 1 day', () => {
    expect(formatTimeAgo(ago(60 * 60 * 24), NOW)).toBe('yesterday')
  })

  it('returns days for 2 to 6 days', () => {
    expect(formatTimeAgo(ago(60 * 60 * 24 * 3), NOW)).toBe('3 days ago')
    expect(formatTimeAgo(ago(60 * 60 * 24 * 6), NOW)).toBe('6 days ago')
  })

  it('returns weeks for 1 to 4 weeks', () => {
    expect(formatTimeAgo(ago(60 * 60 * 24 * 7), NOW)).toBe('1 week ago')
    expect(formatTimeAgo(ago(60 * 60 * 24 * 21), NOW)).toBe('3 weeks ago')
  })

  it('returns months past 4 weeks', () => {
    expect(formatTimeAgo(ago(60 * 60 * 24 * 60), NOW)).toBe('2 months ago')
  })

  it('returns years past 12 months', () => {
    expect(formatTimeAgo(ago(60 * 60 * 24 * 400), NOW)).toBe('1 year ago')
    expect(formatTimeAgo(ago(60 * 60 * 24 * 365 * 3), NOW)).toBe(
      '3 years ago',
    )
  })
})
