'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Slider from '@/components/tracker/Slider'
import OptionalSection from '@/components/tracker/OptionalSection'
import { TRACKER_TRIGGERS } from '@/content/tracker-triggers'
import type { TriggerName } from '@/content/tracker-triggers'
import type { TodayLog } from '@/lib/tracker/queries'

type SliderKey = 'tinnitus_score' | 'jaw_tension' | 'neck_tension' | 'stress_level' | 'sleep_quality'

type Props = {
  todayLog: NonNullable<TodayLog>
  onCancel: () => void
}

const SLIDER_CONFIG: { key: SliderKey; label: string; description: string }[] = [
  { key: 'tinnitus_score', label: 'Tinnitus loudness', description: 'How loud or intrusive is your tinnitus today?' },
  { key: 'jaw_tension',    label: 'Jaw tension',        description: 'How much tension or tightness in your jaw?' },
  { key: 'neck_tension',   label: 'Neck tension',        description: 'How much tension or stiffness in your neck?' },
  { key: 'stress_level',   label: 'Stress',              description: 'How stressed or anxious are you feeling today?' },
  { key: 'sleep_quality',  label: 'Sleep quality',       description: 'How well did you sleep last night?' },
]

// All sliders pre-filled with real logged values — always treated as moved
const ALL_MOVED: Record<SliderKey, boolean> = {
  tinnitus_score: true, jaw_tension: true, neck_tension: true, stress_level: true, sleep_quality: true,
}

export default function EditModeForm({ todayLog, onCancel }: Props) {
  const router = useRouter()

  const [sliderValues, setSliderValues] = useState<Record<SliderKey, number>>({
    tinnitus_score: todayLog.tinnitus_score,
    jaw_tension:    todayLog.jaw_tension,
    neck_tension:   todayLog.neck_tension,
    stress_level:   todayLog.stress_level,
    sleep_quality:  todayLog.sleep_quality,
  })
  const hasBeenMoved = ALL_MOVED
  const [selectedTriggerNames, setSelectedTriggerNames] = useState<Set<string>>(
    new Set(todayLog.triggerNames)
  )
  const [notes, setNotes] = useState(todayLog.notes ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSliderChange = useCallback((key: SliderKey, value: number) => {
    setSliderValues(prev => ({ ...prev, [key]: value }))
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

  async function submitEdit() {
    setSubmitting(true)
    setErrorMessage(null)
    try {
      const res = await fetch('/api/tracker/edit', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          log_id:         todayLog.id,
          tinnitus_score: sliderValues.tinnitus_score,
          jaw_tension:    sliderValues.jaw_tension,
          neck_tension:   sliderValues.neck_tension,
          stress_level:   sliderValues.stress_level,
          sleep_quality:  sliderValues.sleep_quality,
          notes:          notes || null,
          trigger_names:  [...selectedTriggerNames],
        }),
      })
      if (res.status === 403) {
        const json = await res.json()
        if (json.editWindowExpired) {
          setErrorMessage('This log can no longer be edited. The edit window closes 24 hours after the original log.')
        } else {
          setErrorMessage('Something went wrong saving your log. Please try again.')
        }
        return
      }
      if (res.ok) {
        const json = await res.json()
        if (json.success) {
          if (json.triggerError) {
            setErrorMessage("Log saved but triggers couldn't be recorded. Please edit your log to add them.")
          } else {
            router.refresh()
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

  async function handleSubmit() {
    setErrorMessage(null)
    await submitEdit()
  }

  return (
    <div className="max-w-[680px] mx-auto pt-8 pb-16">
      <h1 className="text-[28px] font-bold text-text-heading leading-tight mb-1">
        Edit today's log
      </h1>

      <p className="text-section-label uppercase tracking-[0.08em] text-text-muted mb-4 mt-6">
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
        {submitting ? 'Saving...' : 'Save changes'}
      </button>

      <div className="mt-3 text-center">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="text-body-sm text-text-muted underline-offset-2 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
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
