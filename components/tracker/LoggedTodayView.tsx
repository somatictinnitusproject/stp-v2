'use client'

import Link from 'next/link'
import TriggerTag from '@/components/tracker/TriggerTag'
import type { TodayLog } from '@/lib/tracker/queries'
import type { TriggerName } from '@/content/tracker-triggers'

type Props = {
  todayLog: NonNullable<TodayLog>
  isEditable: boolean
  today: string
  onEdit: () => void
}

const SCORE_CARDS = [
  { label: 'Loudness', key: 'tinnitus_score' },
  { label: 'Jaw',      key: 'jaw_tension' },
  { label: 'Neck',     key: 'neck_tension' },
  { label: 'Stress',   key: 'stress_level' },
  { label: 'Sleep',    key: 'sleep_quality' },
] as const

export default function LoggedTodayView({ todayLog, isEditable, today, onEdit }: Props) {
  // Noon UTC avoids timezone-off-by-one when formatting the display date
  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  }).format(new Date(today + 'T12:00:00'))

  return (
    <div className="max-w-[680px] mx-auto pt-8 pb-16">
      <h1 className="text-[28px] font-bold text-text-heading leading-tight mb-1">
        Today's log
      </h1>
      <p className="text-body-sm text-text-muted mb-6">{formattedDate}</p>

      {/* Score summary row — flex so 5 cards scroll on narrow viewports */}
      <div className="flex gap-[10px] overflow-x-auto scrollbar-none pb-1 mb-6">
        {SCORE_CARDS.map(({ label, key }) => (
          <div
            key={key}
            className="flex-1 min-w-[64px] bg-surface border border-border rounded-[10px] p-[14px_10px] text-center"
          >
            <p className="text-[10px] font-medium uppercase tracking-[0.05em] text-text-muted mb-1">
              {label}
            </p>
            <p className="text-[24px] font-bold text-text-heading leading-none">
              {todayLog[key]}
            </p>
          </div>
        ))}
      </div>

      {/* Triggers — only rendered when triggers were logged */}
      {todayLog.triggerNames.length > 0 && (
        <div className="mb-5">
          <p className="text-section-label uppercase tracking-[0.06em] text-text-muted mb-2">
            Triggers logged
          </p>
          <div className="flex flex-wrap gap-2">
            {todayLog.triggerNames.map(n => (
              <TriggerTag
                key={n}
                name={n as TriggerName}
                selected={true}
                onToggle={() => {}}
              />
            ))}
          </div>
        </div>
      )}

      {/* Notes — only rendered when notes were saved */}
      {todayLog.notes && (
        <div className="mb-5">
          <p className="text-section-label uppercase tracking-[0.06em] text-text-muted mb-2">
            Notes
          </p>
          <p className="text-body text-text-body whitespace-pre-wrap">{todayLog.notes}</p>
        </div>
      )}

      {/* Edit button — secondary style per Doc 11 B2 */}
      {isEditable && (
        <button
          type="button"
          onClick={onEdit}
          className="w-full h-12 px-6 bg-surface border border-border text-text-body text-btn-primary rounded-lg hover:border-primary hover:text-primary transition-colors duration-150 mb-3"
        >
          Edit today's log
        </button>
      )}

      <div className="text-center">
        <Link
          href="/analytics"
          className="inline-flex items-center text-btn-primary text-primary px-3 py-2 rounded-lg hover:bg-wins-bg transition-colors duration-150"
        >
          View your progress analytics →
        </Link>
      </div>

      {/* TODO M11: weekly sparkline — requires 7-day tinnitus_score query, not yet fetched */}
    </div>
  )
}
