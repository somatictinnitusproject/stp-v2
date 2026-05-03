'use client'

// app/analytics/AnalyticsPageClient.tsx
// ─────────────────────────────────────────────────────────────────
// Client wrapper for /analytics. Holds time-window, metric-toggle,
// and mobile state, all computed or persisted client-side.
// localStorage reads deferred to useEffect to avoid SSR mismatch.
//
// Gc: main loudness graph, metric toggle row, individual metric graphs
// Gd: progress since Phase 3, personal bests, loudness distribution
// Ge: correlation insights
// Gf: community research insight
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import type { AnalyticsData } from '@/lib/analytics/types'
import type { TimeWindow } from '@/lib/analytics/timeWindow'
import { toLocalDateStr, filterByWindow } from '@/lib/analytics/timeWindow'
import { getMilestones } from '@/lib/analytics/milestones'
import LoggingStreakCounter from '@/components/analytics/LoggingStreakCounter'
import TimeWindowSelector from '@/components/analytics/TimeWindowSelector'
import MetricToggleRow from '@/components/analytics/MetricToggleRow'
import MainAnalyticsChart from '@/components/analytics/MainAnalyticsChart'
import MilestoneLegend from '@/components/analytics/MilestoneLegend'
import WeeklySummary from '@/components/analytics/WeeklySummary'
import IndividualMetricGraphs from '@/components/analytics/IndividualMetricGraphs'
import PersonalBests from '@/components/analytics/PersonalBests'
import LoudnessDistribution from '@/components/analytics/LoudnessDistribution'
import ProgressSincePhase3 from '@/components/analytics/ProgressSincePhase3'

interface ActiveMetrics {
  jaw_tension: boolean
  neck_tension: boolean
  stress: boolean
  sleep_quality: boolean
}

const DEFAULT_WINDOW: TimeWindow = '30d'
const DEFAULT_METRICS: ActiveMetrics = {
  jaw_tension: false,
  neck_tension: false,
  stress: false,
  sleep_quality: false,
}

const LS_WINDOW_KEY = 'stp.analytics.window'
const LS_METRICS_KEY = 'stp.analytics.metrics'
const VALID_WINDOWS: TimeWindow[] = ['7d', '30d', '3m', 'all']

interface Props {
  data: AnalyticsData
}

export default function AnalyticsPageClient({ data }: Props) {
  const [timeWindow, setTimeWindow] = useState<TimeWindow>(DEFAULT_WINDOW)
  const [activeMetrics, setActiveMetrics] = useState<ActiveMetrics>(DEFAULT_METRICS)
  const [isMobile, setIsMobile] = useState(false)
  const today = toLocalDateStr(new Date())

  // Restore persisted state — deferred to avoid SSR hydration mismatch
  useEffect(() => {
    const savedWindow = localStorage.getItem(LS_WINDOW_KEY)
    if (savedWindow && (VALID_WINDOWS as string[]).includes(savedWindow)) {
      setTimeWindow(savedWindow as TimeWindow)
    }

    const savedMetrics = localStorage.getItem(LS_METRICS_KEY)
    if (savedMetrics) {
      try {
        const parsed = JSON.parse(savedMetrics) as Partial<ActiveMetrics>
        setActiveMetrics({
          jaw_tension: parsed.jaw_tension ?? false,
          neck_tension: parsed.neck_tension ?? false,
          stress: parsed.stress ?? false,
          sleep_quality: parsed.sleep_quality ?? false,
        })
      } catch {
        // ignore malformed stored value
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(LS_WINDOW_KEY, timeWindow)
  }, [timeWindow])

  useEffect(() => {
    localStorage.setItem(LS_METRICS_KEY, JSON.stringify(activeMetrics))
  }, [activeMetrics])

  // Track mobile breakpoint — default false during SSR, corrected on mount
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const filteredLogs = filterByWindow(data.logs, timeWindow)
  const milestones = getMilestones(data.frameworkProgress)

  return (
    <div>
      <h1 className="text-[28px] md:text-[36px] font-bold leading-[1.2] text-text-heading mb-6">
        Your progress
      </h1>

      <div className="mb-6">
        <LoggingStreakCounter logs={data.logs} />
      </div>

      <div className="mb-6">
        <TimeWindowSelector value={timeWindow} onChange={setTimeWindow} />
      </div>

      <div className="mb-4">
        <MetricToggleRow activeMetrics={activeMetrics} onChange={setActiveMetrics} />
      </div>

      <div className="mb-6">
        <MainAnalyticsChart
          logs={filteredLogs}
          activeMetrics={activeMetrics}
          milestones={milestones}
          isMobile={isMobile}
        />
      </div>

      <div className="mb-6">
        <MilestoneLegend frameworkProgress={data.frameworkProgress} />
      </div>

      <div className="mb-6">
        <ProgressSincePhase3 logs={data.logs} frameworkProgress={data.frameworkProgress} />
      </div>

      <div className="mb-6">
        <WeeklySummary logs={data.logs} today={today} />
      </div>

      <div className="mb-6">
        {/* correlation insights — Ge */}
      </div>

      <div className="mb-6">
        <PersonalBests logs={data.logs} />
      </div>

      <div className="mb-6">
        <LoudnessDistribution logs={data.logs} isMobile={isMobile} />
      </div>

      <div className="mb-6">
        <IndividualMetricGraphs logs={filteredLogs} isMobile={isMobile} />
      </div>

      <div className="mb-6">
        {/* community research insight — Gf */}
      </div>
    </div>
  )
}
