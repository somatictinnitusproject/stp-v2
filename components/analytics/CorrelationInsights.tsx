'use client'

import { Activity, AlertCircle, Moon, TrendingUp } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import InsightCard from './InsightCard'
import { computeInsights } from '@/lib/analytics/insights'
import type { CorrelationCard, BestWorstDayCard } from '@/lib/analytics/insights'
import type { ProgressLog } from '@/lib/analytics/types'

interface Props {
  logs: ProgressLog[]
  profileType: string | null
}

type InsightCardKind =
  | 'positive_strong' | 'positive_moderate' | 'positive_weak'
  | 'inverse_strong'  | 'inverse_moderate'  | 'inverse_weak'
  | 'best_worst'

type StrengthLabel = 'Strong' | 'Moderate' | 'Weak'

function strengthToLabel(s: 'strong' | 'moderate' | 'weak'): StrengthLabel {
  return s === 'strong' ? 'Strong' : s === 'moderate' ? 'Moderate' : 'Weak'
}

function toDisplayStr(val: number): string {
  return isNaN(val) ? '—' : val.toFixed(1)
}

const METRIC_ICONS: Record<string, LucideIcon> = {
  jaw_tension:   Activity,
  neck_tension:  Activity,
  stress:        AlertCircle,
  sleep_quality: Moon,
}

const METRIC_LABELS: Record<string, string> = {
  jaw_tension:   'jaw tension',
  neck_tension:  'neck tension',
  stress:        'stress',
  sleep_quality: 'sleep quality',
}

function buildCorrelationCard(card: CorrelationCard) {
  const { metric, strength, bucketDirection, avgMetricHighLoudness, avgMetricLowLoudness, showCervicalModifier } = card
  const icon = METRIC_ICONS[metric]
  const metricLabel = METRIC_LABELS[metric]
  const strengthLabel = strengthToLabel(strength)
  const highStr = toDisplayStr(avgMetricHighLoudness)
  const lowStr  = toDisplayStr(avgMetricLowLoudness)

  let kind: InsightCardKind
  let headline: string
  let body: React.ReactNode

  if (bucketDirection === 'insufficient') {
    kind = `positive_${strength}` as InsightCardKind
    headline = `Your ${metricLabel} and loudness are linked — keep logging for clearer patterns`
    body = `Pearson correlation suggests a relationship between your ${metricLabel} and loudness, but you don't yet have enough days at the high or low end of the loudness scale to characterise the pattern clearly. This will sharpen as you log more days, especially days at the extremes.`
  } else if (metric === 'sleep_quality') {
    if (bucketDirection === 'negative') {
      // Expected: higher sleep score on quieter days → positive_strength for styling
      kind = `positive_${strength}` as InsightCardKind
      headline = 'Better sleep nights tend to have lower loudness'
      body = (
        <>
          On your low-loudness days (tinnitus 3 or below) your sleep averaged{' '}
          <strong>{lowStr}</strong>. On high-loudness days (7+) it averaged{' '}
          <strong>{highStr}</strong>.
        </>
      )
    } else {
      // bucketDirection === 'positive': higher sleep score on louder days — unusual
      kind = `inverse_${strength}` as InsightCardKind
      headline = 'Better sleep nights tend to have higher loudness'
      body = (
        <>
          On your low-loudness days (tinnitus 3 or below) your sleep averaged{' '}
          <strong>{lowStr}</strong>. On high-loudness days (7+) it averaged{' '}
          <strong>{highStr}</strong>.
        </>
      )
    }
  } else {
    // jaw_tension, neck_tension, stress
    if (bucketDirection === 'positive') {
      // Expected: metric higher on louder days
      kind = `positive_${strength}` as InsightCardKind
      headline = `Higher ${metricLabel} days tend to be louder days`
    } else {
      // Unusual: metric lower on louder days
      kind = `inverse_${strength}` as InsightCardKind
      headline = `Lower ${metricLabel} days tend to be louder days`
    }
    body = (
      <>
        On your high-loudness days (tinnitus 7 or above) your {metricLabel} averaged{' '}
        <strong>{highStr}</strong>. On low-loudness days (3 or below) it averaged{' '}
        <strong>{lowStr}</strong>.
      </>
    )
  }

  const cervicalModifierText = showCervicalModifier
    ? 'Given your cervical-primary profile, this jaw tension pattern is worth noting; it may reflect the interconnected nature of your jaw and cervical drivers.'
    : undefined

  return (
    <InsightCard
      key={metric}
      kind={kind}
      icon={icon}
      headline={headline}
      body={body}
      strengthLabel={strengthLabel}
      cervicalModifierText={cervicalModifierText}
    />
  )
}

function joinNatural(parts: string[]): string {
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0]
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`
  return `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`
}

function buildBestWorstCard(card: BestWorstDayCard) {
  // Only include metrics where the absolute difference between best-5 and
  // worst-5 averages is >= 1.0 — filters out noise on small samples.
  const metrics: Array<{ label: string; best: number; worst: number }> = [
    { label: 'stress',        best: card.bestAvgStress, worst: card.worstAvgStress },
    { label: 'sleep',         best: card.bestAvgSleep,  worst: card.worstAvgSleep  },
    { label: 'jaw tension',   best: card.bestAvgJaw,    worst: card.worstAvgJaw    },
    { label: 'neck tension',  best: card.bestAvgNeck,   worst: card.worstAvgNeck   },
  ].filter((m) => Math.abs(m.best - m.worst) >= 1.0)

  if (metrics.length === 0) return null

  const bestParts  = metrics.map((m) => `${m.label} ${toDisplayStr(m.best)}`)
  const worstParts = metrics.map((m) => `${m.label} ${toDisplayStr(m.worst)}`)

  const body = (
    <>
      Your 5 lowest-loudness days averaged {joinNatural(bestParts)}. Your 5 highest-loudness
      days averaged {joinNatural(worstParts)}.
    </>
  )

  return (
    <InsightCard
      key="best_worst"
      kind="best_worst"
      icon={TrendingUp}
      headline="Patterns on your best vs worst days"
      body={body}
    />
  )
}

export default function CorrelationInsights({ logs, profileType }: Props) {
  const result = computeInsights(logs, profileType)

  return (
    <div>
      <p className="text-[12px] font-medium tracking-wider uppercase text-text-muted mb-4">
        Patterns in your data
      </p>

      {result.kind === 'below_threshold' && (
        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-[14px] text-text-body leading-relaxed">
            Personalised insights appear after 14 days of logging. You have{' '}
            {result.logCount} {result.logCount === 1 ? 'log' : 'logs'} so far —{' '}
            {14 - result.logCount} more to go.
          </p>
          <div className="mt-2 h-[6px] rounded-full bg-border overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${Math.min(100, (result.logCount / 14) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {result.kind === 'insights' && (
        <div className="flex flex-col gap-4">
          {result.cards.map((card) =>
            card.kind === 'correlation'
              ? buildCorrelationCard(card)
              : buildBestWorstCard(card)
          )}
        </div>
      )}
    </div>
  )
}
