import { WINDOW_OPTIONS } from '@/lib/analytics/timeWindow'
import type { TimeWindow } from '@/lib/analytics/timeWindow'

interface Props {
  value: TimeWindow
  onChange: (w: TimeWindow) => void
}

// Controlled pill-toggle row for selecting the analytics time window.
export default function TimeWindowSelector({ value, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none">
      {WINDOW_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={[
            'h-9 px-4 rounded-full font-medium text-[14px] shrink-0 transition-colors',
            value === opt.value
              ? 'bg-primary text-white'
              : 'bg-surface border border-border text-text-muted hover:bg-surface-raised',
          ].join(' ')}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
