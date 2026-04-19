'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Slider from '@/components/tracker/Slider'
import OptionalSection from '@/components/tracker/OptionalSection'
import DefaultConfirmModal from '@/components/tracker/DefaultConfirmModal'
import { TRACKER_TRIGGERS } from '@/content/tracker-triggers'
import type { TriggerName } from '@/content/tracker-triggers'
import type { TodayLog } from '@/lib/tracker/queries'

type SliderKey = 'tinnitus_score' | 'jaw_tension' | 'neck_tension' | 'stress_level' | 'sleep_quality'

type TrackerClientProps = {
  today: string
  state: 1 | 2
  todayLog: TodayLog
  isEditable: boolean
  priorLogCount: number
  recentLogDates: string[]
  showYesterdayLink: boolean
  showWeeklyNudge: boolean
  daysSinceCreation: number
  streak: { current: number; longest: number }
}

const SLIDER_DEFAULTS: Record<SliderKey, number> = {
  tinnitus_score: 5, jaw_tension: 5, neck_tension: 5, stress_level: 5, sleep_quality: 5,
}
const MOVED_DEFAULTS: Record<SliderKey, boolean> = {
  tinnitus_score: false, jaw_tension: false, neck_tension: false, stress_level: false, sleep_quality: false,
}
const SLIDER_CONFIG: { key: SliderKey; label: string; description: string }[] = [
  { key: 'tinnitus_score', label: 'Tinnitus loudness', description: 'How loud or intrusive is your tinnitus today?' },
  { key: 'jaw_tension',    label: 'Jaw tension',        description: 'How much tension or tightness in your jaw?' },
  { key: 'neck_tension',   label: 'Neck tension',        description: 'How much tension or stiffness in your neck?' },
  { key: 'stress_level',   label: 'Stress',              description: 'How stressed or anxious are you feeling today?' },
  { key: 'sleep_quality',  label: 'Sleep quality',       description: 'How well did you sleep last night?' },
]

export default function TrackerClient({
  today, state, todayLog, isEditable, priorLogCount,
  recentLogDates, showYesterdayLink, showWeeklyNudge, daysSinceCreation, streak,
}: TrackerClientProps) {
  const router = useRouter()

  const [sliderValues, setSliderValues] = useState<Record<SliderKey, number>>(SLIDER_DEFAULTS)
  const [hasBeenMoved, setHasBeenMoved] = useState<Record<SliderKey, boolean>>(MOVED_DEFAULTS)
  const [selectedTriggerNames, setSelectedTriggerNames] = useState<Set<string>>(new Set())
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  // Noon UTC avoids timezone-off-by-one when formatting the display date
  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  }).format(new Date(today + 'T12:00:00'))

  // useCallback with [] is safe: body will only use stable state setters (setSliderValues, setHasBeenMoved)
  const handleSliderChange = useCallback((key: SliderKey, value: number) => {
    // TODO: update value, set hasBeenMoved[key] = true
  }, [])

  // Stable per-key handlers — avoids inline arrow functions in JSX on every render
  const sliderHandlers = useMemo<Record<SliderKey, (v: number) => void>>(() => ({
    tinnitus_score: (v) => handleSliderChange('tinnitus_score', v),
    jaw_tension:    (v) => handleSliderChange('jaw_tension', v),
    neck_tension:   (v) => handleSliderChange('neck_tension', v),
    stress_level:   (v) => handleSliderChange('stress_level', v),
    sleep_quality:  (v) => handleSliderChange('sleep_quality', v),
  }), [handleSliderChange])

  function handleTriggerToggle(name: TriggerName) {
    // TODO: toggle name in selectedTriggerNames Set
  }
  function handleNotesChange(value: string) {
    // TODO: setNotes(value)
  }
  async function handleSubmit() {
    // TODO: if no slider moved, show confirm modal
    //       else POST to /api/tracker/submit
  }
  function handleConfirmSubmit() {
    // TODO: close modal, proceed with POST
  }
  function handleCancelSubmit() {
    // TODO: close modal, return to form
  }

  if (state !== 1) return <div>State 2 placeholder for M8</div>

  return (
    <div className="max-w-[680px] mx-auto pt-8 pb-16">
      <h1 className="text-[28px] font-bold text-text-heading leading-tight mb-1">
        How are you today?
      </h1>
      <p className="text-body-sm text-text-muted mb-6">{formattedDate}</p>

      <p className="text-section-label uppercase tracking-[0.08em] text-text-muted mb-4">
        Today's check-in
      </p>

      <div className="flex flex-col gap-6">
        {SLIDER_CONFIG.map(({ key, label, description }) => (
          <Slider
            key={key}
            name={key}
            label={label}
            description={description}
            value={sliderValues[key]}
            hasBeenMoved={hasBeenMoved[key]}
            onChange={sliderHandlers[key]}
          />
        ))}
      </div>

      <div className="mt-6">
        <OptionalSection
          triggers={[...TRACKER_TRIGGERS]}
          selectedNames={selectedTriggerNames}
          notes={notes}
          onTriggerToggle={handleTriggerToggle}
          onNotesChange={handleNotesChange}
          showWeeklyNudge={showWeeklyNudge}
          daysSinceCreation={daysSinceCreation}
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full mt-4 h-12 px-6 bg-primary text-white text-btn-primary rounded-lg hover:bg-primary-hover active:bg-primary-active transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? 'Saving...' : 'Log today'}
      </button>

      {errorMessage && (
        <p className="text-body-sm text-error mt-3 text-center">{errorMessage}</p>
      )}

      <DefaultConfirmModal
        open={showConfirmModal}
        onConfirm={handleConfirmSubmit}
        onCancel={handleCancelSubmit}
      />
    </div>
  )
}
