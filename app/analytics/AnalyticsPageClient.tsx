'use client'

// app/analytics/AnalyticsPageClient.tsx
// ─────────────────────────────────────────────────────────────────
// Client wrapper for /analytics. Holds time-window and metric-toggle
// state, both persisted to localStorage. localStorage reads are
// deferred to useEffect to avoid SSR hydration mismatch.
//
// This milestone (Ga): scaffold only — no charts, no insight cards.
// Section slots are placeholder divs. Future milestones populate them:
//   Gb: streak counter, time window selector, this week vs last week,
//       milestone legend
//   Gc: main loudness graph, individual metric graphs
//   Gd: progress since Phase 3, personal bests, loudness distribution
//   Ge: correlation insights
//   Gf: community research insight
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import type { AnalyticsData } from '@/lib/analytics/types'
import type { TimeWindow } from '@/lib/analytics/timeWindow'

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

export default function AnalyticsPageClient({ data: _data }: Props) {
  const [timeWindow, setTimeWindow] = useState<TimeWindow>(DEFAULT_WINDOW)
  const [activeMetrics, setActiveMetrics] = useState<ActiveMetrics>(DEFAULT_METRICS)

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

  // setTimeWindow and setActiveMetrics wired to future Gb selectors.
  void setTimeWindow
  void setActiveMetrics

  return (
    <div>
      <h1 className="text-[28px] md:text-[36px] font-bold leading-[1.2] text-text-heading mb-6">
        Your progress
      </h1>

      <p className="text-[12px] text-text-muted italic mb-8">
        Analytics scaffold — sections populate in Gb–Gf. Active window: {timeWindow}.
      </p>

      <div className="mb-4">
        {/* streak counter — Gb */}
      </div>

      <div className="mb-4">
        {/* time window selector — Gb */}
      </div>

      <div className="mb-4">
        {/* main loudness graph — Gc */}
      </div>

      <div className="mb-4">
        {/* milestone legend — Gb */}
      </div>

      <div className="mb-4">
        {/* progress since Phase 3 — Gd */}
      </div>

      <div className="mb-4">
        {/* this week vs last week — Gb */}
      </div>

      <div className="mb-4">
        {/* correlation insights — Ge */}
      </div>

      <div className="mb-4">
        {/* personal bests — Gd */}
      </div>

      <div className="mb-4">
        {/* loudness distribution — Gd */}
      </div>

      <div className="mb-4">
        {/* individual metric graphs — Gc */}
      </div>

      <div className="mb-4">
        {/* community research insight — Gf */}
      </div>
    </div>
  )
}
