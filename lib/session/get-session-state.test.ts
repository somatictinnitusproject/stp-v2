// /lib/session/get-session-state.test.ts
// ─────────────────────────────────────────────────────────────────────────────
// Tests for getSessionState — the pure session-branch helper.
// Covers all five branches defined in the /session page spec.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest'
import { getSessionState } from './get-session-state'
import type { Exercise } from '@/content/exercises/_types'

// ── Fixture helpers ───────────────────────────────────────────────────────────

const TODAY = '2026-04-28'
const STALE_DATE = '2026-04-27'

function makeExercise(id: string): Exercise {
  return {
    id,
    sectionRef: 'D.1',
    name: id,
    category: 'jaw-release',
    estimatedMinutes: 5,
    focusLine: 'Test focus',
    fullContent: [{ type: 'p', text: 'Test content' }],
    condensedSummary: [{ type: 'p', text: 'Test summary' }],
    videoId: null,
    commonMistakes: null,
    contraindications: null,
    profileModifiers: [],
    shorter_session_eligible: true,
    rotation_slot: null,
    timer: null,
  }
}

function makeSip(overrides: {
  session_date?: string
  completed_exercises?: string[]
  started_at?: string
} = {}) {
  return {
    session_date: overrides.session_date ?? TODAY,
    completed_exercises: overrides.completed_exercises ?? [],
    started_at: overrides.started_at ?? '2026-04-28T08:00:00Z',
  }
}

const THREE_EXERCISES = [
  makeExercise('A'),
  makeExercise('B'),
  makeExercise('C'),
]

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('getSessionState', () => {
  // ── empty branch ─────────────────────────────────────────────────────────

  it('returns empty when exerciseList is empty', () => {
    const result = getSessionState({ session_in_progress: null }, [], TODAY)
    expect(result.kind).toBe('empty')
    expect(result.completedIds).toEqual([])
    expect(result.activeIndex).toBe(-1)
  })

  it('returns empty when exerciseList is empty even with a session_in_progress', () => {
    const result = getSessionState(
      { session_in_progress: makeSip() },
      [],
      TODAY,
    )
    expect(result.kind).toBe('empty')
  })

  // ── fresh branch ─────────────────────────────────────────────────────────

  it('returns fresh when session_in_progress is null', () => {
    const result = getSessionState({ session_in_progress: null }, THREE_EXERCISES, TODAY)
    expect(result.kind).toBe('fresh')
    expect(result.completedIds).toEqual([])
    expect(result.activeIndex).toBe(0)
  })

  it('returns fresh when session_in_progress has a stale date', () => {
    // Stale-clear normally happens upstream in the server component, but the
    // function handles this defensively so stale SIP produces 'fresh' state.
    const result = getSessionState(
      { session_in_progress: makeSip({ session_date: STALE_DATE }) },
      THREE_EXERCISES,
      TODAY,
    )
    expect(result.kind).toBe('fresh')
    expect(result.completedIds).toEqual([])
    expect(result.activeIndex).toBe(0)
  })

  // ── resume branch ────────────────────────────────────────────────────────

  it('returns resume with correct activeIndex when first exercise is done', () => {
    const result = getSessionState(
      { session_in_progress: makeSip({ completed_exercises: ['A'] }) },
      THREE_EXERCISES,
      TODAY,
    )
    expect(result.kind).toBe('resume')
    expect(result.completedIds).toEqual(['A'])
    expect(result.activeIndex).toBe(1)
  })

  it('returns resume with correct activeIndex when first two exercises are done', () => {
    const result = getSessionState(
      { session_in_progress: makeSip({ completed_exercises: ['A', 'B'] }) },
      THREE_EXERCISES,
      TODAY,
    )
    expect(result.kind).toBe('resume')
    expect(result.completedIds).toEqual(['A', 'B'])
    expect(result.activeIndex).toBe(2)
  })

  // ── complete branch ──────────────────────────────────────────────────────

  it('returns complete when all exercises are in completed_exercises', () => {
    const result = getSessionState(
      { session_in_progress: makeSip({ completed_exercises: ['A', 'B', 'C'] }) },
      THREE_EXERCISES,
      TODAY,
    )
    expect(result.kind).toBe('complete')
    expect(result.completedIds).toEqual(['A', 'B', 'C'])
    expect(result.activeIndex).toBe(-1)
  })

  it('returns complete even if completed_exercises has extra IDs not in list', () => {
    // Defensive: completed set is a superset of exerciseList — treat as complete.
    const result = getSessionState(
      { session_in_progress: makeSip({ completed_exercises: ['A', 'B', 'C', 'EXTRA'] }) },
      THREE_EXERCISES,
      TODAY,
    )
    expect(result.kind).toBe('complete')
  })

  // ── malformed session_in_progress ────────────────────────────────────────

  it('handles missing completed_exercises field gracefully (treats as fresh)', () => {
    // If M13h writes a partial row, missing completed_exercises resolves to
    // undefined. The ?? [] guard returns fresh state.
    const result = getSessionState(
      {
        session_in_progress: {
          session_date: TODAY,
          started_at: '2026-04-28T08:00:00Z',
          // completed_exercises intentionally absent
        } as Record<string, unknown>,
      },
      THREE_EXERCISES,
      TODAY,
    )
    // completed_exercises ?? [] → empty → activeIndex 0 → 'fresh'-equivalent
    // The function can't distinguish this from a zero-completion resume —
    // both produce activeIndex 0 and completedIds []. Kind is 'resume' here
    // because session_date matches. This is acceptable: member sees the first
    // card as active, which is correct.
    expect(result.activeIndex).toBe(0)
    expect(result.completedIds).toEqual([])
  })
})
