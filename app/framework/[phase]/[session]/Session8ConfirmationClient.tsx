'use client'

// C.8 — Maintaining Factor Confirmation Checklist client component.
// Renders C.8 content with a single confirmation button. The button is
// unconditional per Doc 8 line 457 — no completion check on prior
// section acknowledges.
//
// On click: POSTs to /api/framework/phase-2/confirm-phase-2 which
// writes phase2_completed_at and advances current_phase=3,
// current_session=1. On success, redirects to Phase 3 session 1
// (default stub renders until Phase 3 build).

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { C8ConfirmationChecklist } from '@/content/framework/phase-2/c8-confirmation-checklist'
import NudgeCard from '@/components/NudgeCard'
import type { NudgeData } from '@/content/framework/phase-2/nudges'

type Session8ConfirmationClientProps = {
  content: C8ConfirmationChecklist
  focusLine: string
  nudgeToShow?: NudgeData | null
}

export default function Session8ConfirmationClient(props: Session8ConfirmationClientProps) {
  const router = useRouter()
  const [nudgeDismissed, setNudgeDismissed] = useState(false)
  const [nudgeDismissPending, setNudgeDismissPending] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [confirmError, setConfirmError] = useState<string | null>(null)

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

  async function handleConfirm() {
    if (confirmLoading) return
    setConfirmLoading(true)
    setConfirmError(null)
    try {
      const res = await fetch('/api/framework/phase-2/confirm-phase-2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (res.status === 401) {
        router.push('/login')
        return
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setConfirmError(
          (body as { message?: string }).message ??
            'Something went wrong. Please try again.'
        )
        setConfirmLoading(false)
        return
      }
      router.refresh()
      router.push('/framework/phase-3/session-1')
    } catch {
      setConfirmError('Network error. Please check your connection and try again.')
      setConfirmLoading(false)
    }
  }

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

      {/* Daily Focus callout */}
      <div className="bg-surface border-l-[3px] border-primary rounded-r-[8px] px-5 py-4 mb-10">
        <p className="text-body-sm text-text-body italic">
          <span className="font-semibold not-italic text-text-heading">Daily Focus: </span>
          {props.focusLine}
        </p>
      </div>

      {/* Introduction title */}
      <h2 className="text-heading-2 text-text-heading mb-6">
        {props.content.introductionTitle}
      </h2>

      {/* Framing paragraphs */}
      <div className="space-y-6 mb-8">
        {props.content.framingParagraphs.map((para, i) => (
          <p key={i} className="text-body text-text-body">
            {para}
          </p>
        ))}
      </div>

      {/* Checklist intro line */}
      <p className="text-body text-text-body mb-6">
        {props.content.checklistIntro}
      </p>

      {/* Checklist items — bulleted list with dash markers */}
      <ul className="space-y-4 mb-8 pl-0 list-none">
        {props.content.checklistItems.map((item, i) => (
          <li key={i} className="text-body text-text-body flex">
            <span className="mr-3 text-text-muted shrink-0">{'\u2014'}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      {/* Italic warning paragraph */}
      <p className="text-body text-text-body italic mb-10">
        {props.content.warningParagraph}
      </p>

      {/* Contextual nudge — before the confirmation border-t */}
      {props.nudgeToShow && !nudgeDismissed && (
        <NudgeCard
          nudge={props.nudgeToShow}
          onDismiss={handleNudgeDismiss}
          dismissDisabled={nudgeDismissPending}
        />
      )}

      {/* Confirmation error */}
      {confirmError && (
        <div className="mt-8 p-4 bg-error-tint border border-error rounded-[8px]">
          <p className="text-body-sm text-error">{confirmError}</p>
        </div>
      )}

      {/* Single confirmation button */}
      <div className="mt-10 pt-8 border-t border-border">
        <button
          onClick={handleConfirm}
          disabled={confirmLoading}
          className={`w-full md:w-auto md:px-8 h-11 rounded-[8px] text-btn-primary transition-colors ${
            confirmLoading
              ? 'bg-primary-disabled text-white cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary-hover'
          }`}
        >
          {confirmLoading ? 'Saving\u2026' : props.content.confirmButtonLabel}
        </button>
        <p className="text-muted text-text-muted text-center mt-3">Section 8 of 8</p>
      </div>

    </div>
  )
}
