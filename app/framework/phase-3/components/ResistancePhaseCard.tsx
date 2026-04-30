'use client'

// app/framework/phase-3/components/ResistancePhaseCard.tsx
// Client component. Three render states:
//   1. Already acknowledged (resistancePhaseStart IS NOT NULL) — compact "started" card.
//   2. Not yet acknowledged, >= 7 days from phase2CompletedAt — button opens D.13 directly.
//   3. Not yet acknowledged, < 7 days from phase2CompletedAt — button opens confirmation
//      modal with 3 readiness signals; modal "Continue" then opens D.13.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Phase1AssessmentRow } from '@/lib/scoring/types'
import ReadingView from '@/components/exercise/reading-view'
import { getReadingSectionById } from '@/content/framework/phase-3/_lookup'

interface ResistancePhaseCardProps {
  resistancePhaseStart: string | null
  phase2CompletedAt: string
  phase1: Phase1AssessmentRow
  protocolOption: number | null
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

const d13Section = getReadingSectionById('D13_resistance_intro')

export default function ResistancePhaseCard({
  resistancePhaseStart,
  phase2CompletedAt,
  phase1,
  protocolOption,
}: ResistancePhaseCardProps) {
  const router = useRouter()
  // acknowledgedAt tracks the timestamp — null = not yet done, non-null = done.
  // Initialised from the server prop; updated optimistically after API success.
  const [acknowledgedAt, setAcknowledgedAt] = useState<string | null>(resistancePhaseStart)
  const [showModal, setShowModal] = useState(false)
  const [readingOpen, setReadingOpen] = useState(false)

  // State 1 — already acknowledged
  if (acknowledgedAt !== null) {
    return (
      <div className="bg-surface border border-border rounded-[12px] p-5 mb-6">
        <p className="text-[14px] font-semibold text-text-heading">Resistance phase</p>
        <p className="text-[14px] text-text-muted mt-1">
          Started {formatDate(new Date(acknowledgedAt))}
        </p>
      </div>
    )
  }

  const daysSincePhase2 = Math.floor(
    (Date.now() - new Date(phase2CompletedAt).getTime()) / (24 * 60 * 60 * 1000),
  )
  const isPreWeek = daysSincePhase2 < 7

  function handleButtonClick() {
    if (isPreWeek) {
      setShowModal(true)
    } else {
      setReadingOpen(true)
    }
  }

  async function handleAcknowledge(): Promise<void> {
    try {
      const res = await fetch('/api/session/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exerciseId: 'D13_resistance_intro' }),
      })
      if (res.ok) {
        setAcknowledgedAt(new Date().toISOString())
        setReadingOpen(false)
        router.refresh()
      } else {
        console.error('[ResistancePhaseCard] acknowledge failed:', res.status, await res.text())
      }
    } catch (err) {
      console.error('[ResistancePhaseCard] acknowledge network error:', err)
    }
  }

  // States 2 and 3 — not yet acknowledged
  return (
    <>
      <div className="bg-surface border border-border rounded-[12px] p-5 mb-6">
        <p className="text-[14px] font-semibold text-text-heading">Resistance Phase</p>
        <p className="text-[14px] text-text-muted mt-1 mb-4">
          Most members are ready after one to two weeks of consistent release work. The protocol does not push you forward — you decide when you&apos;re ready based on tissue response.
        </p>
        <button
          type="button"
          onClick={handleButtonClick}
          className="w-full py-3 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white text-body font-semibold transition-colors"
        >
          Begin resistance phase
        </button>

        {readingOpen && (
          <div className="mt-6 border-t border-border pt-4">
            <ReadingView
              section={d13Section}
              phase1={phase1}
              protocolOption={protocolOption}
              onAcknowledge={handleAcknowledge}
              reviewMode={false}
            />
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-[16px] max-w-[480px] w-full p-6">
            <h2 className="text-[18px] font-bold text-text-heading mb-3">
              Before you begin the resistance phase
            </h2>
            <p className="text-body text-text-body mb-3">
              The release phase normally runs for one to two weeks before resistance work begins.
              Some members are ready closer to one week; others with longer-standing dysfunction
              take longer.
            </p>
            <p className="text-body text-text-body mb-3">
              Before continuing, check that you&apos;re experiencing most of these signs:
            </p>
            <ol className="list-decimal list-inside space-y-2 mb-4 text-body text-text-body">
              <li>Tenderness on masseter and temporalis self-palpation has reduced noticeably.</li>
              <li>The release work feels less effortful — tissues responding more readily to pressure.</li>
              <li>Release sessions are producing a clear sense of tissue softening rather than resistance.</li>
            </ol>
            <p className="text-body text-text-body mb-6">
              You don&apos;t need all three — a clear pattern across most of them is sufficient.
            </p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => { setShowModal(false); setReadingOpen(true) }}
                className="w-full py-3 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white text-body font-semibold transition-colors"
              >
                Continue to resistance phase
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-full py-2 px-4 text-primary text-body font-semibold hover:underline transition-colors"
              >
                Not yet — keep working
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
