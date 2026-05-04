import { describe, it, expect } from 'vitest'
import {
  getAvatarSlot,
  getAvatarBgClass,
  getAvatarInitials,
} from '../avatar'

describe('getAvatarSlot', () => {
  it('returns 1 for empty string', () => {
    expect(getAvatarSlot('')).toBe(1)
  })

  it('returns 1 for null', () => {
    expect(getAvatarSlot(null)).toBe(1)
  })

  it('returns 1 for undefined', () => {
    expect(getAvatarSlot(undefined)).toBe(1)
  })

  it('is deterministic for the same username', () => {
    const a = getAvatarSlot('oliver')
    const b = getAvatarSlot('oliver')
    expect(a).toBe(b)
  })

  it('returns slot in range 1–6', () => {
    for (const username of ['a', 'b', 'c', 'oliver', 'somebody', '_test', '9zz']) {
      const slot = getAvatarSlot(username)
      expect(slot).toBeGreaterThanOrEqual(1)
      expect(slot).toBeLessThanOrEqual(6)
    }
  })
})

describe('getAvatarBgClass', () => {
  it('returns bg-avatar-N format', () => {
    const cls = getAvatarBgClass('oliver')
    expect(cls).toMatch(/^bg-avatar-[1-6]$/)
  })

  it('returns bg-avatar-1 for empty', () => {
    expect(getAvatarBgClass('')).toBe('bg-avatar-1')
  })
})

describe('getAvatarInitials', () => {
  it('returns first two chars uppercased', () => {
    expect(getAvatarInitials('oliver')).toBe('OL')
  })

  it('returns single char if username is one char', () => {
    expect(getAvatarInitials('a')).toBe('A')
  })

  it('returns ? for null', () => {
    expect(getAvatarInitials(null)).toBe('?')
  })

  it('returns ? for empty string', () => {
    expect(getAvatarInitials('')).toBe('?')
  })

  it('strips leading non-alphanumeric', () => {
    expect(getAvatarInitials('_test')).toBe('TE')
  })

  it('returns ? if only non-alphanumeric', () => {
    expect(getAvatarInitials('___')).toBe('?')
  })
})
