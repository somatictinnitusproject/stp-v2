// /content/framework/phase-4/types.ts
// ─────────────────────────────────────────────────────────────────
// Phase 4 readings use the same ReadingSection contract as Phase 3.
// Re-exported from phase-3 so phase-4 reading files import locally
// without crossing phase boundaries directly.
// ─────────────────────────────────────────────────────────────────

export type { ReadingSection } from '@/content/framework/phase-3/types'
