'use client'

// B.6 — Module 5: Asymmetry & Pattern client component.
// G4 Framework Content Form View layout (Doc 11 G4) per M8/M9 pattern.
// One new question persisted: asym_tinnitus_worse_ear.
// Eight consolidated findings displayed read-only from prior module data —
// page wrapper fetches assessment row server-side and passes findings as props.
// M5 submit triggers profile generation (lib/scoring/generate-and-save-profile.ts)
// — pattern classification, profile type, profile paragraph all written then.
// Member sees output at session-7 (M11).
//
// ScrollProgressBar mounted per ERRATA E11.
// No VideoSlot — M5 has no physical assessment video questions.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { B6Module5Asymmetry, B6LateralisationAnswer } from '@/content/framework/phase-1/types'
import ScrollProgressBar from '@/components/ui/ScrollProgressBar'

// Exported so M10c page wrapper can construct and type-check the findings array.
export type ConsolidatedFinding = {
  label: string       // from content.consolidatedFindings[i].label
  side: string | null // actual side value from the assessment row, or null if absent
}

function OptionBtn({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 h-11 rounded-[8px] text-body-sm border transition-colors ${
        selected
          ? 'bg-wins-bg border-primary text-primary font-medium'
          : 'bg-surface border-border text-text-body hover:border-primary'
      }`}
    >
      {label}
    </button>
  )
}

export default function Session6ModuleFiveClient({
  content,
  findings,
}: {
  content: B6Module5Asymmetry
  findings: ConsolidatedFinding[]
}) {
  const router = useRouter()
  const [lateralisation, setLateralisation] = useState<B6LateralisationAnswer | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isComplete = lateralisation !== null

  const visibleFindings = findings.filter(f => f.side !== null)

  async function handleSubmit() {
    if (loading) return
    setLoading(true)
    setError(null)

    const payload = { tinnitus_lateralisation: lateralisation }

    try {
      const res = await fetch('/api/framework/phase-1/module-5', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
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
      router.push('/framework/phase-1/session-7')
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
      <h1 className="text-[28px] md:text-[36px] font-bold leading-[1.2] text-text-heading mb-8">
        {content.sectionTitle}
      </h1>

      {/* ── Framing ───────────────────────────────────────────────────────────── */}
      <section className="mb-10">
        <div className="space-y-5">
          {content.framing.map((para, i) => (
            <p key={i} className="text-body text-text-body">{para}</p>
          ))}
        </div>
      </section>

      {/* ── Consolidated Findings ────────────────────────────────────────────── */}
      <section className="mb-10">
        <div className="bg-surface border border-border rounded-xl p-6 shadow-card">
          <h3 className="text-heading-3 text-text-heading mb-4">{content.consolidatedHeading}</h3>
          <p className="text-body text-text-body mb-5">{content.consolidatedIntro}</p>
          {visibleFindings.length === 0 ? (
            <div className="bg-surface-raised rounded-[8px] p-4">
              <p className="text-body-sm text-text-muted">{content.emptyStateText}</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {visibleFindings.map(f => (
                <li key={f.label} className="text-body text-text-body">
                  <span className="font-medium">{f.label}</span>
                  <span className="text-text-muted"> &mdash; </span>
                  <span>{f.side}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ── Tinnitus Lateralisation Question ─────────────────────────────────── */}
      {/* flex-col rather than flex-wrap: option labels are full sentences and must
          each occupy their own row — unlike M9 ternary options ("Yes"/"Sometimes"/"No"). */}
      <section className="mb-10">
        <div className="bg-surface border border-border rounded-xl p-6 shadow-card">
          <h3 className="text-heading-3 text-text-heading mb-4">{content.questionHeading}</h3>
          <p className="text-body text-text-body mb-5">{content.questionPrompt}</p>
          <p className="text-body-sm text-text-muted mb-3">{content.recordLabel}</p>
          <div className="flex flex-col gap-2">
            {content.questionOptions.map(opt => (
              <OptionBtn
                key={opt.value}
                label={opt.label}
                selected={lateralisation === opt.value}
                onClick={() => setLateralisation(opt.value)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Inline error — body-sm (14px / 400 / 1.5) */}
      {error && (
        <div className="mb-6 p-4 bg-error-tint border border-error rounded-[8px]">
          <p className="text-body-sm text-error">{error}</p>
        </div>
      )}

      {/* Submit button — Doc 11 G4: primary, full width mobile / auto desktop. */}
      <div>
        <button
          onClick={handleSubmit}
          disabled={!isComplete || loading}
          className={`w-full md:w-auto md:px-8 h-11 rounded-[8px] text-btn-primary transition-colors ${
            !isComplete || loading
              ? 'bg-primary-disabled text-white cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary-hover'
          }`}
        >
          {loading ? 'Saving\u2026' : content.submitLabel}
        </button>
        <p className="text-muted text-text-muted text-center mt-3">Section 6 of 7</p>
      </div>

    </div>
  )
}
