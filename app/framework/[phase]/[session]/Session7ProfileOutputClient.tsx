'use client'

// B.7 — Profile Output client component.
// Renders the already-generated profile_paragraph from the DB plus the protocol
// option selector OR acknowledge path depending on variant.
//
// Variant determined by page wrapper from protocol assignment booleans + low-confidence
// edge case recheck (Doc 13 §3.1, §4.5):
//   - 'options'     — both protocols assigned AND not low-confidence
//   - 'acknowledge' — single driver (one protocol false) OR low-confidence
//
// Submits to /api/framework/phase-1/confirm-profile (M11c) which writes
// protocol_option to framework_progress, sets phase1_completed_at, advances
// current_phase to 2, and redirects to /framework/phase-2/session-1.
//
// ScrollProgressBar mounted per ERRATA E11.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type {
  B7ProfileOutput,
  B7ProtocolOptionValue,
  B7ProtocolOption,
} from '@/content/framework/phase-1/types'
import ScrollProgressBar from '@/components/ui/ScrollProgressBar'

// Exported so M11c page wrapper can construct and type-check the prop bag.
export type Variant = 'options' | 'acknowledge'

export type ProfileOutputProps = {
  content: B7ProfileOutput
  profileParagraph: string                  // from phase1_assessment.profile_paragraph
  variant: Variant
  recommendedOption: B7ProtocolOptionValue | null  // null when variant === 'acknowledge'
  profileTypePattern: 'dual' | 'primary_strong_secondary' | 'primary_with_secondary' | null
                                            // null when variant === 'acknowledge'
  showStomachSleepingNote: boolean          // gate for Section 7 conditional paragraph
  showSustainedDeskLoadNote: boolean        // gate for Section 7 conditional paragraph
}

function OptionCard({
  option,
  selected,
  isRecommended,
  onClick,
}: {
  option: B7ProtocolOption
  selected: boolean
  isRecommended: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`block w-full text-left p-5 rounded-xl border transition-colors ${
        selected
          ? 'bg-wins-bg border-primary'
          : 'bg-surface border-border hover:border-primary'
      }`}
    >
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <h4 className="text-heading-3 text-text-heading">{option.name}</h4>
        {isRecommended && (
          <span className="text-body-sm text-primary font-medium whitespace-nowrap">Recommended</span>
        )}
      </div>
      <p className="text-body text-text-body mb-2">{option.description}</p>
      <p className="text-body-sm text-text-muted">
        <span className="italic">Recommended for:</span> {option.recommendedFor}
      </p>
    </button>
  )
}

export default function Session7ProfileOutputClient({
  content,
  profileParagraph,
  variant,
  recommendedOption,
  profileTypePattern,
  showStomachSleepingNote,
  showSustainedDeskLoadNote,
}: ProfileOutputProps) {
  const router = useRouter()
  const [selectedOption, setSelectedOption] = useState<B7ProtocolOptionValue | null>(
    variant === 'options' ? recommendedOption : null
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isComplete = variant === 'options' ? selectedOption !== null : true

  const rationale = profileTypePattern
    ? content.recommendations.find(r => r.profileTypePattern === profileTypePattern) ?? null
    : null

  const hasMaintenanceNote = showStomachSleepingNote || showSustainedDeskLoadNote

  async function handleSubmit() {
    if (loading) return
    setLoading(true)
    setError(null)

    const payload = { protocol_option: selectedOption }

    try {
      const res = await fetch('/api/framework/phase-1/confirm-profile', {
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
      router.push('/framework/phase-2/session-1')
    } catch {
      setError('Network error. Please check your connection and try again.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-[680px] mx-auto pt-10 pb-16">

      <ScrollProgressBar />

      {/* Section label */}
      <p className="text-phase-label text-primary uppercase tracking-[0.06em] mb-3">
        {content.sectionLabel}
      </p>

      {/* Section heading */}
      <h1 className="text-[28px] md:text-[36px] font-bold leading-[1.2] text-text-heading mb-8">
        {content.sectionTitle}
      </h1>

      {/* ── Profile Paragraph ─────────────────────────────────────────────────── */}
      <section className="mb-10">
        <div className="bg-surface border border-border rounded-xl p-6 shadow-card">
          <h3 className="text-heading-3 text-text-heading mb-4">{content.paragraphHeading}</h3>
          {/* whitespace-pre-wrap preserves \n\n section breaks and \n• list items
              as stored in phase1_assessment.profile_paragraph */}
          <div className="whitespace-pre-wrap text-body text-text-body">{profileParagraph}</div>
        </div>
      </section>

      {/* ── Protocol Option Selector (variant: options) ───────────────────────── */}
      {variant === 'options' && (
        <section className="mb-10">
          <h3 className="text-heading-3 text-text-heading mb-4">{content.optionsHeading}</h3>
          <p className="text-body text-text-body mb-5">{content.optionsIntro}</p>
          {rationale && (
            <div className="bg-surface-raised rounded-[8px] p-4 mb-6">
              <p className="text-body-sm text-text-body">{rationale.text}</p>
            </div>
          )}
          <div className="space-y-3">
            {content.options.map(opt => (
              <OptionCard
                key={opt.value}
                option={opt}
                selected={selectedOption === opt.value}
                isRecommended={recommendedOption === opt.value}
                onClick={() => setSelectedOption(opt.value)}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Acknowledge Path (variant: acknowledge) ───────────────────────────── */}
      {variant === 'acknowledge' && (
        <section className="mb-10">
          <div className="bg-surface-raised rounded-[8px] p-4">
            <p className="text-body text-text-body">{content.acknowledgeIntro}</p>
          </div>
        </section>
      )}

      {/* ── What Comes Next ───────────────────────────────────────────────────── */}
      <section className="mb-10">
        <h3 className="text-heading-3 text-text-heading mb-4">{content.whatComesNextHeading}</h3>
        <div className="space-y-4">
          {content.whatComesNextProse.map((para, i) => (
            <p key={i} className="text-body text-text-body">{para}</p>
          ))}
          {/* Doc 8 §B.7 Section 7 conditional block for high-impact maintaining factors.
              Intro + outro wrap both items; each item appears only when its flag is set.
              Rendered as four sibling <p> elements so the space-y-4 rhythm is preserved. */}
          {hasMaintenanceNote && (
            <p className="text-body text-text-body">
              Before starting Phase 2, two things are worth acting on immediately given your specific findings:
            </p>
          )}
          {showStomachSleepingNote && (
            <p className="text-body text-text-body">
              Stomach sleeping confirmed: sleep position change tonight, not at the end of Phase 2
            </p>
          )}
          {showSustainedDeskLoadNote && (
            <p className="text-body text-text-body">
              Sustained desk load confirmed: screen height adjustment before your next desk session
            </p>
          )}
          {hasMaintenanceNote && (
            <p className="text-body text-text-body">
              Both are covered in Phase 2 and Phase 4 in full; these are just the immediate actions.
            </p>
          )}
        </div>
      </section>

      {/* Inline error */}
      {error && (
        <div className="mb-6 p-4 bg-error-tint border border-error rounded-[8px]">
          <p className="text-body-sm text-error">{error}</p>
        </div>
      )}

      {/* Submit */}
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
          {loading
            ? 'Saving\u2026'
            : variant === 'options'
              ? content.confirmButtonLabel
              : content.acknowledgeButtonLabel}
        </button>
        <p className="text-muted text-text-muted text-center mt-3">Section 7 of 7</p>
      </div>

    </div>
  )
}
