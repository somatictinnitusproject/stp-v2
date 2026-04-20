'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Slider from '@/components/tracker/Slider'
import OptionalSection from '@/components/tracker/OptionalSection'
import { TRACKER_TRIGGERS } from '@/content/tracker-triggers'
import type { TriggerName } from '@/content/tracker-triggers'

type SliderKey = 'tinnitus_score' | 'jaw_tension' | 'neck_tension' | 'stress_level' | 'sleep_quality'

type Props = {
  logDate: string      // YYYY-MM-DD — the past date being logged
  today: string        // YYYY-MM-DD — needed to detect yesterday for copy branching
  onCancel: () => void
  onSuccess: () => void
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

export default function RetroactiveLogForm({ logDate, today, onCancel, onSuccess }: Props) {
  const router = useRouter()

  const yesterday = new Date(new Date(today + 'T00:00:00Z').getTime() - 86_400_000)
    .toISOString().split('T')[0]
  const isYesterday = logDate === yesterday

  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  }).format(new Date(logDate + 'T12:00:00'))

  const heading  = isYesterday ? 'How were you yesterday?'   : `How were you on ${formattedDate}?`
  const btnLabel = isYesterday ? 'Log for yesterday'          : `Log for ${formattedDate}`

  const [sliderValues, setSliderValues] = useState<Record<SliderKey, number>>(SLIDER_DEFAULTS)
  const [hasBeenMoved, setHasBeenMoved] = useState<Record<SliderKey, boolean>>(MOVED_DEFAULTS)
  const [selectedTriggerNames, setSelectedTriggerNames] = useState<Set<string>>(new Set())
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSliderChange = useCallback((key: SliderKey, value: number) => {
    setSliderValues(prev => ({ ...prev, [key]: value }))
    setHasBeenMoved(prev => ({ ...prev, [key]: true }))
  }, [])

  const sliderHandlers = useMemo<Record<SliderKey, (v: number) => void>>(() => ({
    tinnitus_score: (v) => handleSliderChange('tinnitus_score', v),
    jaw_tension:    (v) => handleSliderChange('jaw_tension', v),
    neck_tension:   (v) => handleSliderChange('neck_tension', v),
    stress_level:   (v) => handleSliderChange('stress_level', v),
    sleep_quality:  (v) => handleSliderChange('sleep_quality', v),
  }), [handleSliderChange])

  function handleTriggerToggle(name: TriggerName) {
    setSelectedTriggerNames(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  async function handleSubmit() {
    setErrorMessage(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/tracker/retroactive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          log_date:       logDate,
          tinnitus_score: sliderValues.tinnitus_score,
          jaw_tension:    sliderValues.jaw_tension,
          neck_tension:   sliderValues.neck_tension,
          stress_level:   sliderValues.stress_level,
          sleep_quality:  sliderValues.sleep_quality,
          notes:          notes || null,
          trigger_names:  [...selectedTriggerNames],
        }),
      })
      if (res.status === 401) {
        setErrorMessage('Your session has expired. Please sign in again.')
        return
      }
      if (res.status === 400) {
        setErrorMessage("This date can't be logged. It may be outside the 7-day window.")
        return
      }
      if (res.status === 409) {
        setErrorMessage('A log already exists for this date.')
        return
      }
      if (res.ok) {
        const json = await res.json()
        if (json.success) {
          if (json.triggerError) {
            setErrorMessage("Log saved but triggers couldn't be recorded. Please edit your log to add them.")
          } else {
            router.refresh()
            onSuccess()
          }
          return
        }
      }
      setErrorMessage('Something went wrong saving your log. Please try again.')
    } catch {
      setErrorMessage('Something went wrong saving your log. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-[680px] mx-auto pt-8 pb-16">
      <h1 className="text-[28px] font-bold text-text-heading leading-tight mb-1">{heading}</h1>
      <p className="text-body-sm text-text-muted mb-6">{formattedDate}</p>

      <p className="text-section-label uppercase tracking-[0.08em] text-text-muted mb-4">
        That day's check-in
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
          onNotesChange={(v) => setNotes(v)}
          showWeeklyNudge={false}
          daysSinceCreation={0}
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full mt-4 h-12 px-6 bg-primary text-white text-btn-primary rounded-lg hover:bg-primary-hover active:bg-primary-active transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? 'Saving...' : btnLabel}
      </button>

      <div className="mt-3 text-center">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="text-body-sm text-text-muted underline-offset-2 hover:underline disabled:opacity-50 disabled:cursor-not-allowed py-3"
        >
          Cancel
        </button>
      </div>

      {errorMessage && (
        <p className="text-body-sm text-error mt-3 text-center">{errorMessage}</p>
      )}
    </div>
  )
}
