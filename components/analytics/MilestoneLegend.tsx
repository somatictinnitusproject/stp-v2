import { getMilestones } from '@/lib/analytics/milestones'
import type { FrameworkProgressRow } from '@/lib/scoring/types'

interface Props {
  frameworkProgress: FrameworkProgressRow | null
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  return `${String(day).padStart(2, '0')} ${MONTHS[month - 1]} ${year}`
}

// Renders the list of reached phase milestones with dates. Returns null if no milestones yet.
export default function MilestoneLegend({ frameworkProgress }: Props) {
  const milestones = getMilestones(frameworkProgress)
  if (milestones.length === 0) return null

  return (
    <div>
      <p className="text-[12px] font-medium tracking-wider uppercase text-text-muted mb-3">
        Phase milestones
      </p>
      <div className="flex flex-col gap-2">
        {milestones.map((m) => (
          <div key={m.id} className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-text-muted flex-shrink-0" />
            <span className="text-[15px] text-text-body">{m.label}</span>
            <span className="text-[13px] text-text-muted ml-auto">{formatDate(m.date)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
