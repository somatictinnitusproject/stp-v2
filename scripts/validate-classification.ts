// Validation script for classifyProfileType.
// Run with: npx tsx scripts/validate-classification.ts
// Prints a pass/fail table for the 14 specified cases.

import { classifyProfileType } from '../lib/scoring/classify'
import type { ProfileType } from '../lib/scoring/classify'

type Case = {
  tmj: number
  cerv: number
  expected: ProfileType
  note: string
}

const cases: Case[] = [
  { tmj: 73.33, cerv: 92.00, expected: 'DUAL_DRIVER',                    note: 'real bug case — both > 60, gap 18.67' },
  { tmj: 65,    cerv: 75,    expected: 'DUAL_DRIVER',                    note: 'both > 60, gap 10 — both-high fires before regular dual' },
  { tmj: 61,    cerv: 90,    expected: 'DUAL_DRIVER',                    note: 'both > 60, large gap 29 — requires both-high rule' },
  { tmj: 65,    cerv: 35,    expected: 'TMJ_PRIMARY_STRONG_SECONDARY',   note: 'clear primary, mid secondary' },
  { tmj: 65,    cerv: 25,    expected: 'TMJ_PRIMARY_WITH_SECONDARY',     note: 'clear primary, low secondary' },
  { tmj: 65,    cerv: 15,    expected: 'TMJ_DOMINANT',                   note: 'clear primary, negligible secondary (< 20)' },
  { tmj: 35,    cerv: 32,    expected: 'DUAL_DRIVER',                    note: 'both moderate, close gap 3' },
  { tmj: 35,    cerv: 50,    expected: 'DUAL_DRIVER',                    note: 'both >= 30, gap exactly 15 (max allowed)' },
  { tmj: 35,    cerv: 51,    expected: 'CERV_PRIMARY_STRONG_SECONDARY',  note: 'gap 16 > 15, misses dual; cerv=51 >= 50 leads, tmj=35 is strong secondary' },
  { tmj: 40,    cerv: 40,    expected: 'DUAL_DRIVER',                    note: 'identical mid scores' },
  { tmj: 15,    cerv: 15,    expected: 'TMJ_DOMINANT',                   note: 'both < 20, low confidence — fallback, tie → TMJ by convention' },
  { tmj: 10,    cerv: 25,    expected: 'CERV_DOMINANT',                  note: 'tmj < 20 (no protocol), cerv=25 fails CERV_PRIMARY_WITH (not > 30) — fallback picks higher' },
  { tmj: 50,    cerv: 30,    expected: 'TMJ_PRIMARY_STRONG_SECONDARY',   note: 'lead exactly 50 (>= 50 fix), secondary exactly 30 (>= 30 fix)' },
  { tmj: 51,    cerv: 50,    expected: 'DUAL_DRIVER',                    note: 'diff=1, both >= 30 — hits regular dual before primary-strong' },
]

const rows: {
  '#': number
  'tmj': string
  'cerv': string
  'expected': string
  'actual': string
  'result': string
  'note': string
}[] = []

let allPass = true

for (let i = 0; i < cases.length; i++) {
  const { tmj, cerv, expected, note } = cases[i]
  const actual = classifyProfileType(tmj, cerv)
  const pass = actual === expected
  if (!pass) allPass = false
  rows.push({
    '#':        i + 1,
    'tmj':      String(tmj),
    'cerv':     String(cerv),
    'expected': expected,
    'actual':   actual,
    'result':   pass ? 'PASS' : '*** FAIL ***',
    'note':     note,
  })
}

console.log('\nclassifyProfileType — validation table\n')
console.table(rows)
console.log(allPass ? '\nAll 14 cases PASS.' : '\n*** One or more cases FAILED. ***')
