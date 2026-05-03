// app/framework/phase-5/actions.test.ts
// ─────────────────────────────────────────────────────────────────
// Tests for setPhase5OutcomeType server action.
//
// FIRST actions.test.ts in app/framework/ — establishes the mock
// pattern for future server action tests:
//
//   1. vi.mock('@/lib/supabase/server') is hoisted by vitest — declare
//      it before other imports so the factory runs first.
//   2. Build a chainable mock client matching the call chain used by
//      the action (.from().update().eq() or .auth.getUser()).
//   3. vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
//      in beforeEach to reset between tests.
//   4. Use expect.objectContaining() to assert payload fields without
//      tying assertions to non-deterministic values (e.g. updated_at).
// ─────────────────────────────────────────────────────────────────

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Phase5OutcomeType } from '@/content/framework/phase-5/types'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@/lib/supabase/server'
import { setPhase5OutcomeType, markPhase5Complete } from './actions'

// ── Mock Supabase client ──────────────────────────────────────────

const mockEq = vi.fn()
const mockUpdate = vi.fn(() => ({ eq: mockEq }))
const mockFrom = vi.fn(() => ({ update: mockUpdate }))
const mockGetUser = vi.fn()

const mockSupabase = {
  auth: { getUser: mockGetUser },
  from: mockFrom,
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(createClient).mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof createClient>>)
  mockEq.mockResolvedValue({ error: null })
  mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } })
})

// ── setPhase5OutcomeType tests ────────────────────────────────────

describe('setPhase5OutcomeType', () => {
  it('valid value full_resolution → calls update with phase5_outcome_type', async () => {
    await setPhase5OutcomeType('full_resolution')
    expect(mockFrom).toHaveBeenCalledWith('framework_progress')
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ phase5_outcome_type: 'full_resolution' })
    )
    expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123')
  })

  it('valid value plateau → calls update with phase5_outcome_type', async () => {
    await setPhase5OutcomeType('plateau')
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ phase5_outcome_type: 'plateau' })
    )
  })

  it('valid value significant_improvement → calls update with phase5_outcome_type', async () => {
    await setPhase5OutcomeType('significant_improvement')
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ phase5_outcome_type: 'significant_improvement' })
    )
  })

  it('invalid value → does NOT call createClient or update, logs error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    await setPhase5OutcomeType('something_else' as Phase5OutcomeType)
    expect(createClient).not.toHaveBeenCalled()
    expect(mockFrom).not.toHaveBeenCalled()
    expect(mockUpdate).not.toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalledWith(
      '[phase-5 actions] setPhase5OutcomeType invalid value:',
      'something_else'
    )
    consoleSpy.mockRestore()
  })

  it('anonymous user → does NOT call update', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    await setPhase5OutcomeType('full_resolution')
    expect(mockFrom).not.toHaveBeenCalled()
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('DB error → logs error, does not throw', async () => {
    mockEq.mockResolvedValue({ error: { message: 'constraint violation' } })
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    await expect(setPhase5OutcomeType('full_resolution')).resolves.toBeUndefined()
    expect(consoleSpy).toHaveBeenCalledWith(
      '[phase-5 actions] phase5_outcome_type update failed:',
      'constraint violation',
      'user:',
      'user-123',
      'value:',
      'full_resolution'
    )
    consoleSpy.mockRestore()
  })
})

// ── markPhase5Complete tests ──────────────────────────────────────

describe('markPhase5Complete', () => {
  it('success path → calls update with phase5_completed_at and updated_at, user_id filter applied', async () => {
    await markPhase5Complete()
    expect(mockFrom).toHaveBeenCalledWith('framework_progress')
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        phase5_completed_at: expect.any(String),
        updated_at: expect.any(String),
      })
    )
    expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123')
  })

  it('anonymous user → does NOT call update', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    await markPhase5Complete()
    expect(mockFrom).not.toHaveBeenCalled()
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('DB error → logs error, does not throw', async () => {
    mockEq.mockResolvedValue({ error: { message: 'write failed' } })
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    await expect(markPhase5Complete()).resolves.toBeUndefined()
    expect(consoleSpy).toHaveBeenCalledWith(
      '[phase-5 actions] phase5_completed_at update failed:',
      'write failed',
      'user:',
      'user-123'
    )
    consoleSpy.mockRestore()
  })
})
