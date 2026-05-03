// /content/framework/phase-5/_lookup.ts
// ─────────────────────────────────────────────────────────────────
// Lookup helper for Phase 5 readings by id. Mirrors phase-4
// _lookup.ts pattern. Returns undefined when no match — expected
// during M15a when PHASE_5_READINGS is empty.
// ─────────────────────────────────────────────────────────────────

import type { Phase5ReadingSection } from './types'
import { PHASE_5_READINGS } from './index'

const READING_MAP = new Map<string, Phase5ReadingSection>(
  PHASE_5_READINGS.map((r) => [r.id, r])
)

export function getReadingSectionById(id: string): Phase5ReadingSection | undefined {
  return READING_MAP.get(id)
}
