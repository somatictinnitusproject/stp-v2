'use client'

import { useState } from 'react'
import { COMMUNITY_CHARTER } from '@/content/community-charter'

interface Props {
  onAcknowledged: () => void
}

export default function CharterModal({ onAcknowledged }: Props) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAcknowledge() {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/community/acknowledge-charter', {
        method: 'POST',
      })
      if (!res.ok) {
        throw new Error('Acknowledgment failed')
      }
      onAcknowledged()
    } catch {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Backdrop — non-dismissible. */}
      <div
        className="fixed inset-0 bg-black/40 z-30"
        aria-hidden="true"
      />

      {/* Modal container. Full screen on mobile, centred card on desktop. */}
      <div
        className="fixed inset-0 z-40 flex items-center justify-center md:p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="charter-heading"
      >
        <div className="bg-surface w-full h-full md:h-auto md:max-w-[480px] md:rounded-2xl md:shadow-xl p-6 md:p-8 overflow-y-auto">
          <h2
            id="charter-heading"
            className="text-[22px] font-semibold leading-tight text-text-heading mb-4"
          >
            {COMMUNITY_CHARTER.heading}
          </h2>

          <p className="text-[15px] text-text-body mb-4 leading-relaxed">
            {COMMUNITY_CHARTER.intro}
          </p>

          {COMMUNITY_CHARTER.paragraphs.map((p, i) => (
            <p
              key={i}
              className="text-[15px] text-text-body mb-4 leading-relaxed"
            >
              {p}
            </p>
          ))}

          <p className="text-[15px] text-text-muted mb-6">
            {COMMUNITY_CHARTER.signoff}
          </p>

          {error && (
            <p
              className="text-[14px] text-error mb-4"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleAcknowledge}
            disabled={submitting}
            className="w-full bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white text-[15px] font-medium px-5 py-3 rounded-lg transition-colors"
          >
            {submitting ? 'Saving…' : COMMUNITY_CHARTER.buttonLabel}
          </button>
        </div>
      </div>
    </>
  )
}
