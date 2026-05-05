// app/framework/phase-5/actions.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Phase5OutcomeType } from '@/content/framework/phase-5/types'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

// after() is used fire-and-forget; execute the callback synchronously in tests
// so email function calls are observable.
vi.mock('next/server', () => ({
  after: vi.fn((fn: () => Promise<void>) => { void fn() }),
}))

vi.mock('@/lib/emailoctopus/client', () => ({
  sendPhase5CompletionEmail: vi.fn().mockResolvedValue(undefined),
}))

import { createClient } from '@/lib/supabase/server'
import { sendPhase5CompletionEmail } from '@/lib/emailoctopus/client'
import { setPhase5OutcomeType, markPhase5Complete } from './actions'

// ── Mock Supabase client ──────────────────────────────────────────

// select chain: .from('users').select().eq().single()
const mockSingle = vi.fn().mockResolvedValue({ data: { display_name: 'Test User' } })
const mockSelectEq = vi.fn(() => ({ single: mockSingle }))
const mockSelect = vi.fn(() => ({ eq: mockSelectEq }))

// update chain: .from('framework_progress').update().eq()
const mockEq = vi.fn()
const mockUpdate = vi.fn(() => ({ eq: mockEq }))

const mockFrom = vi.fn((table: string) => {
  if (table === 'users') return { select: mockSelect }
  return { update: mockUpdate }
})

const mockGetUser = vi.fn()

const mockSupabase = {
  auth: { getUser: mockGetUser },
  from: mockFrom,
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(createClient).mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof createClient>>)
  mockEq.mockResolvedValue({ error: null })
  mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123', email: 'test@example.com' } } })
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

  it('success path → fetches display_name and triggers completion email', async () => {
    await markPhase5Complete()
    expect(mockFrom).toHaveBeenCalledWith('users')
    expect(mockSelect).toHaveBeenCalledWith('display_name')
    expect(sendPhase5CompletionEmail).toHaveBeenCalledWith({
      email: 'test@example.com',
      username: 'Test User',
    })
  })

  it('anonymous user → does NOT call update or send email', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    await markPhase5Complete()
    expect(mockFrom).not.toHaveBeenCalled()
    expect(mockUpdate).not.toHaveBeenCalled()
    expect(sendPhase5CompletionEmail).not.toHaveBeenCalled()
  })

  it('DB error → logs error, does not throw, does not send email', async () => {
    mockEq.mockResolvedValue({ error: { message: 'write failed' } })
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    await expect(markPhase5Complete()).resolves.toBeUndefined()
    expect(consoleSpy).toHaveBeenCalledWith(
      '[phase-5 actions] phase5_completed_at update failed:',
      'write failed',
      'user:',
      'user-123'
    )
    expect(sendPhase5CompletionEmail).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})
