import { describe, it, expect } from 'vitest'
import { getBodyPreview } from '../preview'

describe('getBodyPreview', () => {
  it('returns short bodies unchanged', () => {
    expect(getBodyPreview('Hello world')).toBe('Hello world')
  })

  it('flattens newlines into spaces', () => {
    expect(getBodyPreview('Line one\nLine two')).toBe('Line one Line two')
  })

  it('collapses multiple spaces', () => {
    expect(getBodyPreview('lots    of   spaces')).toBe('lots of spaces')
  })

  it('trims surrounding whitespace', () => {
    expect(getBodyPreview('  padded  ')).toBe('padded')
  })

  it('truncates long bodies with ellipsis', () => {
    const long = 'a'.repeat(200)
    const result = getBodyPreview(long)
    expect(result.endsWith('…')).toBe(true)
    expect(result.length).toBeLessThanOrEqual(121)
  })

  it('cuts at a word boundary when one is reasonable', () => {
    const long = 'word '.repeat(40).trim()
    const result = getBodyPreview(long)
    // Should end with a complete word + ellipsis, no partial word.
    expect(result).toMatch(/word…$/)
  })

  it('still truncates when no word boundary exists in range', () => {
    const long = 'a'.repeat(120) + ' tail'
    const result = getBodyPreview(long)
    expect(result.endsWith('…')).toBe(true)
  })
})
