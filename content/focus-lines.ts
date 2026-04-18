// Focus line data structure from Document 13 Section 6.
// Phase 1 text from Document 13 Section 6.1 (specified there directly).
// Phases 2, 4, 5 resistance lines: TODO Phase E — populate from Document 8.
// getDailyFocusLine, getPhase3FocusLine, getResistancePhaseFocusLine
// implement the logic from Document 13 Sections 6.2–6.3 exactly.

export const DAILY_FOCUS_LINES = {
  1: {
    1: 'The mechanism, not the mystery',
    2: 'Identify before you intervene',
    3: 'Honest assessment is the foundation of specific treatment',
    4: 'Understanding your pattern is the first act of changing it',
    5: 'Every finding is information',
    6: 'Patterns emerge from honest observation',
    7: 'Your profile shapes everything that follows',
  },
  2: {
    // TODO Phase E: populate from Document 8 C.10 focus lines (C.1–C.8, 6 sections total).
    // Lines exist in Doc 8 C.10 keyed by section type — map to session numbers in Phase E.
    1: '',
    2: '',
    3: '',
    4: '',
    5: '',
    6: '',
  },
  3: {
    release: 'Release before you retrain',
    // TODO Phase E: populate resistance rotation array from Document 8 D.13–D.19 and E.12–E.16
    resistance: [] as string[],
  },
  4: {
    // TODO Phase E: populate from Document 8 Phase 4 focus lines.
    // Count of 12 (F1–F12) is unverified — based on naming convention only.
    // Confirm actual section count against Document 8 Phase 4 content in Phase E.
    // If count differs, update both PHASE_SESSION_COUNTS[4] and these keys.
    1: '', 2: '', 3: '', 4: '', 5: '', 6: '',
    7: '', 8: '', 9: '', 10: '', 11: '', 12: '',
  },
  5: {
    // TODO Phase E: populate from Document 8 Phase 5 focus lines.
    // Count of 9 (G1–G9) is unverified — based on naming convention only.
    // Confirm actual section count against Document 8 Phase 5 content in Phase E.
    // If count differs, update both PHASE_SESSION_COUNTS[5] and these keys.
    1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '', 9: '',
  },
  complete: 'Maintain your protocol and trust the progress you have made',
} as const

type FrameworkProgress = {
  current_phase: number
  current_session: number
  phase5_completed_at: string | null
  resistance_phase_start: string | null
}

// Document 13 Section 6.2
export function getDailyFocusLine(progress: FrameworkProgress): string {
  if (progress.phase5_completed_at) {
    return DAILY_FOCUS_LINES.complete
  }

  if (progress.current_phase === 3) {
    return getPhase3FocusLine(progress)
  }

  const phase = progress.current_phase as 1 | 2 | 4 | 5
  const phaseLines = DAILY_FOCUS_LINES[phase] as Record<number, string>
  const line = phaseLines[progress.current_session]

  if (!line) {
    // Edge case: session at max, phase not yet advanced — return last defined line
    const sessions = Object.keys(phaseLines).map(Number)
    const lastSession = Math.max(...sessions)
    return phaseLines[lastSession] ?? ''
  }

  return line
}

// Document 13 Section 6.3
function getPhase3FocusLine(progress: FrameworkProgress): string {
  if (!progress.resistance_phase_start) {
    return DAILY_FOCUS_LINES[3].release
  }
  return getResistancePhaseFocusLine(progress.resistance_phase_start)
}

function getResistancePhaseFocusLine(resistanceStart: string): string {
  const lines = DAILY_FOCUS_LINES[3].resistance as string[]
  if (lines.length === 0) return DAILY_FOCUS_LINES[3].release

  const start = new Date(resistanceStart)
  const today = new Date()
  const daysSinceStart = Math.floor(
    (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  )
  const weekNumber = Math.floor(daysSinceStart / 7)
  const lineIndex = weekNumber % lines.length
  return lines[lineIndex]
}
