// /lib/tfi/scoring.test.ts
// Unit tests for calculateTfiScores per Meikle et al. 2012.
//
// Reverse-scored items are 4, 5, 14, 15 (reversed_value = 10 - raw).
// To achieve a zero score on a reverse-scored subscale item, the raw
// value must be 10 (10-10=0). To achieve a maximum score, raw must be 0
// (10-0=10).

import { describe, it, expect } from 'vitest'
import { calculateTfiScores } from './scoring'
import type { TfiResponses } from './scoring'

// ── Fixture helpers ───────────────────────────────────────────────────────────

/** Produces input where all subscale scores should be 0. */
function makeZeroInput(): TfiResponses {
  return {
    // Non-reversed items → 0 for zero score
    item_1: 0, item_2: 0, item_3: 0,
    // Reversed items → 10 raw so (10-10)=0 contributes zero
    item_4: 10, item_5: 10,
    item_6: 0,
    item_7: 0, item_8: 0,
    item_9: 0, item_10: 0,
    item_11: 0, item_12: 0, item_13: 0,
    // Reversed items → 10 raw for zero
    item_14: 10, item_15: 10,
    item_16: 0,
    item_17: 0, item_18: 0, item_19: 0, item_20: 0, item_21: 0, item_22: 0,
    item_23: 0, item_24: 0, item_25: 0,
  }
}

/** Produces input where all subscale scores should be 100. */
function makeMaxInput(): TfiResponses {
  return {
    // Non-reversed items → 10 for max score
    item_1: 10, item_2: 10, item_3: 10,
    // Reversed items → 0 raw so (10-0)=10 contributes max
    item_4: 0, item_5: 0,
    item_6: 10,
    item_7: 10, item_8: 10,
    item_9: 10, item_10: 10,
    item_11: 10, item_12: 10, item_13: 10,
    // Reversed items → 0 raw for max
    item_14: 0, item_15: 0,
    item_16: 10,
    item_17: 10, item_18: 10, item_19: 10, item_20: 10, item_21: 10, item_22: 10,
    item_23: 10, item_24: 10, item_25: 10,
  }
}

/** All items set to 5; reversed items also 5 → 10-5=5. */
function makeMidpointInput(): TfiResponses {
  const entries = Array.from({ length: 25 }, (_, i) => [`item_${i + 1}`, 5])
  return Object.fromEntries(entries) as unknown as TfiResponses
}

