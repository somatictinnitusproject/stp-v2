// lib/analytics/correlation.ts
// ─────────────────────────────────────────────────────────────────
// Pure statistical helpers for the correlation insight feature.
// No DB calls, no side effects.
// ─────────────────────────────────────────────────────────────────

import { SCORING_THRESHOLDS } from '@/content/scoring-thresholds'

// Pearson r between x and y. Null if n < minimum threshold or zero variance.
export function pearsonCorrelation(x: number[], y: number[]): number | null {
  if (x.length !== y.length) return null
  if (x.length < SCORING_THRESHOLDS.CORRELATION_MINIMUM_LOGS) return null

  const n = x.length
  const meanX = x.reduce((s, v) => s + v, 0) / n
  const meanY = y.reduce((s, v) => s + v, 0) / n

  let numerator = 0
  let denomX = 0
  let denomY = 0

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX
    const dy = y[i] - meanY
    numerator += dx * dy
    denomX += dx * dx
    denomY += dy * dy
  }

  if (denomX === 0 || denomY === 0) return null

  return numerator / Math.sqrt(denomX * denomY)
}

// Map an r value to a strength band, or null if below minimum.
export function getCorrelationStrength(r: number | null): 'strong' | 'moderate' | 'weak' | null {
  if (r === null) return null
  const abs = Math.abs(r)
  if (abs >= SCORING_THRESHOLDS.CORRELATION_STRONG) return 'strong'
  if (abs >= SCORING_THRESHOLDS.CORRELATION_MODERATE) return 'moderate'
  if (abs >= SCORING_THRESHOLDS.CORRELATION_MINIMUM_STRENGTH) return 'weak'
  return null
}

export function getCorrelationDirection(r: number): 'positive' | 'negative' {
  return r >= 0 ? 'positive' : 'negative'
}
