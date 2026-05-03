'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ReferenceLine,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import {
  CHART_COLOURS,
  METRIC_COLOURS,
  sharedAxisProps,
  sharedTooltipStyle,
  sharedTooltipLabelStyle,
} from '@/content/design-tokens'
import { formatChartDate } from '@/lib/analytics/dateFormat'
import type { ProgressLog } from '@/lib/analytics/types'
import type { Milestone } from '@/lib/analytics/milestones'

interface ActiveMetrics {
  jaw_tension: boolean
  neck_tension: boolean
  stress: boolean
  sleep_quality: boolean
}

interface Props {
  logs: ProgressLog[]
  activeMetrics: ActiveMetrics
  milestones: Milestone[]
  isMobile: boolean
}

interface ChartPoint {
  log_date: string
  tinnitus_score: number | null
  jaw_tension: number | null
  neck_tension: number | null
  stress: number | null
  sleep_quality: number | null
}

function avg(nums: number[]): number {
  return parseFloat((nums.reduce((s, v) => s + v, 0) / nums.length).toFixed(1))
}

// Averages same-day logs and injects milestone dates as null-score points so
// ReferenceLine renders correctly on a category XAxis.
function buildChartData(logs: ProgressLog[], milestoneDates: string[]): ChartPoint[] {
  type Accum = { scores: number[]; jaws: number[]; necks: number[]; stresses: number[]; sleeps: number[] }
  const dayMap = new Map<string, Accum>()

  for (const log of logs) {
    if (!dayMap.has(log.log_date)) {
      dayMap.set(log.log_date, { scores: [], jaws: [], necks: [], stresses: [], sleeps: [] })
    }
    const e = dayMap.get(log.log_date)!
    e.scores.push(log.tinnitus_score)
    e.jaws.push(log.jaw_tension)
    e.necks.push(log.neck_tension)
    e.stresses.push(log.stress_level)
    e.sleeps.push(log.sleep_quality)
  }

  const allDates = new Set([...dayMap.keys(), ...milestoneDates])
  return Array.from(allDates)
    .sort()
    .map((date) => {
      const e = dayMap.get(date)
      return {
        log_date: date,
        tinnitus_score: e ? avg(e.scores) : null,
        jaw_tension:    e ? avg(e.jaws)   : null,
        neck_tension:   e ? avg(e.necks)  : null,
        stress:         e ? avg(e.stresses) : null,
        sleep_quality:  e ? avg(e.sleeps) : null,
      }
    })
}

function getTickFormatter(chartData: ChartPoint[], spanDays: number) {
  if (spanDays <= 7) {
    return (val: string) =>
      chartData.find((p) => p.log_date === val)?.tinnitus_score != null
        ? formatChartDate(val)
        : ''
  }
  if (spanDays <= 30) {
    return (val: string, index: number) => (index % 5 === 0 ? formatChartDate(val) : '')
  }
  if (spanDays <= 90) {
    return (val: string, index: number) => (index % 7 === 0 ? formatChartDate(val) : '')
  }
  // > 90 days: first entry of each calendar month
  return (val: string, index: number) => {
    if (index === 0) return formatChartDate(val)
    const prevMonth = chartData[index - 1]?.log_date.slice(0, 7)
    return val.slice(0, 7) !== prevMonth ? formatChartDate(val) : ''
  }
}

const TOOLTIP_LABELS: Record<string, string> = {
  tinnitus_score: 'Loudness',
  jaw_tension:    'Jaw tension',
  neck_tension:   'Neck tension',
  stress:         'Stress',
  sleep_quality:  'Sleep quality',
}

