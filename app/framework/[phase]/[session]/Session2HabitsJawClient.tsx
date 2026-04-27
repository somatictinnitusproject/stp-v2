'use client'

// C.2 — Habits Audit: Jaw-Specific client component.
// Doc 11 G4 reading layout. Seven habit cards rendered in order from
// C2_HABITS_AUDIT_JAW.habits. Each card has its own per-habit acknowledge
// button. Section-level acknowledge at the bottom advances session 2 -> 3.
//
// Personalisation: getC2HabitFlag runs server-side; this component receives
// habitFlags as a Record<HabitId, boolean> prop. The "Flagged for your
// profile" badge renders only when habitFlags[habitId] is true.
//
// Per-habit acknowledge state is hydrated from initialHabitsAcknowledged
// (sourced from phase2_habits_acknowledged.C2.habits in page.tsx) and
// mutated locally as the member taps each Acknowledge button.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { C2HabitsAuditJaw, C2Habit } from '@/content/framework/phase-2/c2-habits-audit-jaw'

type Session2HabitsJawClientProps = {
  content: C2HabitsAuditJaw
  habitFlags: Record<string, boolean>              // habitId -> should the badge fire
  initialHabitsAcknowledged: Record<string, string>  // habitId -> ISO timestamp (already acknowledged)
}

export default function Session2HabitsJawClient(props: Session2HabitsJawClientProps) {
  const router = useRouter()
  const [acknowledged, setAcknowledged] = useState<Record<string, string>>(
    props.initialHabitsAcknowledged
  )
  const [habitLoading, setHabitLoading] = useState<string | null>(null)  // habitId currently posting
  const [habitError, setHabitError] = useState<Record<string, string>>({}) // habitId -> error message
  const [sectionLoading, setSectionLoading] = useState(false)
  const [sectionError, setSectionError] = useState<string | null>(null)

  async function handleHabitAcknowledge(habitId: string) {
    if (habitLoading || acknowledged[habitId]) return
    setHabitLoading(habitId)
    setHabitError((e) => ({ ...e, [habitId]: '' }))
    try {
      const res = await fetch('/api/framework/phase-2/c2-acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'habit', habitId }),
      })
      if (res.status === 401) {
        router.push('/login')
        return
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setHabitError((e) => ({
          ...e,
          [habitId]:
            (body as { message?: string }).message ??
            'Something went wrong. Please try again.',
        }))
        setHabitLoading(null)
        return
      }
      // Mark acknowledged locally
      setAcknowledged((a) => ({ ...a, [habitId]: new Date().toISOString() }))
      setHabitLoading(null)
    } catch {
      setHabitError((e) => ({
        ...e,
        [habitId]: 'Network error. Please check your connection and try again.',
      }))
      setHabitLoading(null)
    }
  }

  async function handleSectionAcknowledge() {
    if (sectionLoading) return
    setSectionLoading(true)
    setSectionError(null)
    try {
      const res = await fetch('/api/framework/phase-2/c2-acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'section' }),
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
      router.push('/framework/phase-2/session-3')
    } catch {
      setSectionError('Network error. Please check your connection and try again.')
      setSectionLoading(false)
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

      {/* Introduction — italic per Doc 8 */}
      <p className="text-body text-text-body italic mb-10">
        {props.content.introduction}
      </p>

      {/* Seven habit cards */}
      <div className="space-y-12">
        {props.content.habits.map((habit: C2Habit) => {
          const isFlagged = props.habitFlags[habit.id] === true
          const isAcknowledged = !!acknowledged[habit.id]
          const isLoading = habitLoading === habit.id
          const errMsg = habitError[habit.id]

          return (
            <section key={habit.id}>
              {/* Title */}
              <h2 className="text-heading-2 text-text-heading mb-3">
                {habit.title}
              </h2>

              {/* "Flagged for your profile" badge — conditional */}
              {isFlagged && (
                <div className="bg-wins-bg border-l-[3px] border-primary rounded-r-[8px] px-4 py-2 mb-5">
                  <p className="text-badge text-primary uppercase tracking-[0.06em]">
                    Flagged for your profile
                  </p>
                </div>
              )}

              {/* Paragraphs */}
              <div className="space-y-6 mb-6">
                {habit.paragraphs.map((para, i) => (
                  <p key={i} className="text-body text-text-body">
                    {para}
                  </p>
                ))}
              </div>

              {/* Mechanism note — italic in highlighted box */}
              <div className="bg-surface border-l-[3px] border-border rounded-r-[8px] px-5 py-4 mb-5">
                <p className="text-body-sm text-text-body italic">
                  <span className="font-semibold not-italic">Mechanism: </span>
                  {habit.mechanismNote}
                </p>
              </div>

              {/* Per-habit error inline */}
              {errMsg && (
                <div className="mb-4 p-4 bg-error-tint border border-error rounded-[8px]">
                  <p className="text-body-sm text-error">{errMsg}</p>
                </div>
              )}

              {/* Per-habit acknowledge button OR acknowledged state */}
              {isAcknowledged ? (
                <div className="flex items-center text-text-muted text-body-sm">
                  <span className="mr-2">{'\u2713'}</span>
                  Acknowledged
                </div>
              ) : (
                <button
                  onClick={() => handleHabitAcknowledge(habit.id)}
                  disabled={isLoading}
                  className={`w-full md:w-auto md:px-6 h-10 rounded-[8px] text-btn-primary transition-colors ${
                    isLoading
                      ? 'bg-primary-disabled text-white cursor-not-allowed'
                      : 'bg-primary text-white hover:bg-primary-hover'
                  }`}
                >
                  {isLoading ? 'Saving\u2026' : habit.acknowledgeLabel}
                </button>
              )}
            </section>
          )
        })}
      </div>

      {/* Section-level error */}
      {sectionError && (
        <div className="mt-8 p-4 bg-error-tint border border-error rounded-[8px]">
          <p className="text-body-sm text-error">{sectionError}</p>
        </div>
      )}

      {/* Section-level acknowledge — advances to session 3 */}
      <div className="mt-12 pt-8 border-t border-border">
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
        <p className="text-muted text-text-muted text-center mt-3">Section 2 of 8</p>
      </div>

    </div>
  )
}
