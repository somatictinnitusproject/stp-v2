// /content/framework/phase-4/_lookup.ts
// ─────────────────────────────────────────────────────────────────
// Lookup helper for Phase 4 readings by id. Mirrors phase-3
// _lookup.ts pattern. Returns undefined when no match — consumers
// must handle missing readings (during M14a all lookups will miss
// because the registry is empty).
// ─────────────────────────────────────────────────────────────────

import type { ReadingSection } from './types'
import { PHASE_4_READINGS } from './index'

const READING_MAP = new Map<string, ReadingSection>(
  PHASE_4_READINGS.map((r) => [r.id, r])
)

export function getReadingSectionById(id: string): ReadingSection | undefined {
  return READING_MAP.get(id)
}
