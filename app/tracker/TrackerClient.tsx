'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart2, X as CloseIcon } from 'lucide-react'
import Slider from '@/components/tracker/Slider'
import OptionalSection from '@/components/tracker/OptionalSection'
import DefaultConfirmModal from '@/components/tracker/DefaultConfirmModal'
import { TRACKER_TRIGGERS } from '@/content/tracker-triggers'
import type { TriggerName } from '@/content/tracker-triggers'
import type { TodayLog } from '@/lib/tracker/queries'
import { SCORING_THRESHOLDS } from '@/content/scoring-thresholds'
import LoggedTodayView from '@/components/tracker/LoggedTodayView'
import EditModeForm from '@/components/tracker/EditModeForm'

const PUSH_OPT_IN_KEY = 'tracker.push_opt_in_dismissed'

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
  const [pushDismissed, setPushDismissed] = useState(true)
  const [showEditMode, setShowEditMode] = useState(false)

  // Read localStorage on mount — guarded for SSR
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPushDismissed(localStorage.getItem(PUSH_OPT_IN_KEY) === 'true')
    }
  }, [])

  // Noon UTC avoids timezone-off-by-one when formatting the display date
  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  }).format(new Date(today + 'T12:00:00'))

  // Functional updates so [] dep array is safe — setters are stable references
  const handleSliderChange = useCallback((key: SliderKey, value: number) => {
    setSliderValues(prev => ({ ...prev, [key]: value }))
    setHasBeenMoved(prev => ({ ...prev, [key]: true }))
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
    setSelectedTriggerNames(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  function handleNotesChange(value: string) {
    setNotes(value)
  }

  async function submitLog() {
    setSubmitting(true)
    setErrorMessage(null)
    try {
      const res = await fetch('/api/tracker/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tinnitus_score: sliderValues.tinnitus_score,
          jaw_tension: sliderValues.jaw_tension,
          neck_tension: sliderValues.neck_tension,
          stress_level: sliderValues.stress_level,
          sleep_quality: sliderValues.sleep_quality,
          notes: notes || null,
          trigger_names: [...selectedTriggerNames],
        }),
      })
      if (res.status === 409) {
        router.refresh()
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
    const anyMoved = Object.values(hasBeenMoved).some(v => v)
    if (!anyMoved) {
      setShowConfirmModal(true)
      return
    }
    await submitLog()
  }

  function handleConfirmSubmit() {
    setShowConfirmModal(false)
    void submitLog()
  }

  function handleCancelSubmit() {
    setShowConfirmModal(false)
  }

  if (state === 2 && todayLog) {
    if (showEditMode) {
      return <EditModeForm todayLog={todayLog} onCancel={() => setShowEditMode(false)} />
    }
    return <LoggedTodayView todayLog={todayLog} isEditable={isEditable} today={today} onEdit={() => setShowEditMode(true)} />
  }

  return (
    <div className="max-w-[680px] mx-auto pt-8 pb-16">
      <h1 className="text-[28px] font-bold text-text-heading leading-tight mb-1">
        How are you today?
      </h1>
      <p className="text-body-sm text-text-muted mb-6">{formattedDate}</p>

      {/* Empty state — shown on first-ever log to orient the user */}
      {priorLogCount === 0 && (
        <div className="flex flex-col items-center text-center mb-6">
          <BarChart2 size={48} className="text-text-muted mb-3" />
          <h2 className="text-heading-3 text-text-heading mb-2">Start your daily check-in</h2>
          <p className="text-body-sm text-text-muted">
            Logging daily is the foundation of the programme. It takes under 60 seconds.
          </p>
        </div>
      )}

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

      {showYesterdayLink && (
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => console.log('TODO: yesterday switch in M10')}
            className="text-body-sm text-primary underline-offset-2 hover:underline"
          >
            Missed yesterday? Log for yesterday →
          </button>
        </div>
      )}

      {errorMessage && (
        <p className="text-body-sm text-error mt-3 text-center">{errorMessage}</p>
      )}

      {/* Push opt-in — shown after PUSH_OPT_IN_MIN_LOGS logs, dismissible via localStorage */}
      {priorLogCount >= SCORING_THRESHOLDS.PUSH_OPT_IN_MIN_LOGS && !pushDismissed && (
        <div className="relative bg-surface border border-border p-6 rounded-xl mt-6">
          <button
            type="button"
            onClick={() => {
              localStorage.setItem(PUSH_OPT_IN_KEY, 'true')
              setPushDismissed(true)
            }}
            className="absolute top-4 right-4 text-text-muted hover:text-text-body"
            aria-label="Dismiss"
          >
            <CloseIcon size={20} />
          </button>
          <h2 className="text-heading-3 text-text-heading mb-2">Never miss a day</h2>
          <p className="text-body-sm text-text-muted mb-4">
            Enable daily reminders and we'll notify you if you haven't logged yet.
          </p>
          <button
            type="button"
            onClick={() => {
              console.log('TODO: push notification wiring in post-launch phase')
              localStorage.setItem(PUSH_OPT_IN_KEY, 'true')
              setPushDismissed(true)
            }}
            className="w-full h-12 px-6 bg-primary text-white text-btn-primary rounded-lg hover:bg-primary-hover active:bg-primary-active transition-colors duration-150"
          >
            Enable reminders
          </button>
        </div>
      )}

      <DefaultConfirmModal
        open={showConfirmModal}
        onConfirm={handleConfirmSubmit}
        onCancel={handleCancelSubmit}
      />
    </div>
  )
}
