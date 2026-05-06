import { describe, it, expect } from 'vitest'
import {
  classifyProfileType,
  assignTmjProtocol,
  assignCervProtocol,
  getRecommendedProtocolOption,
} from '../classify'
import type { ProfileType } from '../classify'

// ── ERRATA E1 core cases ─────────────────────────────────────────────────────
// One case per profile type. These are the canonical fixtures defined in ERRATA E1.

describe('classifyProfileType — ERRATA E1 core cases', () => {
  it('TMJ_DOMINANT: tmj=70, cerv=10', () => {
    expect(classifyProfileType(70, 10)).toBe('TMJ_DOMINANT')
  })
  it('CERV_DOMINANT: tmj=10, cerv=70', () => {
    expect(classifyProfileType(10, 70)).toBe('CERV_DOMINANT')
  })
  it('DUAL_DRIVER: tmj=45, cerv=40', () => {
    expect(classifyProfileType(45, 40)).toBe('DUAL_DRIVER')
  })
  it('TMJ_PRIMARY_STRONG_SECONDARY: tmj=60, cerv=38', () => {
    expect(classifyProfileType(60, 38)).toBe('TMJ_PRIMARY_STRONG_SECONDARY')
  })
  it('CERV_PRIMARY_STRONG_SECONDARY: tmj=38, cerv=60', () => {
    expect(classifyProfileType(38, 60)).toBe('CERV_PRIMARY_STRONG_SECONDARY')
  })
  it('TMJ_PRIMARY_WITH_SECONDARY: tmj=45, cerv=25', () => {
    expect(classifyProfileType(45, 25)).toBe('TMJ_PRIMARY_WITH_SECONDARY')
  })
  it('CERV_PRIMARY_WITH_SECONDARY: tmj=25, cerv=45', () => {
    expect(classifyProfileType(25, 45)).toBe('CERV_PRIMARY_WITH_SECONDARY')
  })
})

// ── Boundary tests ────────────────────────────────────────────────────────────
// These cases verify strict-vs-inclusive boundaries in the decision tree.
// Many produce the same profile_type as a simpler adjacent case but via
// a different branch. Do not consolidate — the branch-path is what's being tested.

describe('classifyProfileType — boundary tests', () => {

  // Fallback-via-strict-boundary — catch >= vs > bugs at the 30-line
  it('tmj=45, cerv=30 → TMJ_DOMINANT via fallback (cerv 30 fails DUAL > 30, fails PwS < 30)', () => {
    // cerv=30: not >30 (DUAL fails), not <30 (PwS upper fails), not >=30 and <30 simultaneously.
    // All branches miss; fallback: 45 >= 30 → TMJ_DOMINANT.
    expect(classifyProfileType(45, 30)).toBe('TMJ_DOMINANT')
  })
  it('tmj=46, cerv=30 → TMJ_DOMINANT via fallback', () => {
    expect(classifyProfileType(46, 30)).toBe('TMJ_DOMINANT')
  })
  it('tmj=46, cerv=31 → DUAL_DRIVER (both strictly > 30, diff 15 <= 15)', () => {
    expect(classifyProfileType(46, 31)).toBe('DUAL_DRIVER')
  })
  it('tmj=31, cerv=30 → TMJ_DOMINANT via fallback (cerv=30 fails DUAL >30 and PwS <30)', () => {
    expect(classifyProfileType(31, 30)).toBe('TMJ_DOMINANT')
  })
  it('tmj=31, cerv=29 → TMJ_PRIMARY_WITH_SECONDARY (tmj>30, cerv>=20, cerv<30)', () => {
    expect(classifyProfileType(31, 29)).toBe('TMJ_PRIMARY_WITH_SECONDARY')
  })

  // Single-driver boundary at 60
  it('tmj=60, cerv=10 → TMJ_DOMINANT via FALLBACK (60 fails strict > 60; all branches miss; 60>=10)', () => {
    // NOT via single-driver branch — 60 > 60 is false. Reaches fallback.
    expect(classifyProfileType(60, 10)).toBe('TMJ_DOMINANT')
  })
  it('tmj=60.01, cerv=10 → TMJ_DOMINANT via SINGLE-DRIVER branch (60.01 > 60 passes)', () => {
    // Via single-driver branch — 60.01 > 60 is true and 10 < 20 is true.
    expect(classifyProfileType(60.01, 10)).toBe('TMJ_DOMINANT')
  })

  // Single-driver boundary at 20
  it('tmj=61, cerv=19 → TMJ_DOMINANT via single-driver (19 < 20)', () => {
    expect(classifyProfileType(61, 19)).toBe('TMJ_DOMINANT')
  })
  it('tmj=61, cerv=20 → TMJ_PRIMARY_WITH_SECONDARY (20 fails single-driver < 20; DUAL fails 20>30; strong fails 20>=30; PwS: 61>30, 20>=20, 20<30)', () => {
    expect(classifyProfileType(61, 20)).toBe('TMJ_PRIMARY_WITH_SECONDARY')
  })

  // Strong-secondary boundary at 50 on lead
  it('tmj=50, cerv=35 → DUAL_DRIVER (50 fails strong-sec > 50; DUAL: 50>30, 35>30, diff 15)', () => {
    expect(classifyProfileType(50, 35)).toBe('DUAL_DRIVER')
  })
  it('tmj=51, cerv=35 → TMJ_PRIMARY_STRONG_SECONDARY (51>50, 35>=30, 35<=50)', () => {
    expect(classifyProfileType(51, 35)).toBe('TMJ_PRIMARY_STRONG_SECONDARY')
  })

  // Decimal edge case — sub-integer inputs from 2dp normalisation
  it('tmj=0.5, cerv=0.3 → TMJ_DOMINANT via fallback (sub-threshold inputs)', () => {
    expect(classifyProfileType(0.5, 0.3)).toBe('TMJ_DOMINANT')
  })
})

