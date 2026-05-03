import { toLocalDateStr } from '@/lib/analytics/timeWindow'
import type { ProgressLog } from '@/lib/analytics/types'
import type { FrameworkProgressRow } from '@/lib/scoring/types'

interface Props {
  logs: ProgressLog[]
  frameworkProgress: FrameworkProgressRow | null
}

function avgScore(logs: ProgressLog[]): number | null {
  if (logs.length < 2) return null
  return logs.reduce((s, l) => s + l.tinnitus_score, 0) / logs.length
}

export default function ProgressSincePhase3({ logs, frameworkProgress }: Props) {
  if (!frameworkProgress) return null

  const p3StartRaw =
    frameworkProgress.resistance_phase_start ?? frameworkProgress.phase2_completed_at
  if (!p3StartRaw) return null

  const p3StartDate = toLocalDateStr(new Date(p3StartRaw))

  const before = logs.filter((l) => l.log_date < p3StartDate)
  const after  = logs.filter((l) => l.log_date >= p3StartDate)

  const avgBefore = avgScore(before)
  const avgAfter  = avgScore(after)

  if (avgBefore === null || avgAfter === null) return null

  const change = avgBefore - avgAfter  // Positive = loudness reduced (good)

  const today = toLocalDateStr(new Date())
  const p3Ms = new Date(p3StartDate).getTime()
  const todayMs = new Date(today).getTime()
  const daysSinceP3 = Math.round((todayMs - p3Ms) / (1000 * 60 * 60 * 24))

  let body: React.ReactNode

  if (change >= 0.5) {
    body = (
      <p className="text-[15px] text-text-body leading-relaxed">
        Since starting Phase 3 {daysSinceP3} days ago, your average loudness has reduced by{' '}
        <span className="text-primary font-medium">{change.toFixed(1)} points</span>.
      </p>
    )
  } else if (change <= -0.5) {
    body = (
      <p className="text-[15px] text-text-body leading-relaxed">
        Since starting Phase 3 {daysSinceP3} days ago, your average loudness has increased by{' '}
        {Math.abs(change).toFixed(1)} points. Trends fluctuate — most members see meaningful
        change after 6–8 weeks of consistent protocol work.
      </p>
    )
  } else {
    body = (
      <p className="text-[15px] text-text-body leading-relaxed">
        Your trend is still early — most members see meaningful change after 6–8 weeks of
        consistent protocol work.
      </p>
    )
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <p className="text-[12px] font-medium tracking-wider uppercase text-text-muted mb-2">
        Progress since Phase 3
      </p>
      {body}
    </div>
  )
}
