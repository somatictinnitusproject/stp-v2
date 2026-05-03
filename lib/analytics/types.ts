// lib/analytics/types.ts
// ─────────────────────────────────────────────────────────────────
// Shared types for the /analytics feature.
//
// ProgressLog mirrors the progress_logs DB row fields used across
// analytics helpers. Column names are verbatim DB names throughout
// — no rename layer.
//
// AnalyticsData is the single prop shape passed from the server
// component (app/analytics/page.tsx) to the client wrapper.
// ─────────────────────────────────────────────────────────────────

import type { FrameworkProgressRow } from '@/lib/scoring/types'
import type { Phase1AssessmentRow } from '@/lib/scoring/types'

export type ProgressLog = {
  id: string
  user_id: string
  log_date: string
  tinnitus_score: number
  jaw_tension: number
  neck_tension: number
  stress_level: number
  sleep_quality: number
  notes: string | null
  created_at: string
}

export type AnalyticsData = {
  logs: ProgressLog[]
  frameworkProgress: FrameworkProgressRow | null
  phase1Assessment: Phase1AssessmentRow | null
}
