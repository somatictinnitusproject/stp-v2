'use client'

// app/framework/phase-5/components/Phase5ReadingList.tsx
// ─────────────────────────────────────────────────────────────────
// Client component. Expandable reading rows for the Phase 5
// overview page. Forked from Phase4ReadingList with additions:
//
//   - noAcknowledge support: when section.noAcknowledge === true,
//     onAcknowledge is omitted. ReadingView suppresses the button.
//   - acknowledgeRequires gating: when section.acknowledgeRequires
//     === 'phase5_outcome_type', the acknowledge button is suppressed
//     until an outcome has been selected (local or server state).
//   - Outcome selection threading: selectedValue/onSelectValue wired
//     to ReadingView for sections requiring outcome selection.
//   - Empty-state placeholder: renders when PHASE_5_READINGS is [].
//
// Multiple rows can be open simultaneously.
// phase1 is optional — not needed during M15a/M15b empty state.
// ─────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import {
  PHASE5_OUTCOME_VALUES,
  type Phase5ReadingSection,
  type Phase5OutcomeType,
} from '@/content/framework/phase-5/types'
import type { Phase1AssessmentRow } from '@/lib/scoring/types'
import ReadingView from '@/components/exercise/reading-view'
import { acknowledgePhase5Reading, setPhase5OutcomeType } from '../actions'

interface ReadingRow {
  section: Phase5ReadingSection
  isRead: boolean
  minutes: number
}

interface Phase5ReadingListProps {
  readings: ReadingRow[]
  phase1?: Phase1AssessmentRow
  phase5OutcomeType: Phase5OutcomeType | null
}

export default function Phase5ReadingList({
  readings,
  phase1,
  phase5OutcomeType,
}: Phase5ReadingListProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set())
  const [locallyAcknowledgedIds, setLocallyAcknowledgedIds] = useState<Set<string>>(
    new Set()
  )
  const [locallySelectedOutcome, setLocallySelectedOutcome] =
    useState<Phase5OutcomeType | null>(null)

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

  const effectiveOutcome = locallySelectedOutcome ?? phase5OutcomeType

  return (
    <div className="-mx-5">
      {readings.map(({ section, isRead }, idx) => {
        const isOpen = openIds.has(section.id)
        const isLast = idx === readings.length - 1
        const isReadEffective = isRead || locallyAcknowledgedIds.has(section.id)

        const requiresOutcome = section.acknowledgeRequires === 'phase5_outcome_type'
        const requirementMet = !requiresOutcome || effectiveOutcome !== null

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
                  selectedValue={requiresOutcome ? effectiveOutcome : undefined}
                  onSelectValue={
                    requiresOutcome && !isReadEffective
                      ? async (value: string) => {
                          const typed = value as Phase5OutcomeType
                          if (!(PHASE5_OUTCOME_VALUES as readonly string[]).includes(typed)) return
                          setLocallySelectedOutcome(typed)
                          try {
                            await setPhase5OutcomeType(typed)
                          } catch (err) {
                            console.error(
                              '[Phase5ReadingList] setPhase5OutcomeType failed:',
                              err
                            )
                          }
                        }
                      : undefined
                  }
                  onAcknowledge={
                    isReadEffective || section.noAcknowledge || !requirementMet
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