// ── Both-high dual driver (regression: gap > 15 was falling to fallback) ──────

describe('classifyProfileType — both scores above SINGLE_DRIVER_HIGH_THRESHOLD', () => {
  it('tmj=73.33, cerv=92 → DUAL_DRIVER (real signup case, was wrongly CERV_DOMINANT)', () => {
    expect(classifyProfileType(73.33, 92)).toBe('DUAL_DRIVER')
  })
  it('tmj=70, cerv=85 → DUAL_DRIVER (both > 60, gap 15 — both-high branch fires)', () => {
    expect(classifyProfileType(70, 85)).toBe('DUAL_DRIVER')
  })
  it('tmj=65, cerv=90 → DUAL_DRIVER (both > 60, gap 25)', () => {
    expect(classifyProfileType(65, 90)).toBe('DUAL_DRIVER')
  })
  it('tmj=80, cerv=35 → TMJ_PRIMARY_STRONG_SECONDARY (only tmj > 60; both-high does not fire)', () => {
    expect(classifyProfileType(80, 35)).toBe('TMJ_PRIMARY_STRONG_SECONDARY')
  })
})

// ── Fallback tests ────────────────────────────────────────────────────────────

describe('classifyProfileType — fallback cases', () => {
  it('tmj=0, cerv=0 → TMJ_DOMINANT (tie → TMJ by convention)', () => {
    expect(classifyProfileType(0, 0)).toBe('TMJ_DOMINANT')
  })
  it('tmj=15, cerv=15 → TMJ_DOMINANT (tie → TMJ by convention)', () => {
    expect(classifyProfileType(15, 15)).toBe('TMJ_DOMINANT')
  })
  it('tmj=10, cerv=15 → CERV_DOMINANT (cerv higher in fallback)', () => {
    expect(classifyProfileType(10, 15)).toBe('CERV_DOMINANT')
  })
  it('tmj=19, cerv=12 → TMJ_DOMINANT (both below all thresholds)', () => {
    expect(classifyProfileType(19, 12)).toBe('TMJ_DOMINANT')
  })
})

// ── Protocol assignment boundary ─────────────────────────────────────────────

describe('assignTmjProtocol', () => {
  it('19 → false (below PROTOCOL_ASSIGNMENT_MINIMUM 20)', () => {
    expect(assignTmjProtocol(19)).toBe(false)
  })
  it('20 → true (at threshold, inclusive >=)', () => {
    expect(assignTmjProtocol(20)).toBe(true)
  })
  it('0 → false', () => {
    expect(assignTmjProtocol(0)).toBe(false)
  })
  it('100 → true', () => {
    expect(assignTmjProtocol(100)).toBe(true)
  })
})

describe('assignCervProtocol', () => {
  it('19 → false', () => {
    expect(assignCervProtocol(19)).toBe(false)
  })
  it('20 → true', () => {
    expect(assignCervProtocol(20)).toBe(true)
  })
  it('0 → false', () => {
    expect(assignCervProtocol(0)).toBe(false)
  })
  it('100 → true', () => {
    expect(assignCervProtocol(100)).toBe(true)
  })
})

// ── Recommended protocol option — all 7 profile types ────────────────────────

describe('getRecommendedProtocolOption', () => {
  const cases: Array<[ProfileType, 1 | 2 | 3]> = [
    ['TMJ_DOMINANT',                  1],
    ['CERV_DOMINANT',                 1],
    ['DUAL_DRIVER',                   2],
    ['TMJ_PRIMARY_STRONG_SECONDARY',  3],
    ['CERV_PRIMARY_STRONG_SECONDARY', 3],
    ['TMJ_PRIMARY_WITH_SECONDARY',    3],
    ['CERV_PRIMARY_WITH_SECONDARY',   3],
  ]
  for (const [profileType, expected] of cases) {
    it(`${profileType} → option ${expected}`, () => {
      expect(getRecommendedProtocolOption(profileType)).toBe(expected)
    })
  }
})
