// /lib/session/build-new-sip.test.ts
// ─────────────────────────────────────────────────────────────────────────────
// Tests for buildNewSip — the pure session_in_progress builder.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest'
import { buildNewSip } from './build-new-sip'

const TODAY = '2026-04-29'
const STALE = '2026-04-28'
const NOW   = '2026-04-29T09:00:00.000Z'
const OLD   = '2026-04-28T08:00:00.000Z'

function makeSip(overrides: Partial<{
  session_date: string
  completed_exercises: string[]
  started_at: string
}> = {}): Record<string, unknown> {
  return {
    session_date: overrides.session_date ?? TODAY,
    completed_exercises: overrides.completed_exercises ?? [],
    started_at: overrides.started_at ?? OLD,
  }
}

describe('buildNewSip', () => {
  // ── null SIP ──────────────────────────────────────────────────────────────

  it('fresh-inits when existing SIP is null', () => {
    const { sip, wasInitialised } = buildNewSip(null, 'E5', TODAY, NOW)
    expect(sip.session_date).toBe(TODAY)
    expect(sip.completed_exercises).toEqual(['E5'])
    expect(sip.started_at).toBe(NOW)
    expect(wasInitialised).toBe(true)
  })

  // ── stale SIP ─────────────────────────────────────────────────────────────

  it('fresh-inits when SIP has a stale session_date', () => {
    const { sip, wasInitialised } = buildNewSip(
      makeSip({ session_date: STALE, completed_exercises: ['A', 'B'], started_at: OLD }),
      'E5',
      TODAY,
      NOW,
    )
    expect(sip.session_date).toBe(TODAY)
    expect(sip.completed_exercises).toEqual(['E5'])
    expect(sip.started_at).toBe(NOW)
    expect(wasInitialised).toBe(true)
  })

  // ── today's session — append ───────────────────────────────────────────────

  it('appends exerciseId when SIP is current and exercise is new', () => {
    const { sip, wasInitialised } = buildNewSip(
      makeSip({ completed_exercises: ['A', 'B'] }),
      'C',
      TODAY,
      NOW,
    )
    expect(sip.completed_exercises).toEqual(['A', 'B', 'C'])
    expect(sip.started_at).toBe(OLD)   // preserves original started_at
    expect(wasInitialised).toBe(false)
  })

  it('preserves original started_at when appending', () => {
    const { sip } = buildNewSip(
      makeSip({ started_at: OLD }),
      'D',
      TODAY,
      NOW,
    )
    expect(sip.started_at).toBe(OLD)
  })

  // ── today's session — dedupe ───────────────────────────────────────────────

  it('is a no-op when exerciseId is already in completed_exercises', () => {
    const { sip, wasInitialised } = buildNewSip(
      makeSip({ completed_exercises: ['A', 'B', 'C'] }),
      'B',
      TODAY,
      NOW,
    )
    expect(sip.completed_exercises).toEqual(['A', 'B', 'C'])
    expect(wasInitialised).toBe(false)
  })

  // ── missing completed_exercises field ────────────────────────────────────

  it('treats missing completed_exercises as empty array and appends', () => {
    // Partial SIP written without completed_exercises — ?? [] guard applies
    const partial: Record<string, unknown> = {
      session_date: TODAY,
      started_at: OLD,
      // completed_exercises intentionally absent
    }
    const { sip, wasInitialised } = buildNewSip(partial, 'X', TODAY, NOW)
    expect(sip.completed_exercises).toEqual(['X'])
    expect(wasInitialised).toBe(false)
  })
})
