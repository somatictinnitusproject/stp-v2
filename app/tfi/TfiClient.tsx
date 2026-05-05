'use client'

/**
 * app/tfi/TfiClient.tsx
 *
 * Client component for the /tfi questionnaire page.
 * Renders all 25 TFI items, sticky progress indicator, and submit button.
 * Calculates scores client-side, POSTs to /api/tfi/submit, navigates to
 * /tracker on success.
 *
 * Verbatim TFI item wording per Meikle et al. 2012. Do not alter.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TFI_ITEMS } from '@/lib/tfi/items'
import { calculateTfiScores } from '@/lib/tfi/scoring'
import type { TfiResponses } from '@/lib/tfi/scoring'

type CapturePoint = 'intake' | 'completion'

interface Props {
  capturePoint: CapturePoint
}

const CONTEXT_LINES: Record<CapturePoint, string> = {
  intake: 'This is your starting baseline.',
  completion: 'This is your post-framework follow-up.',
}

// Percentage scale labels for items 1 and 3.
const PCT_LABELS = ['0%', '10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%', '100%']

export default function TfiClient({ capturePoint }: Props) {
  const router = useRouter()

  // responses[i] holds the selected value (0–10) for item i+1, or null if unanswered.
  const [responses, setResponses] = useState<(number | null)[]>(
    Array(25).fill(null),
  )
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const answeredCount = responses.filter((v) => v !== null).length
  const allAnswered = answeredCount === 25
  const progressPct = (answeredCount / 25) * 100

  function handleSelect(itemIndex: number, value: number) {
    setResponses((prev) => {
      const next = [...prev]
      next[itemIndex] = value
      return next
    })
  }

  async function handleSubmit() {
    if (!allAnswered || submitting) return

    // Build the items object — safe because allAnswered guarantees no nulls.
    const items = {} as TfiResponses
    for (let i = 0; i < 25; i++) {
      (items as unknown as Record<string, number>)[`item_${i + 1}`] = responses[i] as number
    }

    const scores = calculateTfiScores(items)

    setSubmitting(true)
    setErrorMessage(null)

    try {
      const res = await fetch('/api/tfi/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ capture_point: capturePoint, items, scores }),
      })

      if (res.ok) {
        router.push('/tracker?tfi_success=1')
        return
      }

      const json = (await res.json()) as { error?: string }
      if (res.status === 409) {
        // Already submitted for this capture point — treat as success.
        router.push('/tracker')
        return
      }
      setErrorMessage(json.error ?? 'Something went wrong. Please try again.')
    } catch {
      setErrorMessage('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-[680px] mx-auto">
      {/* ── Header (scrolls away) ─────────────────────────────────────── */}
      <div className="pt-6 pb-4">
        <h1 className="text-[28px] font-bold text-text-heading leading-tight mb-2">
          Tinnitus Functional Index
        </h1>
        <p className="text-[16px] text-text-body mb-2">
          This validated questionnaire helps us track outcomes for research. Your
          responses are anonymised and used to improve treatment for future members.
          Takes around 5 minutes.
        </p>
        <p className="text-[15px] text-text-muted">{CONTEXT_LINES[capturePoint]}</p>
      </div>

      {/* ── Sticky progress indicator ─────────────────────────────────── */}
      <div className="sticky top-[60px] z-10 bg-surface border-b border-border py-3 -mx-4 px-4 md:-mx-8 md:px-8">
        <p className="text-[12px] font-medium uppercase tracking-wider text-text-muted mb-2">
          {answeredCount} of 25 answered
        </p>
        <div className="w-full h-1 bg-surface-raised rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-[width] duration-200"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* ── Question cards ────────────────────────────────────────────── */}
      <div className="pt-4 space-y-4">
        {TFI_ITEMS.map((item, idx) => {
          const selected = responses[idx]
          const isAnswered = selected !== null

          return (
            <div
              key={item.number}
              className="bg-surface border border-border rounded-xl p-4"
            >
              {/* Question number */}
              <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted mb-2">
                Question {item.number} of 25
              </p>

              {/* Question text */}
              <p className="text-[16px] font-medium text-text-heading mb-4 leading-snug">
                {item.questionText}
              </p>

              {/* Anchor labels */}
              <div className="flex justify-between mb-1">
                <span className="text-[12px] text-text-muted leading-tight max-w-[42%]">
                  {item.leftAnchorLabel}
                </span>
                <span className="text-[12px] text-text-muted leading-tight max-w-[42%] text-right">
                  {item.rightAnchorLabel}
                </span>
              </div>

              {/* Percentage labels for items 1 and 3 */}
              {item.isPercentage && (
                <div className="flex justify-between mb-1">
                  {PCT_LABELS.map((pct) => (
                    <span key={pct} className="text-[10px] text-text-muted w-[9%] text-center">
                      {pct}
                    </span>
                  ))}
                </div>
              )}

              {/* 11-button response group */}
              <div className="flex flex-wrap gap-1 mt-2">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => {
                  const isSelected = selected === val
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleSelect(idx, val)}
                      className={[
                        'w-9 h-9 rounded-lg text-[14px] font-medium border transition-colors',
                        isSelected
                          ? 'bg-primary border-primary text-white'
                          : 'border-border text-text-muted hover:border-text-heading',
                      ].join(' ')}
                    >
                      {val}
                    </button>
                  )
                })}
              </div>

              {/* Answered indicator */}
              {isAnswered && (
                <p className="text-[12px] text-primary mt-2 font-medium">
                  ✓ Selected: {selected}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Submit ────────────────────────────────────────────────────── */}
      <div className="mt-6 pb-8">
        {errorMessage && (
          <div className="mb-4 rounded-lg bg-error-tint border border-error px-4 py-3">
            <p className="text-[14px] text-error">{errorMessage}</p>
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!allAnswered || submitting}
          className={[
            'w-full h-12 rounded-lg text-[16px] font-semibold transition-colors',
            allAnswered && !submitting
              ? 'bg-primary hover:bg-primary-hover text-white cursor-pointer'
              : 'bg-surface-raised text-text-muted cursor-not-allowed',
          ].join(' ')}
        >
          {submitting ? 'Submitting…' : 'Submit responses'}
        </button>

        <p className="text-[12px] text-text-muted text-center mt-4">
          Tinnitus Functional Index © 2012 Meikle et al. Used with permission for
          research purposes.
        </p>
      </div>
    </div>
  )
}
