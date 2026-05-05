import { describe, it, expect } from 'vitest'
import {
  canAccessPlatform,
  canAccessCommunity,
  isFoundingMember,
} from '../access'

describe('canAccessPlatform', () => {
  it('allows founding members regardless of status', () => {
    expect(
      canAccessPlatform({ is_founding_member: true, is_free_for_life: false, status: 'cancelled' }),
    ).toBe(true)
  })

  it('allows free-for-life members regardless of status', () => {
    expect(
      canAccessPlatform({ is_founding_member: false, is_free_for_life: true, status: 'cancelled' }),
    ).toBe(true)
  })

  it('allows active non-founding members', () => {
    expect(
      canAccessPlatform({ is_founding_member: false, is_free_for_life: false, status: 'active' }),
    ).toBe(true)
  })

  it('allows past_due non-founding members', () => {
    expect(
      canAccessPlatform({ is_founding_member: false, is_free_for_life: false, status: 'past_due' }),
    ).toBe(true)
  })

  it('blocks cancelled non-founding non-free members', () => {
    expect(
      canAccessPlatform({ is_founding_member: false, is_free_for_life: false, status: 'cancelled' }),
    ).toBe(false)
  })
})

describe('isFoundingMember', () => {
  it('returns true when flag is true', () => {
    expect(isFoundingMember({ is_founding_member: true })).toBe(true)
  })

  it('returns false when flag is false', () => {
    expect(isFoundingMember({ is_founding_member: false })).toBe(false)
  })
})

describe('canAccessCommunity', () => {
  const fmActive = { is_founding_member: true, is_free_for_life: true, status: 'active' }
  const fmCancelled = { is_founding_member: true, is_free_for_life: true, status: 'cancelled' }
  const paidActive = { is_founding_member: false, is_free_for_life: false, status: 'active' }
  const paidCancelled = { is_founding_member: false, is_free_for_life: false, status: 'cancelled' }
  const fflCancelled = { is_founding_member: false, is_free_for_life: true, status: 'cancelled' }

  const phase1Done = { phase1_completed_at: '2026-04-01T12:00:00Z' }
  const phase1NotDone = { phase1_completed_at: null }

  it('allows founding member with phase 1 complete', () => {
    expect(canAccessCommunity(fmActive, phase1Done)).toBe(true)
  })

  it('allows founding member with phase 1 complete even if cancelled', () => {
    expect(canAccessCommunity(fmCancelled, phase1Done)).toBe(true)
  })

  it('blocks founding member without phase 1 complete', () => {
    expect(canAccessCommunity(fmActive, phase1NotDone)).toBe(false)
  })

  it('allows paid active member with phase 1 complete', () => {
    expect(canAccessCommunity(paidActive, phase1Done)).toBe(true)
  })

  it('blocks paid active member without phase 1 complete', () => {
    expect(canAccessCommunity(paidActive, phase1NotDone)).toBe(false)
  })

  it('blocks paid cancelled member regardless of phase 1', () => {
    expect(canAccessCommunity(paidCancelled, phase1Done)).toBe(false)
  })

  it('allows free-for-life cancelled member with phase 1 complete', () => {
    expect(canAccessCommunity(fflCancelled, phase1Done)).toBe(true)
  })

  it('blocks when frameworkProgress is null', () => {
    expect(canAccessCommunity(fmActive, null)).toBe(false)
  })
})
