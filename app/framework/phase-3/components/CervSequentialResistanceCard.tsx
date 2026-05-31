'use client'

// app/framework/phase-3/components/CervSequentialResistanceCard.tsx
// Option 1 (Sequential) dual-driver only.
// Shown after cervical release has started and before cervical resistance has started.
// Mirrors ResistancePhaseCard: 7-day soft gate with a readiness modal for early starters.
// Tapping through calls /api/session/start-cerv-resistance and refreshes.

import { useState } from 'react'
import { useRouter } from 'next/navigation'

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

interface CervSequentialResistanceCardProps {
  cervSequentialPhaseStart: string      // when cervical release started — gate reference
  cervSequentialResistanceStart: string | null
}

export default function CervSequentialResistanceCard({
  cervSequentialPhaseStart,
  cervSequentialResistanceStart,
}: CervSequentialResistanceCardProps) {
  const router = useRouter()
  const [startedAt, setStartedAt] = useState<string | null>(cervSequentialResistanceStart)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)

  // Already started — compact state
  if (startedAt !== null) {
    return (
      <div className="bg-surface border border-border rounded-[12px] p-5 mb-6">
        <p className="text-[14px] font-semibold text-text-heading">Cervical resistance phase</p>
        <p className="text-[14px] text-text-muted mt-1">
          Started {formatDate(new Date(startedAt))}
        </p>
      </div>
    )
  }

  const daysSinceCervRelease = Math.floor(
    (Date.now() - new Date(cervSequentialPhaseStart).getTime()) / (24 * 60 * 60 * 1000),
  )
  const isPreWeek = daysSinceCervRelease < 7

  async function handleBegin() {
    setLoading(true)
    try {
      const res = await fetch('/api/session/start-cerv-resistance', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setStartedAt(data.startedAt ?? new Date().toISOString())
        setShowModal(false)
        router.refresh()
      } else {
        console.error('[CervSequentialResistanceCard] API error:', res.status, await res.text())
      }
    } catch (err) {
      console.error('[CervSequentialResistanceCard] network error:', err)
    } finally {
      setLoading(false)
    }
  }

  function handleButtonClick() {
    if (isPreWeek) {
      setShowModal(true)
    } else {
      handleBegin()
    }
  }

  return (
    <>
      <div className="bg-surface border border-border rounded-[12px] p-5 mb-6">
        <p className="text-[14px] font-semibold text-text-heading">Cervical Resistance Phase</p>
        <p className="text-[14px] text-text-muted mt-1 mb-4">
          Most members are ready to begin cervical resistance after one to two weeks of
          consistent cervical release work. The protocol does not push you forward — you
          decide when you&apos;re ready based on tissue response.
        </p>
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={loading}
          className="w-full py-3 px-4 rounded-lg bg-primary hover:bg-primary-hover disabled:bg-primary-disabled disabled:cursor-not-allowed text-white text-body font-semibold transition-colors"
        >
          {loading ? 'Starting...' : 'Begin cervical resistance phase'}
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-[16px] max-w-[480px] w-full p-6">
            <h2 className="text-[18px] font-bold text-text-heading mb-3">
              Before you begin cervical resistance
            </h2>
            <p className="text-body text-text-body mb-3">
              The cervical release phase normally runs for one to two weeks before resistance
              work begins. Before continuing, check that you&apos;re experiencing most of
              these signs:
            </p>
            <ol className="list-decimal list-inside space-y-2 mb-4 text-body text-text-body">
              <li>Tenderness on suboccipital and SCM self-palpation has reduced noticeably.</li>
              <li>The release work feels less effortful, with tissues responding more readily to pressure.</li>
              <li>Release sessions are producing a clear sense of tissue softening rather than resistance.</li>
            </ol>
            <p className="text-body text-text-body mb-6">
              You don&apos;t need all three; a clear pattern across most of them is sufficient.
            </p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleBegin}
                disabled={loading}
                className="w-full py-3 px-4 rounded-lg bg-primary hover:bg-primary-hover disabled:bg-primary-disabled disabled:cursor-not-allowed text-white text-body font-semibold transition-colors"
              >
                {loading ? 'Starting...' : 'Continue to cervical resistance phase'}
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-full py-2 px-4 text-primary text-body font-semibold hover:underline transition-colors"
              >
                Not yet, keep working
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
