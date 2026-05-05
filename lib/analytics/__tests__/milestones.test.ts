import { describe, it, expect } from 'vitest'
import { getMilestones } from '../milestones'
import { toLocalDateStr } from '../timeWindow'
import type { FrameworkProgressRow } from '@/lib/scoring/types'

function makeProgress(overrides: Partial<FrameworkProgressRow> = {}): FrameworkProgressRow {
  return {
    user_id: 'u1',
    current_phase: 1,
    current_session: 1,
    protocol_option: null,
    started_at: null,
    phase1_completed_at: null,
    phase2_completed_at: null,
    phase3_completed_at: null,
    phase4_completed_at: null,
    phase5_completed_at: null,
    resistance_phase_start: null,
    phase2_habits_acknowledged: {},
    phase3_first_accessed: null,
    phase4_first_accessed: null,
    phase5_outcome_type: null,
    exercises_viewed: {},
    session_in_progress: null,
    nudges_dismissed: {},
    phase4_exercises_added: [],
    tfi_dismissals: {},
    ...overrides,
  }
}

describe('getMilestones', () => {
  it('null input → empty array', () => {
    expect(getMilestones(null)).toEqual([])
  })

  it('all timestamp fields null → empty array', () => {
    expect(getMilestones(makeProgress())).toEqual([])
  })

  it('phase1_completed_at populated, others null → 1 milestone with correct label and shortLabel', () => {
    const result = getMilestones(makeProgress({ phase1_completed_at: '2026-01-10T12:00:00Z' }))
    expect(result).toHaveLength(1)
    expect(result[0].label).toBe('Phase 1 completed')
    expect(result[0].shortLabel).toBe('P1 done')
    expect(result[0].id).toBe('phase1_completed')
  })

  it('phase2_completed_at populated → 2 milestones: P2 done and P3 start, same date', () => {
    const ts = '2026-02-20T12:00:00Z'
    const result = getMilestones(makeProgress({ phase2_completed_at: ts }))
    expect(result).toHaveLength(2)
    expect(result[0].label).toBe('Phase 2 completed')
    expect(result[0].shortLabel).toBe('P2 done')
    expect(result[1].label).toBe('Phase 3 started')
    expect(result[1].shortLabel).toBe('P3 start')
    expect(result[0].date).toBe(result[1].date)
  })

  it('all six date sources populated → 7 milestones in spec order', () => {
    const progress = makeProgress({
      phase1_completed_at: '2026-01-01T12:00:00Z',
      phase2_completed_at: '2026-02-01T12:00:00Z',
      resistance_phase_start: '2026-03-01T12:00:00Z',
      phase3_completed_at: '2026-04-01T12:00:00Z',
      phase4_first_accessed: '2026-05-01T12:00:00Z',
      phase5_completed_at: '2026-06-01T12:00:00Z',
    })
    const result = getMilestones(progress)
    expect(result).toHaveLength(7)
    expect(result.map((m) => m.id)).toEqual([
      'phase1_completed',
      'phase2_completed',
      'phase3_started',
      'resistance_started',
      'phase3_completed',
      'phase4_accessed',
      'phase5_completed',
    ])
  })

  it('timestamp converted to YYYY-MM-DD via toLocalDateStr', () => {
    const ts = '2026-06-15T12:00:00Z'
    const result = getMilestones(makeProgress({ phase1_completed_at: ts }))
    expect(result[0].date).toBe(toLocalDateStr(new Date(ts)))
    expect(result[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
