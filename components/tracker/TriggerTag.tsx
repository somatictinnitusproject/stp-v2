'use client'

import type { TriggerName } from '@/content/tracker-triggers'

type TriggerTagProps = {
  name: TriggerName
  selected: boolean
  onToggle: (name: TriggerName) => void
}

export default function TriggerTag({ name, selected, onToggle }: TriggerTagProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onToggle(name)}
      className={[
        'inline-flex items-center h-9 px-3.5 rounded-full border-[1.5px] text-label transition-colors duration-150',
        selected
          ? 'bg-wins-bg border-primary text-primary'
          : 'bg-surface-raised border-transparent text-text-muted',
      ].join(' ')}
    >
      {name}
    </button>
  )
}
