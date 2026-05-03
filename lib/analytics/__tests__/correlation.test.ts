import { describe, it, expect } from 'vitest'
import { pearsonCorrelation, getCorrelationStrength, getCorrelationDirection } from '../correlation'

describe('pearsonCorrelation', () => {
  it('returns ~1 for perfect positive correlation', () => {
    const x = [1,2,3,4,5,6,7,8,9,10,11,12,13,14]
    const y = [2,4,6,8,10,12,14,16,18,20,22,24,26,28]
    const r = pearsonCorrelation(x, y)
    expect(r).not.toBeNull()
    expect(r!).toBeCloseTo(1, 5)
  })

  it('returns ~-1 for perfect negative correlation', () => {
    const x = [1,2,3,4,5,6,7,8,9,10,11,12,13,14]
    const y = [14,13,12,11,10,9,8,7,6,5,4,3,2,1]
    const r = pearsonCorrelation(x, y)
    expect(r).not.toBeNull()
    expect(r!).toBeCloseTo(-1, 5)
  })

  it('returns null when n < 14', () => {
    const x = [1,2,3,4,5,6,7,8,9,10,11,12,13]
    const y = [2,4,6,8,10,12,14,16,18,20,22,24,26]
    expect(pearsonCorrelation(x, y)).toBeNull()
  })

  it('returns null when x has zero variance', () => {
    const x = Array(14).fill(5)
    const y = [1,2,3,4,5,6,7,8,9,10,1,2,3,4]
    expect(pearsonCorrelation(x, y)).toBeNull()
  })

  it('returns null when y has zero variance', () => {
    const x = [1,2,3,4,5,6,7,8,9,10,1,2,3,4]
    const y = Array(14).fill(5)
    expect(pearsonCorrelation(x, y)).toBeNull()
  })

  it('returns a positive value between 0.5 and 0.95 for a moderate real-world-ish input', () => {
    const x = [3,5,4,7,6,8,5,7,4,6,5,8,7,6]
    const y = [4,5,4,7,6,8,5,7,5,6,5,7,7,6]
    const r = pearsonCorrelation(x, y)
    expect(r).not.toBeNull()
    expect(r!).toBeGreaterThan(0.5)
    expect(r!).toBeLessThan(0.99)
  })
})

describe('getCorrelationStrength', () => {
  it('r=0.65 → strong', () => expect(getCorrelationStrength(0.65)).toBe('strong'))
  it('r=0.45 → moderate', () => expect(getCorrelationStrength(0.45)).toBe('moderate'))
  it('r=0.32 → weak', () => expect(getCorrelationStrength(0.32)).toBe('weak'))
  it('r=-0.65 → strong (absolute value)', () => expect(getCorrelationStrength(-0.65)).toBe('strong'))
  it('r=0.25 → null (below minimum)', () => expect(getCorrelationStrength(0.25)).toBeNull())
  it('r=null → null', () => expect(getCorrelationStrength(null)).toBeNull())
})

describe('getCorrelationDirection', () => {
  it('r=0.5 → positive', () => expect(getCorrelationDirection(0.5)).toBe('positive'))
  it('r=-0.5 → negative', () => expect(getCorrelationDirection(-0.5)).toBe('negative'))
  it('r=0 → positive (boundary)', () => expect(getCorrelationDirection(0)).toBe('positive'))
})