export default function MainAnalyticsChart({ logs, activeMetrics, milestones, isMobile }: Props) {
  const reducedMotion = useReducedMotion()
  const chartHeight = isMobile ? 240 : 320

  if (logs.length < 2) {
    return (
      <div
        className={`flex items-center justify-center bg-surface border border-border rounded-xl ${isMobile ? 'h-[240px]' : 'h-[320px]'}`}
      >
        <p className="text-[13px] text-text-muted text-center px-4 max-w-xs">
          Not enough data for this time window. Select a longer period or keep logging.
        </p>
      </div>
    )
  }

  const logDates = [...new Set(logs.map((l) => l.log_date))].sort()
  const firstLogDate = logDates[0]
  const lastLogDate = logDates[logDates.length - 1]
  const spanDays = Math.round(
    (new Date(lastLogDate).getTime() - new Date(firstLogDate).getTime()) / (1000 * 60 * 60 * 24)
  )

  const visibleMilestones = milestones.filter(
    (m) => m.date >= firstLogDate && m.date <= lastLogDate
  )

  const chartData = buildChartData(logs, visibleMilestones.map((m) => m.date))
  const tickFormatter = getTickFormatter(chartData, spanDays)

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <LineChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="log_date"
          tickFormatter={tickFormatter}
          {...sharedAxisProps}
        />
        <YAxis
          domain={[1, 10]}
          ticks={[1, 4, 7, 10]}
          {...sharedAxisProps}
        />
        <ReferenceLine y={4} stroke={CHART_COLOURS.grid_line} strokeDasharray="3 3" />
        <ReferenceLine y={7} stroke={CHART_COLOURS.grid_line} strokeDasharray="3 3" />
        {visibleMilestones.map((m) => (
          <ReferenceLine
            key={m.id}
            x={m.date}
            stroke={CHART_COLOURS.milestone_line}
            strokeDasharray="4 4"
            label={{
              value: m.shortLabel,
              position: 'top',
              fontSize: 10,
              fill: '#6B7280',
              fontFamily: 'Inter',
            }}
          />
        ))}
        <Tooltip
          contentStyle={sharedTooltipStyle}
          labelStyle={sharedTooltipLabelStyle}
          labelFormatter={(val) => formatChartDate(val as string)}
          formatter={(value: unknown, name: string | number | undefined) => {
            const key = String(name ?? '')
            if (value === null || value === undefined) return ['—', TOOLTIP_LABELS[key] ?? key]
            return [Number(value).toFixed(1), TOOLTIP_LABELS[key] ?? key]
          }}
        />
        <Line
          type="monotone"
          dataKey="tinnitus_score"
          stroke={CHART_COLOURS.loudness}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: CHART_COLOURS.loudness, stroke: '#FFFFFF', strokeWidth: 2 }}
          connectNulls
          isAnimationActive={!reducedMotion}
          animationDuration={800}
        />
        {activeMetrics.jaw_tension && (
          <Line
            type="monotone"
            dataKey="jaw_tension"
            stroke={METRIC_COLOURS.jaw_tension}
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 4, fill: METRIC_COLOURS.jaw_tension, stroke: '#FFFFFF', strokeWidth: 2 }}
            connectNulls
            isAnimationActive={!reducedMotion}
            animationDuration={800}
          />
        )}
        {activeMetrics.neck_tension && (
          <Line
            type="monotone"
            dataKey="neck_tension"
            stroke={METRIC_COLOURS.neck_tension}
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 4, fill: METRIC_COLOURS.neck_tension, stroke: '#FFFFFF', strokeWidth: 2 }}
            connectNulls
            isAnimationActive={!reducedMotion}
            animationDuration={800}
          />
        )}
        {activeMetrics.stress && (
          <Line
            type="monotone"
            dataKey="stress"
            stroke={METRIC_COLOURS.stress}
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 4, fill: METRIC_COLOURS.stress, stroke: '#FFFFFF', strokeWidth: 2 }}
            connectNulls
            isAnimationActive={!reducedMotion}
            animationDuration={800}
          />
        )}
        {activeMetrics.sleep_quality && (
          <Line
            type="monotone"
            dataKey="sleep_quality"
            stroke={METRIC_COLOURS.sleep_quality}
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 4, fill: METRIC_COLOURS.sleep_quality, stroke: '#FFFFFF', strokeWidth: 2 }}
            connectNulls
            isAnimationActive={!reducedMotion}
            animationDuration={800}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}
