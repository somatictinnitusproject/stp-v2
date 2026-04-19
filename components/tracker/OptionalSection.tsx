'use client'

import { useState, useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { SCORING_THRESHOLDS } from '@/content/scoring-thresholds'
import TriggerTag from './TriggerTag'
import type { TriggerName } from '@/content/tracker-triggers'

type OptionalSectionProps = {
  triggers: string[]
  selectedNames: Set<string>
  notes: string
  onTriggerToggle: (name: TriggerName) => void
  onNotesChange: (text: string) => void
  showWeeklyNudge: boolean
  daysSinceCreation: number
}

// Character count warning appears 200 chars before the hard limit
const CHAR_WARN_AT = SCORING_THRESHOLDS.NOTES_MAX_LENGTH - 200

export default function OptionalSection({
  triggers,
  selectedNames,
  notes,
  onTriggerToggle,
  onNotesChange,
  showWeeklyNudge,
  daysSinceCreation,
}: OptionalSectionProps) {
  const [open, setOpen] = useState(false)
  const textareaId = useId()

  const showCount = notes.length >= CHAR_WARN_AT
  const atLimit = notes.length >= SCORING_THRESHOLDS.NOTES_MAX_LENGTH

  return (
    <div>
      {/* Weekly nudge — above toggle, outside collapsed area */}
      {showWeeklyNudge && (
        <p className="text-body-sm text-text-muted mb-3">
          You've been logging for {daysSinceCreation} days — today's a great day to add a bit more detail.
        </p>
      )}

      {/* Toggle row — full-width button, tappable across entire row including hint */}
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        aria-expanded={open}
        className="w-full flex items-start justify-between border-t border-border pt-[14px] mt-2 text-left cursor-pointer"
      >
        <div className="flex flex-col">
          <span className="flex items-center gap-2 text-label text-text-body">
            <span className="text-primary text-[16px] leading-none" aria-hidden="true">+</span>
            Add more detail
          </span>
          <span className="text-body-sm text-text-muted mt-0.5">
            Optional — helps build a richer picture of your progress and contributes to tinnitus research.
          </span>
        </div>
        <ChevronDown
          size={18}
          strokeWidth={2}
          className={`text-text-muted flex-shrink-0 ml-2 mt-1 transition-transform duration-200${
            open ? ' rotate-180' : ''
          }`}
        />
      </button>

      {/* Expandable content — CSS grid-rows trick for smooth animation */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out${
          open ? ' grid-rows-[1fr]' : ' grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="pt-4 flex flex-col gap-5 pb-2">

            {/* Trigger pills */}
            <div>
              <p className="text-label text-text-body mb-3">What was different today?</p>
              <div className="flex flex-wrap gap-2">
                {triggers.map(name => (
                  <TriggerTag
                    key={name}
                    name={name as TriggerName}
                    selected={selectedNames.has(name)}
                    onToggle={onTriggerToggle}
                  />
                ))}
              </div>
            </div>

            {/* Notes textarea */}
            <div className="pb-2">
              <label
                htmlFor={textareaId}
                className="text-label text-text-body block mb-2"
              >
                Anything else worth noting?
              </label>
              <textarea
                id={textareaId}
                value={notes}
                onChange={e => onNotesChange(e.target.value)}
                maxLength={SCORING_THRESHOLDS.NOTES_MAX_LENGTH}
                placeholder="Any observations, patterns, or context about today..."
                className={`w-full bg-surface border-[1.5px] ${atLimit ? 'border-error' : 'border-border'} rounded-lg px-4 py-3 text-body text-text-body min-h-[96px] resize-y focus:outline-none focus:border-primary focus:shadow-input-focus`}
              />
              {showCount && (
                <p className={`text-body-sm text-right mt-1${atLimit ? ' text-error' : ' text-text-muted'}`}>
                  {notes.length}/{SCORING_THRESHOLDS.NOTES_MAX_LENGTH}
                </p>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
