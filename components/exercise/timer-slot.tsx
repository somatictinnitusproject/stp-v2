'use client'

// /components/exercise/timer-slot.tsx
// STUB — M13f will replace this body with <SustainedPressureTimer>.
// Accepts the same props the real timer will accept. Surfaces config for
// smoke testing M13g before M13f ships.

import type { TimerConfig } from '@/content/exercises/_types'

interface TimerSlotProps {
  timer: TimerConfig
  exerciseId: string
  onComplete: () => Promise<void>
}

export function TimerSlot({ timer, exerciseId, onComplete }: TimerSlotProps) {
  return (
    <div className="p-4 border border-dashed border-text-muted rounded-lg text-center">
      <p className="text-body-sm text-text-muted mb-2">
        Timer placeholder — populated in M13f
      </p>
      <p className="text-label text-text-muted mb-3">
        {exerciseId} · {timer.positions.length} position(s) ·{' '}
        {timer.audioChannel} audio ·{' '}
        warning {timer.warningSeconds ?? 'none'}s
      </p>
      <button
        type="button"
        onClick={() => void onComplete()}
        className="min-h-[44px] px-6 bg-primary text-white rounded-lg text-body font-medium hover:bg-primary-hover transition-colors"
      >
        Complete (stub)
      </button>
    </div>
  )
}

export default TimerSlot
