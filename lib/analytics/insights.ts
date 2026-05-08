// lib/analytics/insights.ts
// ─────────────────────────────────────────────────────────────────
// Orchestrator that derives insight cards from a ProgressLog array.
// All computation is pure — no DB calls.
// ─────────────────────────────────────────────────────────────────

import { pearsonCorrelation, getCorrelationStrength, getCorrelationDirection } from './correlation'
import { SCORING_THRESHOLDS } from '@/content/scoring-thresholds'
import type { ProgressLog } from './types'

export type CorrelationCard = {
  kind: 'correlation'
  metric: 'jaw_tension' | 'neck_tension' | 'stress' | 'sleep_quality'
  r: number
  strength: 'strong' | 'moderate' | 'weak'
  direction: 'positive' | 'negative'
  avgMetricHighLoudness: number   // avg metric on days where tinnitus_score >= 7
  avgMetricLowLoudness: number    // avg metric on days where tinnitus_score <= 3
  highLoudnessDayCount: number    // count of days with tinnitus_score >= 7
  lowLoudnessDayCount: number     // count of days with tinnitus_score <= 3
  bucketDirection: 'positive' | 'negative' | 'insufficient' // drives headline; 'insufficient' if either bucket < 3 days
  showCervicalModifier: boolean   // true for jaw_tension + (CERV_DOMINANT | DUAL_DRIVER) + strong
}

export type BestWorstDayCard = {
  kind: 'best_worst'
  bestAvgStress: number
  bestAvgSleep: number
  bestAvgJaw: number
  bestAvgNeck: number
  worstAvgStress: number
  worstAvgSleep: number
  worstAvgJaw: number
  worstAvgNeck: number
}

export type InsightCard = CorrelationCard | BestWorstDayCard

type InsightResult =
  | { kind: 'below_threshold'; logCount: number }
  | { kind: 'insights'; cards: InsightCard[] }

function avg(nums: number[]): number {
  if (nums.length === 0) return NaN
  return nums.reduce((s, v) => s + v, 0) / nums.length
}

type MetricKey = 'jaw_tension' | 'neck_tension' | 'stress' | 'sleep_quality'

// Maps a CorrelationCard metric key to the ProgressLog column name.
function getLogField(metric: MetricKey): keyof ProgressLog {
  return metric === 'stress' ? 'stress_level' : metric
}

export function computeInsights(
  logs: ProgressLog[],
  profileType: string | null
): InsightResult {
  if (logs.length < SCORING_THRESHOLDS.CORRELATION_MINIMUM_LOGS) {
    return { kind: 'below_threshold', logCount: logs.length }
  }

  const METRICS: MetricKey[] = ['jaw_tension', 'neck_tension', 'stress', 'sleep_quality']
  const correlationCards: CorrelationCard[] = []

  for (const metric of METRICS) {
    const field = getLogField(metric)
    const x = logs.map((l) => l[field] as number)
    const y = logs.map((l) => l.tinnitus_score)

    const r = pearsonCorrelation(x, y)
    const strength = getCorrelationStrength(r)
    if (strength === null || r === null) continue

    const direction = getCorrelationDirection(r)

    const highLoudnessDays = logs.filter((l) => l.tinnitus_score >= 7)
    const lowLoudnessDays  = logs.filter((l) => l.tinnitus_score <= 3)

    const avgMetricHighLoudness = avg(highLoudnessDays.map((l) => l[field] as number))
    const avgMetricLowLoudness  = avg(lowLoudnessDays.map((l) => l[field] as number))

    const highLoudnessDayCount = highLoudnessDays.length
    const lowLoudnessDayCount  = lowLoudnessDays.length
    const bucketDirection: 'positive' | 'negative' | 'insufficient' =
      highLoudnessDayCount < 3 || lowLoudnessDayCount < 3
        ? 'insufficient'
        : avgMetricHighLoudness > avgMetricLowLoudness
          ? 'positive'
          : 'negative'

    const showCervicalModifier =
      metric === 'jaw_tension' &&
      strength === 'strong' &&
      (profileType === 'CERV_DOMINANT' || profileType === 'DUAL_DRIVER')

    correlationCards.push({
      kind: 'correlation',
      metric,
      r,
      strength,
      direction,
      avgMetricHighLoudness,
      avgMetricLowLoudness,
      highLoudnessDayCount,
      lowLoudnessDayCount,
      bucketDirection,
      showCervicalModifier,
    })
  }

  // Best/worst day card — only meaningful if we have at least 20 logs
  let bestWorstCard: BestWorstDayCard | null = null
  if (logs.length >= 20) {
    const sorted = [...logs].sort((a, b) => a.tinnitus_score - b.tinnitus_score)
    const best5  = sorted.slice(0, 5)
    const worst5 = sorted.slice(-5)

    bestWorstCard = {
      kind: 'best_worst',
      bestAvgStress:  avg(best5.map((l) => l.stress_level)),
      bestAvgSleep:   avg(best5.map((l) => l.sleep_quality)),
      bestAvgJaw:     avg(best5.map((l) => l.jaw_tension)),
      bestAvgNeck:    avg(best5.map((l) => l.neck_tension)),
      worstAvgStress: avg(worst5.map((l) => l.stress_level)),
      worstAvgSleep:  avg(worst5.map((l) => l.sleep_quality)),
      worstAvgJaw:    avg(worst5.map((l) => l.jaw_tension)),
      worstAvgNeck:   avg(worst5.map((l) => l.neck_tension)),
    }
  }

  const cards: InsightCard[] = [
    ...correlationCards,
    ...(bestWorstCard ? [bestWorstCard] : []),
  ]

  return { kind: 'insights', cards }
}
