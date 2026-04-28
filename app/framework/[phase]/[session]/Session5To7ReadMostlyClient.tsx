'use client'

// Shared read-mostly client component for Phase 2 sections C.5, C.6, C.7.
//
// These three sessions are structurally identical: focus line callout +
// section title + introduction title + paragraph blocks with subheads +
// mechanism note + single section-level acknowledge that advances
// current_session.
//
// C.6 additionally renders an evidence-quality disclaimer callout above
// the body paragraphs. The other two sessions leave that prop undefined.
//
// No per-habit acknowledges. No "Flagged for your profile" badges. No
// personalisation: Doc 8 has no system note for any of these three.
//
// Acknowledge writes go to /api/framework/phase-2/section-acknowledge with
// sectionId set to 'C5', 'C6', or 'C7' as passed in by page.tsx.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import NudgeCard from '@/components/NudgeCard'
import type { NudgeData } from '@/content/framework/phase-2/nudges'

// Generic paragraph type — all three content files declare a structurally
// identical 'p' | 'subhead' union. We accept the broader shape here since
// TypeScript will narrow at the call site.
type Paragraph = { kind: 'p'; text: string } | { kind: 'subhead'; text: string }

// Content shape accepted by this component. C5/C6/C7 types from the
// content files all satisfy this shape.
type ReadMostlyContent = {
  sectionLabel: string
  sectionTitle: string
  introductionTitle: string
  evidenceDisclaimer?: string  // C.6 only
  paragraphs: Paragraph[]
  mechanismNote: string
  sectionAcknowledgeLabel: string
}

type Session5To7ReadMostlyClientProps = {
  content: ReadMostlyContent
  focusLine: string                  // Daily focus line for the section
  sectionId: 'C5' | 'C6' | 'C7'    // for the section-acknowledge route
  redirectTo: string                 // URL to push on successful acknowledge
  nudgeToShow?: NudgeData | null     // C.7 only; omit for C.5 and C.6
}

export default function Session5To7ReadMostlyClient(props: Session5To7ReadMostlyClientProps) {
  const router = useRouter()
  const [nudgeDismissed, setNudgeDismissed] = useState(false)
  const [nudgeDismissPending, setNudgeDismissPending] = useState(false)
  const [sectionLoading, setSectionLoading] = useState(false)
  const [sectionError, setSectionError] = useState<string | null>(null)

  async function handleNudgeDismiss() {
    if (!props.nudgeToShow || nudgeDismissPending) return
    const nudgeId = props.nudgeToShow.id
    setNudgeDismissed(true)  // optimistic
    setNudgeDismissPending(true)
    try {
      await fetch('/api/framework/nudges/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nudgeId }),
      })
      // Silent on failure — card stays hidden for this session; next load re-evaluates.
    } catch {
      // Silent
    } finally {
      setNudgeDismissPending(false)
    }
  }

  async function handleSectionAcknowledge() {
    if (sectionLoading) return
    setSectionLoading(true)
    setSectionError(null)
    try {
      const res = await fetch('/api/framework/phase-2/section-acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId: props.sectionId, kind: 'section' }),
      })
      if (res.status === 401) {
        router.push('/login')
        return
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setSectionError(
          (body as { message?: string }).message ??
            'Something went wrong. Please try again.'
        )
        setSectionLoading(false)
        return
      }
      router.refresh()
      router.push(props.redirectTo)
    } catch {
      setSectionError('Network error. Please check your connection and try again.')
      setSectionLoading(false)
    }
  }

  // Map sectionId to display section number ("Section N of 8")
  const sectionNumber = props.sectionId === 'C5' ? 5 : props.sectionId === 'C6' ? 6 : 7

  return (
    <div className="max-w-[680px] mx-auto pt-10 pb-16">

      {/* Section label */}
      <p className="text-phase-label text-primary uppercase tracking-[0.06em] mb-3">
        {props.content.sectionLabel}
      </p>

      {/* Section heading */}
      <h1 className="text-[28px] md:text-[36px] font-bold leading-[1.2] text-text-heading mb-6">
        {props.content.sectionTitle}
      </h1>

      {/* Daily Focus callout — italicised in muted box */}
      <div className="bg-surface border-l-[3px] border-primary rounded-r-[8px] px-5 py-4 mb-10">
        <p className="text-body-sm text-text-body italic">
          <span className="font-semibold not-italic text-text-heading">Daily Focus — </span>
          {props.focusLine}
        </p>
      </div>

      {/* Introduction title (e.g. "Eating to Support Recovery") */}
      <h2 className="text-heading-2 text-text-heading mb-6">
        {props.content.introductionTitle}
      </h2>

      {/* Evidence disclaimer (C.6 only) — distinct callout */}
      {props.content.evidenceDisclaimer && (
        <div className="bg-wins-bg border border-border rounded-[8px] px-5 py-4 mb-8">
          <p className="text-body-sm text-text-body italic">
            {props.content.evidenceDisclaimer}
          </p>
        </div>
      )}

      {/* Body paragraphs with optional subheads */}
      <div className="space-y-6 mb-10">
        {props.content.paragraphs.map((para, i) => {
          if (para.kind === 'subhead') {
            return (
              <p
                key={i}
                className="text-body font-semibold text-text-heading mt-2"
              >
                {para.text}
              </p>
            )
          }
          return (
            <p key={i} className="text-body text-text-body">
              {para.text}
            </p>
          )
        })}
      </div>

      {/* Mechanism note — same treatment as C.2/C.3/C.4 habit cards */}
      <div className="bg-surface border-l-[3px] border-border rounded-r-[8px] px-5 py-4 mb-8">
        <p className="text-body-sm text-text-body italic">
          <span className="font-semibold not-italic">Mechanism: </span>
          {props.content.mechanismNote}
        </p>
      </div>

      {/* Contextual nudge — C.7 only; omitted for C.5 and C.6 via null prop */}
      {props.nudgeToShow && !nudgeDismissed && (
        <NudgeCard
          nudge={props.nudgeToShow}
          onDismiss={handleNudgeDismiss}
          dismissDisabled={nudgeDismissPending}
        />
      )}

      {/* Section error */}
      {sectionError && (
        <div className="mt-8 p-4 bg-error-tint border border-error rounded-[8px]">
          <p className="text-body-sm text-error">{sectionError}</p>
        </div>
      )}

      {/* Section acknowledge button */}
      <div className="mt-10 pt-8 border-t border-border">
        <button
          onClick={handleSectionAcknowledge}
          disabled={sectionLoading}
          className={`w-full md:w-auto md:px-8 h-11 rounded-[8px] text-btn-primary transition-colors ${
            sectionLoading
              ? 'bg-primary-disabled text-white cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary-hover'
          }`}
        >
          {sectionLoading ? 'Saving\u2026' : props.content.sectionAcknowledgeLabel}
        </button>
        <p className="text-muted text-text-muted text-center mt-3">
          Section {sectionNumber} of 8
        </p>
      </div>

    </div>
  )
}
