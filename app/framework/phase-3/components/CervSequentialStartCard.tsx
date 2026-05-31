'use client'

// app/framework/phase-3/components/CervSequentialStartCard.tsx
// Option 1 (Sequential) dual-driver only.
// Shown after jaw resistance has started and before cervical release has started.
// Tapping the button calls /api/session/start-cerv-sequential and refreshes.

import { useState } from 'react'
import { useRouter } from 'next/navigation'

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

interface CervSequentialStartCardProps {
  cervSequentialPhaseStart: string | null
}

export default function CervSequentialStartCard({
  cervSequentialPhaseStart,
}: CervSequentialStartCardProps) {
  const router = useRouter()
  const [startedAt, setStartedAt] = useState<string | null>(cervSequentialPhaseStart)
  const [loading, setLoading] = useState(false)

  // Already started — compact state, same as ResistancePhaseCard state 1
  if (startedAt !== null) {
    return (
      <div className="bg-surface border border-border rounded-[12px] p-5 mb-6">
        <p className="text-[14px] font-semibold text-text-heading">Cervical release phase</p>
        <p className="text-[14px] text-text-muted mt-1">
          Started {formatDate(new Date(startedAt))}
        </p>
      </div>
    )
  }

  async function handleBegin() {
    setLoading(true)
    try {
      const res = await fetch('/api/session/start-cerv-sequential', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setStartedAt(data.startedAt ?? new Date().toISOString())
        router.refresh()
      } else {
        console.error('[CervSequentialStartCard] API error:', res.status, await res.text())
      }
    } catch (err) {
      console.error('[CervSequentialStartCard] network error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface border border-border rounded-[12px] p-5 mb-6">
      <p className="text-[14px] font-semibold text-text-heading">Cervical Release Phase</p>
      <p className="text-[14px] text-text-muted mt-1 mb-4">
        You are now in the jaw resistance phase. The cervical release protocol runs alongside
        jaw resistance — when you are ready to begin the cervical work, start it here.
        Most members begin within a week of starting jaw resistance, once the jaw resistance
        exercises are feeling established.
      </p>
      <button
        type="button"
        onClick={handleBegin}
        disabled={loading}
        className="w-full py-3 px-4 rounded-lg bg-primary hover:bg-primary-hover disabled:bg-primary-disabled disabled:cursor-not-allowed text-white text-body font-semibold transition-colors"
      >
        {loading ? 'Starting...' : 'Begin cervical release'}
      </button>
    </div>
  )
}
