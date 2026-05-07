'use client'

import { useRouter } from 'next/navigation'

export type TfiCapturePoint = 'intake' | 'phase5_completion'

const CARD_CONTENT: Record<TfiCapturePoint, { subhead: string; body: string }> = {
  intake: {
    subhead:
      '5 minutes — completing this baseline lets us measure how the framework affects your tinnitus over time.',
    body: 'Submitting both this baseline and the same questionnaire after Phase 5 helps us understand framework outcomes — both for your own progress tracking and for future members. The data is anonymised in any analysis.',
  },
  phase5_completion: {
    subhead:
      '5 minutes — this is your post-framework follow-up to pair with your intake baseline.',
    body: 'Submitting this gives us a paired endpoint score to compare against your baseline. Your data contributes directly to the research evidence for somatic tinnitus rehabilitation, and is anonymised in any analysis.',
  },
}

export default function TfiCaptureCard({
  capturePoint,
  fading,
  onDismiss,
}: {
  capturePoint: TfiCapturePoint
  fading: boolean
  onDismiss: () => void
}) {
  const router = useRouter()
  const { subhead, body } = CARD_CONTENT[capturePoint]

  return (
    <div
      className="mb-6"
      style={{
        borderLeft: '3px solid #4A9B8E',
        background: '#EEF7F5',
        borderRadius: '0 12px 12px 0',
        opacity: fading ? 0 : 1,
        transition: 'opacity 200ms ease-in-out',
      }}
    >
      <div className="p-4">
        <span className="text-[11px] font-medium uppercase tracking-wider text-primary block mb-2">
          Optional: Research
        </span>

        <h2 className="text-[17px] font-semibold text-text-heading mb-1">
          Tinnitus Functional Index
        </h2>

        <p className="text-[13px] text-text-muted mb-3">{subhead}</p>

        <p className="text-[15px] text-text-body mb-4">{body}</p>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <button
            type="button"
            onClick={() => router.push(`/tfi?capture_point=${capturePoint}`)}
            className="inline-flex items-center justify-center h-10 px-5 rounded-lg bg-primary hover:bg-primary-hover text-white text-[14px] font-medium transition-colors"
          >
            Take questionnaire
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="text-[14px] text-text-muted hover:text-text-body transition-colors py-2 sm:py-0 sm:px-3"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}
