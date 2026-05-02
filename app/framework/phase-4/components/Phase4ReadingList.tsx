'use client'

// app/framework/phase-4/components/Phase4ReadingList.tsx
// ─────────────────────────────────────────────────────────────────
// Client component. Expandable reading rows for the Phase 4
// overview page. Forked from Phase3ReadingList (M13l.2) with two
// additions for M14b.0:
//   - reviewMode={isRead} (Phase 3 hard-codes true; Phase 4 needs
//     the first-read acknowledge flow on the overview page itself
//     since Phase 4 has no session route).
//   - onAcknowledge wired to acknowledgePhase4Reading server action
//     with optimistic local state for the ✓ Read chip.
// Multiple rows can be open simultaneously.
// ─────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { ReadingSection } from '@/content/framework/phase-4/types'
import type { Phase1AssessmentRow } from '@/lib/scoring/types'
import ReadingView from '@/components/exercise/reading-view'
import { acknowledgePhase4Reading } from '../actions'

interface ReadingRow {
  section: ReadingSection
  isRead: boolean
  minutes: number
}

interface Phase4ReadingListProps {
  readings: ReadingRow[]
  phase1: Phase1AssessmentRow
}

export default function Phase4ReadingList({
  readings,
  phase1,
}: Phase4ReadingListProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set())
  const [locallyAcknowledgedIds, setLocallyAcknowledgedIds] = useState<Set<string>>(
    new Set()
  )

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
      {readings.map(({ section, isRead }, idx) => {
        const isOpen = openIds.has(section.id)
        const isLast = idx === readings.length - 1
        const isReadEffective = isRead || locallyAcknowledgedIds.has(section.id)

        return (
          <div key={section.id} className={isLast ? '' : 'border-b border-border'}>
            <button
              type="button"
              onClick={() => toggle(section.id)}
              className="flex items-center justify-between w-full px-5 py-3 text-left hover:bg-surface-raised transition-colors"
            >
              <div>
                <p className="text-[14px] font-medium text-text-heading">{section.title}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                {isReadEffective && (
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
                  protocolOption={null}
                  reviewMode={isReadEffective}
                  onAcknowledge={
                    isReadEffective
                      ? undefined
                      : async () => {
                          setLocallyAcknowledgedIds((prev) => {
                            const next = new Set(prev)
                            next.add(section.id)
                            return next
                          })
                          try {
                            await acknowledgePhase4Reading(section.id)
                          } catch (err) {
                            console.error(
                              '[Phase4ReadingList] acknowledge failed:',
                              err
                            )
                          }
                        }
                  }
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
