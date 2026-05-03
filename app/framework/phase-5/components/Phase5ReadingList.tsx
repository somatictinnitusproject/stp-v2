'use client'

// app/framework/phase-5/components/Phase5ReadingList.tsx
// ─────────────────────────────────────────────────────────────────
// Client component. Expandable reading rows for the Phase 5
// overview page. Forked from Phase4ReadingList with two additions:
//
//   - noAcknowledge support: when section.noAcknowledge === true,
//     onAcknowledge is omitted. ReadingView suppresses the button
//     when onAcknowledge is undefined.
//   - Empty-state placeholder: PHASE_5_READINGS is empty during M15a
//     scaffold. Renders a holding message until content lands.
//
// Multiple rows can be open simultaneously.
// phase1 is optional — not needed during M15a empty state. Required
// once content with profile modifiers lands (M15c+).
// ─────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { Phase5ReadingSection } from '@/content/framework/phase-5/types'
import type { Phase1AssessmentRow } from '@/lib/scoring/types'
import ReadingView from '@/components/exercise/reading-view'
import { acknowledgePhase5Reading } from '../actions'

interface ReadingRow {
  section: Phase5ReadingSection
  isRead: boolean
  minutes: number
}

interface Phase5ReadingListProps {
  readings: ReadingRow[]
  phase1?: Phase1AssessmentRow
}

export default function Phase5ReadingList({
  readings,
  phase1,
}: Phase5ReadingListProps) {
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

  if (readings.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-[14px] text-text-muted">Phase 5 content is being prepared.</p>
      </div>
    )
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
                  phase1={phase1!}
                  protocolOption={null}
                  reviewMode={isReadEffective}
                  onAcknowledge={
                    isReadEffective || section.noAcknowledge
                      ? undefined
                      : async () => {
                          setLocallyAcknowledgedIds((prev) => {
                            const next = new Set(prev)
                            next.add(section.id)
                            return next
                          })
                          setOpenIds((prev) => {
                            const next = new Set(prev)
                            next.delete(section.id)
                            return next
                          })
                          try {
                            await acknowledgePhase5Reading(section.id)
                          } catch (err) {
                            console.error(
                              '[Phase5ReadingList] acknowledge failed:',
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
