import { currentLoggingStreak, longestLoggingStreak } from '@/lib/analytics/streaks'
import { toLocalDateStr } from '@/lib/analytics/timeWindow'
import type { ProgressLog } from '@/lib/analytics/types'

interface Props {
  logs: ProgressLog[]
}

// Displays current and longest logging streaks with an amber nudge if today is unlogged.
export default function LoggingStreakCounter({ logs }: Props) {
  const currentStreak = currentLoggingStreak(logs)
  const { length: longestStreak } = longestLoggingStreak(logs)

  const todayStr = toLocalDateStr(new Date())
  const todayLogged = logs.some((l) => l.log_date === todayStr)
  const showAmberDot = !todayLogged && currentStreak > 0

  return (
    <div>
      <div className="flex items-baseline gap-2">
        {showAmberDot && (
          <span className="w-2 h-2 rounded-full bg-metric-stress flex-shrink-0 self-center" />
        )}
        <span className="text-[32px] font-bold text-text-heading leading-none">
          {currentStreak}
        </span>
        <span className="text-[12px] font-medium text-text-muted self-end pb-0.5">
          day logging streak
        </span>
      </div>
      {longestStreak > 0 && (
        <p className="text-[13px] text-text-muted mt-1">
          Longest streak: {longestStreak} days
        </p>
      )}
      {showAmberDot && (
        <p className="text-[13px] text-text-muted mt-1">
          Log today to keep your streak.
        </p>
      )}
    </div>
  )
}
