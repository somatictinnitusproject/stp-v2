'use client'

// B.1 — Opening Section client component.
// G4 Framework Content Reading View layout (Doc 11 G4):
//   max-width reading (680px) · space-5 top / space-6 bottom · section label →
//   h1 (heading-1 responsive: 28px mobile / 36px desktop per Doc 11 §2.3) →
//   subsection headings (heading-3) space-4 above / space-2 below ·
//   paragraphs body / leading-[1.6] / space-3 between · acknowledge button at bottom.
//
// Token reference — Doc 11 §2 + §2.4:
//   text-phase-label  12px / 600 / uppercase / tracking-[0.06em] (§2.4 phase-label)
//   text-heading-3    18px / 600 / 1.4 (from --text-heading-3 @theme inline)
//   text-body         16px / 400 / 1.6 (from --text-body @theme inline)
//   text-body-sm      14px / 400 / 1.5 (from --text-body-sm @theme inline)
//   text-muted        13px / 400 / 1.4 (from --text-muted @theme inline)
//   text-btn-primary  15px / 500 / 1   (from --text-btn-primary @theme inline)
//   heading-1 mobile: 28px — Doc 11 §2.3 specifies text-[28px] md:text-[36px] font-bold

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { B1Opening } from '@/content/framework/phase-1/b1-opening'
import ScrollProgressBar from '@/components/ui/ScrollProgressBar'

export default function Session1OpeningClient({ content }: { content: B1Opening }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAcknowledge() {
    if (loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/framework/phase-1/b1-acknowledge', { method: 'POST' })
      if (res.status === 401) {
        router.push('/login')
        return
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError((body as { message?: string }).message ?? 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }
      router.refresh()
      router.push('/framework/phase-1/session-2')
    } catch {
      setError('Network error. Please check your connection and try again.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-[680px] mx-auto pt-10 pb-16">

      <ScrollProgressBar />

      {/* Section label — phase-label type: 12px / 600 / uppercase / 0.06em tracking (Doc 11 §2.4) */}
      <p className="text-phase-label text-primary uppercase tracking-[0.06em] mb-3">
        {content.sectionLabel}
      </p>

      {/* Section heading — heading-1: 28px mobile / 36px desktop per Doc 11 §2.3 */}
      <h1 className="text-[28px] md:text-[36px] font-bold leading-[1.2] text-text-heading mb-6">
        {content.sectionTitle}
      </h1>

      {/* Subsections — heading-3 (18px / 600 / 1.4) space-4 above / space-2 below;
          paragraphs body (16px / 400 / 1.6) space-3 between */}
      {content.subsections.map((sub, i) => (
        <section key={i} className={i > 0 ? 'mt-8' : ''}>
          <h3 className="text-heading-3 text-text-heading mb-4">
            {sub.heading}
          </h3>
          <div className="space-y-6">
            {sub.paragraphs.map((para, j) => (
              <p key={j} className="text-body text-text-body">
                {para}
              </p>
            ))}
          </div>
        </section>
      ))}

      {/* Inline error — body-sm (14px / 400 / 1.5) */}
      {error && (
        <div className="mt-6 p-4 bg-error-tint border border-error rounded-[8px]">
          <p className="text-body-sm text-error">{error}</p>
        </div>
      )}

      {/* Acknowledge button — Doc 11 G4: primary, full width mobile / auto desktop.
          btn-primary type (15px / 500) from --text-btn-primary token. */}
      <div className="mt-10">
        <button
          onClick={handleAcknowledge}
          disabled={loading}
          className={`w-full md:w-auto md:px-8 h-11 rounded-[8px] text-btn-primary transition-colors ${
            loading
              ? 'bg-primary-disabled text-white cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary-hover'
          }`}
        >
          {loading ? 'Saving…' : content.acknowledgeLabel}
        </button>
        {/* "Section N of 7" — muted type (13px / 400 / 1.4) */}
        <p className="text-muted text-text-muted text-center mt-3">Section 1 of 7</p>
      </div>

    </div>
  )
}
