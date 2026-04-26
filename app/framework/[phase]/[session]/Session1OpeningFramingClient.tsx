'use client'

// C.1 — Opening Framing client component.
// G4 Framework Content Reading View layout (Doc 11 G4):
//   max-width reading (680px) · space-5 top / space-6 bottom · section label →
//   h1 (heading-1 responsive: 28px mobile / 36px desktop per Doc 11 §2.3) →
//   paragraphs body / leading-[1.6] / space-3 between · continue button at bottom.
//
// C.1 has no subsection headings — four paragraphs flow as one body. P1 and P3
// are personalised by the server component before rendering; this client only
// displays the resolved strings.
//
// Submit: /api/framework/advance-session POST { phase: 2, session: 1 }. No
// dedicated phase-2 route — the generic route already whitelists phase 2.

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Session1OpeningFramingClientProps = {
  sectionLabel: string
  sectionTitle: string
  continueLabel: string
  paragraph1: string
  paragraph2: string
  paragraph3: string
  paragraph4: string
}

export default function Session1OpeningFramingClient(
  props: Session1OpeningFramingClientProps
) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleContinue() {
    if (loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/framework/advance-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase: 2, session: 1 }),
      })
      if (res.status === 401) {
        router.push('/login')
        return
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(
          (body as { message?: string }).message ??
            'Something went wrong. Please try again.'
        )
        setLoading(false)
        return
      }
      router.refresh()
      router.push('/framework/phase-2/session-2')
    } catch {
      setError('Network error. Please check your connection and try again.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-[680px] mx-auto pt-10 pb-16">

      {/* Section label — phase-label type: 12px / 600 / uppercase / 0.06em (Doc 11 §2.4) */}
      <p className="text-phase-label text-primary uppercase tracking-[0.06em] mb-3">
        {props.sectionLabel}
      </p>

      {/* Section heading — heading-1: 28px mobile / 36px desktop (Doc 11 §2.3) */}
      <h1 className="text-[28px] md:text-[36px] font-bold leading-[1.2] text-text-heading mb-6">
        {props.sectionTitle}
      </h1>

      {/* Four paragraphs — body type, space-3 (24px) between */}
      <div className="space-y-6">
        <p className="text-body text-text-body">{props.paragraph1}</p>
        <p className="text-body text-text-body">{props.paragraph2}</p>
        <p className="text-body text-text-body">{props.paragraph3}</p>
        <p className="text-body text-text-body">{props.paragraph4}</p>
      </div>

      {/* Inline error — body-sm */}
      {error && (
        <div className="mt-6 p-4 bg-error-tint border border-error rounded-[8px]">
          <p className="text-body-sm text-error">{error}</p>
        </div>
      )}

      {/* Continue button — primary, full width mobile / auto desktop */}
      <div className="mt-10">
        <button
          onClick={handleContinue}
          disabled={loading}
          className={`w-full md:w-auto md:px-8 h-11 rounded-[8px] text-btn-primary transition-colors ${
            loading
              ? 'bg-primary-disabled text-white cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary-hover'
          }`}
        >
          {loading ? 'Saving\u2026' : props.continueLabel}
        </button>
        <p className="text-muted text-text-muted text-center mt-3">Section 1 of 8</p>
      </div>

    </div>
  )
}