/** Produces input where only intrusive items (1,2,3) are 5; all others score 0. */
function makeIntrusiveOnlyInput(): TfiResponses {
  return {
    item_1: 5, item_2: 5, item_3: 5,
    item_4: 10, item_5: 10, item_6: 0, // SC: reversed to 0, 0, 0 → score=0
    item_7: 0, item_8: 0,
    item_9: 0, item_10: 0,
    item_11: 0, item_12: 0, item_13: 0,
    item_14: 10, item_15: 10, item_16: 0, // Relaxation: reversed to 0, 0, 0 → score=0
    item_17: 0, item_18: 0, item_19: 0, item_20: 0, item_21: 0, item_22: 0,
    item_23: 0, item_24: 0, item_25: 0,
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('calculateTfiScores', () => {
  it('Test 1: all-zero input yields all subscale scores = 0 and total = 0', () => {
    const result = calculateTfiScores(makeZeroInput())
    expect(result.subscale_intrusive).toBe(0)
    expect(result.subscale_sense_of_control).toBe(0)
    expect(result.subscale_cognitive).toBe(0)
    expect(result.subscale_sleep).toBe(0)
    expect(result.subscale_auditory).toBe(0)
    expect(result.subscale_relaxation).toBe(0)
    expect(result.subscale_quality_of_life).toBe(0)
    expect(result.subscale_emotional).toBe(0)
    expect(result.total_score).toBe(0)
  })

  it('Test 2: all-maximum input yields all subscale scores = 100 and total = 100', () => {
    const result = calculateTfiScores(makeMaxInput())
    expect(result.subscale_intrusive).toBe(100)
    expect(result.subscale_sense_of_control).toBe(100)
    expect(result.subscale_cognitive).toBe(100)
    expect(result.subscale_sleep).toBe(100)
    expect(result.subscale_auditory).toBe(100)
    expect(result.subscale_relaxation).toBe(100)
    expect(result.subscale_quality_of_life).toBe(100)
    expect(result.subscale_emotional).toBe(100)
    expect(result.total_score).toBe(100)
  })

  it('Test 3: all-midpoint (5) input yields all subscale scores = 50 and total = 50', () => {
    const result = calculateTfiScores(makeMidpointInput())
    expect(result.subscale_intrusive).toBe(50)
    expect(result.subscale_sense_of_control).toBe(50)
    expect(result.subscale_cognitive).toBe(50)
    expect(result.subscale_sleep).toBe(50)
    expect(result.subscale_auditory).toBe(50)
    expect(result.subscale_relaxation).toBe(50)
    expect(result.subscale_quality_of_life).toBe(50)
    expect(result.subscale_emotional).toBe(50)
    expect(result.total_score).toBe(50)
  })

  it('Test 4: reverse-scoring — items 4=0, 5=0 (→ 10 each), item 6=10 → SC = 100', () => {
    // Use zero-scored input as base, then override SC items for max.
    const input: TfiResponses = {
      ...makeZeroInput(),
      item_4: 0,  // reversed: 10 - 0 = 10
      item_5: 0,  // reversed: 10 - 0 = 10
      item_6: 10, // normal: 10
    }
    const result = calculateTfiScores(input)
    // SC = (10 + 10 + 10) / 30 * 100 = 100
    expect(result.subscale_sense_of_control).toBe(100)
    // Other subscales unchanged from zero-input
    expect(result.subscale_intrusive).toBe(0)
  })

  it('Test 5: only intrusive items at 5 → subscale_intrusive = 50, all others = 0', () => {
    const result = calculateTfiScores(makeIntrusiveOnlyInput())
    expect(result.subscale_intrusive).toBe(50)
    expect(result.subscale_sense_of_control).toBe(0)
    expect(result.subscale_cognitive).toBe(0)
    expect(result.subscale_sleep).toBe(0)
    expect(result.subscale_auditory).toBe(0)
    expect(result.subscale_relaxation).toBe(0)
    expect(result.subscale_quality_of_life).toBe(0)
    expect(result.subscale_emotional).toBe(0)
  })

  it('Test 6: total = mean of all 8 subscale scores', () => {
    // Set intrusive + SC + cognitive + sleep to 100, all others to 0.
    // Expected total = (100+100+100+100+0+0+0+0)/8 = 50.
    const input: TfiResponses = {
      item_1: 10, item_2: 10, item_3: 10, // intrusive = 100
      item_4: 0,  item_5: 0,  item_6: 10, // SC = 100 (items 4,5 reversed→10)
      item_7: 10, item_8: 10,             // cognitive = 100
      item_9: 10, item_10: 10,            // sleep = 100
      item_11: 0, item_12: 0, item_13: 0, // auditory = 0
      item_14: 10, item_15: 10, item_16: 0, // relaxation = 0 (items 14,15 reversed→0)
      item_17: 0, item_18: 0, item_19: 0, item_20: 0, item_21: 0, item_22: 0, // QoL = 0
      item_23: 0, item_24: 0, item_25: 0, // emotional = 0
    }
    const result = calculateTfiScores(input)
    expect(result.subscale_intrusive).toBe(100)
    expect(result.subscale_sense_of_control).toBe(100)
    expect(result.subscale_cognitive).toBe(100)
    expect(result.subscale_sleep).toBe(100)
    expect(result.subscale_auditory).toBe(0)
    expect(result.subscale_relaxation).toBe(0)
    expect(result.subscale_quality_of_life).toBe(0)
    expect(result.subscale_emotional).toBe(0)
    // Total = (100+100+100+100+0+0+0+0)/8 = 50
    expect(result.total_score).toBe(50)
  })
})
