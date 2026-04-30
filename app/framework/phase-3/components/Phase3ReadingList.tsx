'use client'

// app/framework/phase-3/components/Phase3ReadingList.tsx
// Client component. Expandable reading rows for the Phase 3 overview page.
// Replaces the Link-based route approach (M13l.2). Multiple rows can be
// open simultaneously. ReadingView renders inline in reviewMode (no Acknowledge).

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { ReadingSection } from '@/content/framework/phase-3/types'
import type { Phase1AssessmentRow } from '@/lib/scoring/types'
import ReadingView from '@/components/exercise/reading-view'

interface ReadingRow {
  section: ReadingSection
  isRead: boolean
  minutes: number
}

interface Phase3ReadingListProps {
  readings: ReadingRow[]
  phase1: Phase1AssessmentRow
  protocolOption: number | null
}

export default function Phase3ReadingList({
  readings,
  phase1,
  protocolOption,
}: Phase3ReadingListProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set())

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="-mx-5">
      {readings.map(({ section, isRead, minutes }, idx) => {
        const isOpen = openIds.has(section.id)
        const isLast = idx === readings.length - 1

        return (
          <div key={section.id} className={isLast ? '' : 'border-b border-border'}>
            <button
              type="button"
              onClick={() => toggle(section.id)}
              className="flex items-center justify-between w-full px-5 py-3 text-left hover:bg-surface-raised transition-colors"
            >
              <div>
                <p className="text-[14px] font-medium text-text-heading">{section.title}</p>
                <p className="text-[12px] text-text-muted mt-0.5">{minutes} min</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                {isRead && (
                  <span className="text-[12px] text-primary font-medium">✓ Read</span>
                )}
                <ChevronDown
                  size={16}
                  className={[
                    'text-text-muted transition-transform duration-200',
                    isOpen ? 'rotate-180' : '',
                  ].join(' ')}
                />
              </div>
            </button>

            {isOpen && (
              <div className="px-5 pb-4 bg-surface-raised">
                <ReadingView
                  section={section}
                  phase1={phase1}
                  protocolOption={protocolOption}
                  reviewMode={true}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
