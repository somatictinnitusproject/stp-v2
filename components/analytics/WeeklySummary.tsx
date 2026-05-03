import { thisWeekVsLastWeek } from '@/lib/analytics/aggregates'
import type { ProgressLog } from '@/lib/analytics/types'

interface Props {
  logs: ProgressLog[]
  today: string
}

// This-week vs last-week loudness and logging count comparison card.
export default function WeeklySummary({ logs, today }: Props) {
  const result = thisWeekVsLastWeek(logs, today)

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <p className="text-[12px] font-medium tracking-wider uppercase text-text-muted mb-4">
        This week vs last week
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-[12px] text-text-muted mb-1">Average loudness</p>
          <p className="text-[28px] font-bold text-text-heading leading-none">
            {result.thisWeek.average !== null ? result.thisWeek.average.toFixed(1) : '—'}
          </p>
          <div className="mt-1">
            {result.thisWeek.average === null ? (
              <span className="text-[13px] text-text-muted">Not enough data</span>
            ) : result.change !== null && result.change < 0 ? (
              <span className="text-[13px] text-primary">
                ↓ {Math.abs(result.change).toFixed(1)} from last week
              </span>
            ) : result.change !== null && result.change > 0 ? (
              <span className="text-[13px] text-text-muted">
                ↑ {result.change.toFixed(1)} from last week
              </span>
            ) : result.change === 0 ? (
              <span className="text-[13px] text-text-muted">No change</span>
            ) : (
              <span className="text-[13px] text-text-muted">
                Last week: not enough data to compare
              </span>
            )}
          </div>
        </div>
        <div>
          <p className="text-[12px] text-text-muted mb-1">Logging this week</p>
          <p className="text-[28px] font-bold text-text-heading leading-none">
            {result.thisWeek.count}
          </p>
          <p className="text-[13px] text-text-muted mt-1">
            Last week: {result.lastWeek.count}
          </p>
        </div>
      </div>
    </div>
  )
}
