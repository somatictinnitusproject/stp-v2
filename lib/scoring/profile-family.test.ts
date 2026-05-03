import { describe, it, expect } from 'vitest'
import { resolveProfileFamily } from './profile-family'

describe('resolveProfileFamily', () => {
  it.each([
    ['TMJ_DOMINANT', 'TMJ_DOMINANT'],
    ['TMJ_PRIMARY_STRONG_SECONDARY', 'TMJ_DOMINANT'],
    ['TMJ_PRIMARY_WITH_SECONDARY', 'TMJ_DOMINANT'],
  ])('TMJ family: %s → TMJ_DOMINANT', (input, expected) => {
    expect(resolveProfileFamily(input)).toBe(expected)
  })

  it.each([
    ['CERV_DOMINANT', 'CERV_DOMINANT'],
    ['CERV_PRIMARY_STRONG_SECONDARY', 'CERV_DOMINANT'],
    ['CERV_PRIMARY_WITH_SECONDARY', 'CERV_DOMINANT'],
  ])('CERV family: %s → CERV_DOMINANT', (input, expected) => {
    expect(resolveProfileFamily(input)).toBe(expected)
  })

  it('DUAL_DRIVER → DUAL_DRIVER', () => {
    expect(resolveProfileFamily('DUAL_DRIVER')).toBe('DUAL_DRIVER')
  })

  it('empty string → null', () => {
    expect(resolveProfileFamily('')).toBeNull()
  })

  it('null → null', () => {
    expect(resolveProfileFamily(null)).toBeNull()
  })

  it('undefined → null', () => {
    expect(resolveProfileFamily(undefined)).toBeNull()
  })

  it('unknown value → null', () => {
    expect(resolveProfileFamily('SOMETHING_ELSE')).toBeNull()
  })
})
