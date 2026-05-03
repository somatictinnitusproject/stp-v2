import { lowestLoudness, bestWeekRollingAverage } from '@/lib/analytics/aggregates'
import { longestSubNStreak, longestLoggingStreak } from '@/lib/analytics/streaks'
import { SCORING_THRESHOLDS } from '@/content/scoring-thresholds'
import { formatLongChartDate } from '@/lib/analytics/dateFormat'
import type { ProgressLog } from '@/lib/analytics/types'

interface Props {
  logs: ProgressLog[]
}

interface StatCardProps {
  label: string
  value: string | null
  sub: string | null
  spanFull?: boolean
}

function StatCard({ label, value, sub, spanFull }: StatCardProps) {
  return (
    <div
      className={[
        'bg-surface border border-border rounded-xl p-4',
        spanFull ? 'col-span-2 md:col-span-1' : '',
      ].join(' ')}
    >
      <p className="text-[12px] text-text-muted mb-2">{label}</p>
      {value !== null ? (
        <>
          <p className="text-[28px] font-bold text-text-heading leading-none">{value}</p>
          {sub && <p className="text-[13px] text-text-muted mt-1">{sub}</p>}
        </>
      ) : (
        <>
          <p className="text-[28px] font-bold text-text-muted leading-none">—</p>
          <p className="text-[13px] text-text-muted mt-1">Keep logging to unlock this</p>
        </>
      )}
    </div>
  )
}

export default function PersonalBests({ logs }: Props) {
  const lowest = lowestLoudness(logs)
  const bestWeek = bestWeekRollingAverage(logs)
  const subFour = longestSubNStreak(logs, SCORING_THRESHOLDS.SUB_FOUR_STREAK_THRESHOLD)
  const subThree = longestSubNStreak(logs, SCORING_THRESHOLDS.SUB_THREE_STREAK_THRESHOLD)
  const logStreak = longestLoggingStreak(logs)

  return (
    <div>
      <p className="text-[12px] font-medium tracking-wider uppercase text-text-muted mb-4">
        Personal bests
      </p>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          label="Lowest loudness"
          value={lowest ? String(lowest.value) : null}
          sub={lowest ? formatLongChartDate(lowest.date) : null}
        />
        <StatCard
          label="Best week average"
          value={bestWeek ? bestWeek.value.toFixed(1) : null}
          sub={bestWeek ? 'Week ending ' + formatLongChartDate(bestWeek.endDate) : null}
        />
        <StatCard
          label="Longest sub-4 streak"
          value={subFour.length > 0 ? String(subFour.length) : null}
          sub={subFour.length > 0 && subFour.endDate ? 'days · ending ' + formatLongChartDate(subFour.endDate) : null}
        />
        <StatCard
          label="Longest sub-3 streak"
          value={subThree.length > 0 ? String(subThree.length) : null}
          sub={subThree.length > 0 && subThree.endDate ? 'days · ending ' + formatLongChartDate(subThree.endDate) : null}
        />
        <StatCard
          label="Longest logging streak"
          value={logStreak.length > 0 ? String(logStreak.length) : null}
          sub={logStreak.length > 0 && logStreak.endDate ? 'days · ending ' + formatLongChartDate(logStreak.endDate) : null}
          spanFull
        />
      </div>
    </div>
  )
}
