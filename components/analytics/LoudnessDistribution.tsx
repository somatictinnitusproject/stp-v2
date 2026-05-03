'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import {
  CHART_COLOURS,
  sharedAxisProps,
  sharedTooltipStyle,
  sharedTooltipLabelStyle,
} from '@/content/design-tokens'
import { loudnessDistribution } from '@/lib/analytics/aggregates'
import type { ProgressLog } from '@/lib/analytics/types'

interface Props {
  logs: ProgressLog[]
  isMobile: boolean
}

export default function LoudnessDistribution({ logs, isMobile }: Props) {
  const reducedMotion = useReducedMotion()

  if (logs.length < 14) return null

  const data = loudnessDistribution(logs)
  const chartHeight = isMobile ? 200 : 240

  return (
    <div>
      <p className="text-[12px] font-medium tracking-wider uppercase text-text-muted mb-4">
        Loudness distribution
      </p>
      <p className="text-[13px] text-text-muted mb-4">
        How your daily loudness scores have distributed across the scale. Earlier vs recent
        halves of your logging history.
      </p>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={data}
          barGap={2}
          barCategoryGap={6}
          margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
        >
          <XAxis dataKey="score" {...sharedAxisProps} />
          <YAxis allowDecimals={false} {...sharedAxisProps} />
          <Tooltip
            contentStyle={sharedTooltipStyle}
            labelStyle={sharedTooltipLabelStyle}
            labelFormatter={(score) => `Loudness ${score}`}
          />
          <Legend
            align="right"
            verticalAlign="top"
            iconType="square"
            iconSize={10}
            wrapperStyle={{ fontSize: 12, color: '#6B7280', fontFamily: 'Inter' }}
          />
          <Bar
            dataKey="earlier"
            name="Earlier period"
            fill={CHART_COLOURS.distribution_earlier}
            radius={[3, 3, 0, 0]}
            isAnimationActive={!reducedMotion}
            animationDuration={600}
          />
          <Bar
            dataKey="recent"
            name="Recent period"
            fill={CHART_COLOURS.distribution_recent}
            radius={[3, 3, 0, 0]}
            isAnimationActive={!reducedMotion}
            animationDuration={600}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
