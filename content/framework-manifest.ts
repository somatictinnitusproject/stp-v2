// Phase names from Document 12 Section 3.6 exactly.
// Session counts from Document 13 Section 6.1 focus line keys and Document 8.
// Phase 3 orientation section count: TODO Phase E — exact count from Document 8.
// Phase 4 and 5 counts: unverified guesses based on naming conventions (F1–F12, G1–G9).
// Confirm both against actual Document 8 Phase 4/5 content in Phase E.
// If either count differs, update PHASE_SESSION_COUNTS and the matching
// DAILY_FOCUS_LINES keys in focus-lines.ts — both must stay in sync.

export const PHASE_NAMES: Record<number, string> = {
  1: 'Identification',
  2: 'Lifestyle Foundations',
  3: 'Primary Driver Protocols',
  4: 'Maintaining Factors',
  5: 'Stabilisation',
}

export const PHASE_SESSION_COUNTS: Record<number, number> = {
  1: 7,  // B1–B7
  2: 6,  // C.1, C.2, C.3, C.4, C.5, C.8 — 6 sections per Document 8 C.10
  3: 5,  // TODO Phase E: replace with actual orientation section count from Document 8
  4: 12, // TODO Phase E: unverified — based on F1–F12 naming convention only. Confirm against Document 8 Phase 4.
  5: 9,  // TODO Phase E: unverified — based on G1–G9 naming convention only. Confirm against Document 8 Phase 5.
}

export function getMaxSessionsForPhase(phase: number): number {
  return PHASE_SESSION_COUNTS[phase] ?? 1
}
