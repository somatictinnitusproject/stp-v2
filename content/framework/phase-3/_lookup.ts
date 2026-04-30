// /content/framework/phase-3/_lookup.ts
// Lookup for Phase 3 TMJ reading sections by ID.
// Used by /session page to resolve reading IDs in the mixed session list.

import { PHASE_3_TMJ_READINGS } from './index'
import type { ReadingSection } from './types'

const READING_MAP = new Map<string, ReadingSection>(
  PHASE_3_TMJ_READINGS.map((s) => [s.id, s]),
)

/**
 * Returns the ReadingSection for the given ID.
 * Throws if the ID is unknown — IDs come from buildPhase3OrientationList which
 * is type-checked, so an unknown ID here indicates a programming error.
 */
export function getReadingSectionById(id: string): ReadingSection {
  const section = READING_MAP.get(id)
  if (!section) throw new Error(`Unknown reading section ID: "${id}"`)
  return section
}
