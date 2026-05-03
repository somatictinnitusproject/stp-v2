'use client'

import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import {
  METRIC_COLOURS,
  sharedAxisProps,
  sharedTooltipStyle,
  sharedTooltipLabelStyle,
} from '@/content/design-tokens'
import { formatChartDate } from '@/lib/analytics/dateFormat'
import type { ProgressLog } from '@/lib/analytics/types'

interface Props {
  logs: ProgressLog[]
  isMobile: boolean
}

interface MiniPoint {
  log_date: string
  jaw_tension: number
  neck_tension: number
  stress: number
  sleep_quality: number
}

function buildMiniData(logs: ProgressLog[]): MiniPoint[] {
  type Accum = { jaws: number[]; necks: number[]; stresses: number[]; sleeps: number[] }
  const dayMap = new Map<string, Accum>()

  for (const log of logs) {
    if (!dayMap.has(log.log_date)) {
      dayMap.set(log.log_date, { jaws: [], necks: [], stresses: [], sleeps: [] })
    }
    const e = dayMap.get(log.log_date)!
    e.jaws.push(log.jaw_tension)
    e.necks.push(log.neck_tension)
    e.stresses.push(log.stress_level)
    e.sleeps.push(log.sleep_quality)
  }

  const avg = (nums: number[]) =>
    parseFloat((nums.reduce((s, v) => s + v, 0) / nums.length).toFixed(1))

  return Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, e]) => ({
      log_date:     date,
      jaw_tension:  avg(e.jaws),
      neck_tension: avg(e.necks),
      stress:       avg(e.stresses),
      sleep_quality: avg(e.sleeps),
    }))
}

const METRIC_CONFIG = [
  { key: 'jaw_tension'   as const, label: 'Jaw tension',   labelClass: 'text-metric-jaw' },
  { key: 'neck_tension'  as const, label: 'Neck tension',  labelClass: 'text-metric-neck' },
  { key: 'stress'        as const, label: 'Stress',         labelClass: 'text-metric-stress' },
  { key: 'sleep_quality' as const, label: 'Sleep quality',  labelClass: 'text-metric-sleep' },
]

interface MiniChartProps {
  data: MiniPoint[]
  dataKey: keyof Omit<MiniPoint, 'log_date'>
  stroke: string
  metricLabel: string
  labelClass: string
  isMobile: boolean
  reducedMotion: boolean
}

function MetricMiniChart({
  data,
  dataKey,
  stroke,
  metricLabel,
  labelClass,
  isMobile,
  reducedMotion,
}: MiniChartProps) {
  const chartHeight = isMobile ? 120 : 160
  const firstDate = data[0]?.log_date
  const lastDate = data[data.length - 1]?.log_date

  if (data.length < 2) {
    return (
      <div>
        <p className={`text-[14px] font-semibold mb-2 ${labelClass}`}>{metricLabel}</p>
        <div
          className={`flex items-center justify-center bg-surface border border-border rounded-xl ${isMobile ? 'h-[120px]' : 'h-[160px]'}`}
        >
          <p className="text-[13px] text-text-muted text-center px-4">
            Not enough data for this time window.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <p className={`text-[14px] font-semibold mb-2 ${labelClass}`}>{metricLabel}</p>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <LineChart data={data} margin={{ top: 4, right: 10, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="log_date"
            ticks={[firstDate, lastDate]}
            tickFormatter={formatChartDate}
            {...sharedAxisProps}
          />
          <Tooltip
            contentStyle={sharedTooltipStyle}
            labelStyle={sharedTooltipLabelStyle}
            labelFormatter={(val) => formatChartDate(val as string)}
            formatter={(value: unknown) => [Number(value).toFixed(1), metricLabel]}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={stroke}
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 4, fill: stroke, stroke: '#FFFFFF', strokeWidth: 2 }}
            isAnimationActive={!reducedMotion}
            animationDuration={600}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function IndividualMetricGraphs({ logs, isMobile }: Props) {
  const reducedMotion = useReducedMotion()
  const data = buildMiniData(logs)

  return (
    <div>
      <p className="text-[12px] font-medium tracking-wider uppercase text-text-muted mb-4">
        Individual metrics
      </p>
      <div className="flex flex-col gap-6">
        {METRIC_CONFIG.map(({ key, label, labelClass }) => (
          <MetricMiniChart
            key={key}
            data={data}
            dataKey={key}
            stroke={METRIC_COLOURS[key]}
            metricLabel={label}
            labelClass={labelClass}
            isMobile={isMobile}
            reducedMotion={reducedMotion}
          />
        ))}
      </div>
    </div>
  )
}
