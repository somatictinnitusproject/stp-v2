'use client'

// /app/session/session-client.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Client component. Interactive shell for the /session page.
// Owns completedSet state and derives active item from it on each render.
//
// sessionList accepts both Exercise and ReadingSection items (M13l union).
// Render loop branches on item.kind: 'reading' → ReadingView, else → ExerciseView.
//
// onComplete / onAcknowledge: optimistic update + background POST to
// /api/session/complete or /api/session/finalise (M13h). Silent failure per
// locked architecture.
//
// ExerciseView prop note: ExerciseView (M13e) requires `phase1` to filter
// profile modifiers. This is passed down from the server component via props.
// The prop is named `firstView` (not `isFirstView`) per the M13e API.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import type { Exercise } from '@/content/exercises/_types'
import type { ReadingSection } from '@/content/framework/phase-3/types'
import type { Phase1AssessmentRow } from '@/lib/scoring/types'
import ExerciseView from '@/components/exercise/exercise-view'
import ReadingView from '@/components/exercise/reading-view'
import type { SessionStateKind } from '@/lib/session/get-session-state'

type SessionItem = Exercise | ReadingSection

interface SessionClientProps {
  sessionList: SessionItem[]
  phase1: Phase1AssessmentRow
  protocolOption?: number | null
  initialCompletedIds: string[]
  initialState: SessionStateKind
  exercisesViewed: Record<string, boolean>
  showCompleteState: boolean
  isShorterSession: boolean
  d13Gate?: 'absent' | 'gated' | 'open'
  d13UnlockDate?: Date | null
}

export default function SessionClient({
  sessionList,
  phase1,
  protocolOption = null,
  initialCompletedIds,
  initialState,
  exercisesViewed,
  showCompleteState,
  isShorterSession,
  d13Gate,
  d13UnlockDate,
}: SessionClientProps) {
  const [completedSet, setCompletedSet] = useState<Set<string>>(
    () => new Set(initialCompletedIds),
  )
  const activeCardRef = useRef<HTMLLIElement | null>(null)
  const hasMounted = useRef(false)

  // Auto-scroll to active card on Complete/Acknowledge tap (not on initial mount)
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true
      return
    }
    if (activeCardRef.current) {
      activeCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [completedSet])

  // Server says today's session is already finalised — show complete state directly
  if (showCompleteState) {
    return <SessionCompleteState />
  }

  if (initialState === 'empty') {
    return <EmptySessionPlaceholder />
  }

  const allComplete = sessionList.every((item) => completedSet.has(item.id))

  if (allComplete) {
    return <SessionCompleteState />
  }

  const activeIndex = sessionList.findIndex((item) => !completedSet.has(item.id))
  const completedCount = completedSet.size
  const totalCount = sessionList.length
  const remainingMinutes = sessionList
    .filter((item) => !completedSet.has(item.id))
    .reduce((sum, item) => sum + (item.estimatedMinutes ?? 0), 0)

  const handleComplete = async (itemId: string): Promise<void> => {
    // Determine endpoint before the optimistic update (completedSet size not yet incremented)
    const willBeFinal = completedSet.size + 1 === sessionList.length

    // Optimistic update — local state changes immediately
    setCompletedSet((prev) => {
      const next = new Set(prev)
      next.add(itemId)
      return next
    })

    // Background fire-and-forget POST. Silent failure per locked architecture.
    const endpoint = willBeFinal ? '/api/session/finalise' : '/api/session/complete'
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exerciseId: itemId, isShorterSession }),
      })
      if (!res.ok) {
        console.error('[M13h] completion API failed:', res.status, await res.text())
      }
    } catch (err) {
      console.error('[M13h] completion network error:', err)
    }
  }

  return (
    <div className="max-w-reading mx-auto py-space-5">
      <header className="mb-6">
        <h1 className="text-heading-1 font-bold text-text-heading">Today&apos;s session</h1>
        <p className="text-body-sm text-text-muted mt-1">
          {completedCount} of {totalCount} complete
        </p>
        <p className="text-body-sm text-text-muted">
          {remainingMinutes < 1 ? 'Almost done' : `~${remainingMinutes} min remaining`}
        </p>
      </header>

      <ul className="space-y-3">
        {sessionList.map((item, idx) => {
          const isCompleted = completedSet.has(item.id)
          const isActive = idx === activeIndex

          if (item.kind === 'reading') {
            return (
              <li
                key={item.id}
                ref={isActive ? activeCardRef : null}
                className={[
                  'rounded-lg border transition-colors',
                  isCompleted && 'bg-surface-raised border-border opacity-80',
                  isActive && 'border-primary border-2 bg-surface scroll-mt-[68px]',
                  !isCompleted && !isActive && 'border-border bg-surface opacity-70',
                ].filter(Boolean).join(' ')}
              >
                {isCompleted && (
                  <div className="flex items-center gap-2 p-4">
                    <CheckCircle2 className="text-primary flex-shrink-0" size={20} />
                    <span className="text-body line-through text-text-muted">
                      {item.title}
                    </span>
                  </div>
                )}
                {isActive && (
                  <div className="p-4">
                    <ReadingView
                      section={item}
                      phase1={phase1}
                      protocolOption={protocolOption}
                      onAcknowledge={() => handleComplete(item.id)}
                      d13Gate={item.id === 'D13_resistance_intro' ? d13Gate : undefined}
                      d13UnlockDate={item.id === 'D13_resistance_intro' ? d13UnlockDate : undefined}
                    />
                  </div>
                )}
                {!isCompleted && !isActive && (
                  <div className="p-4">
                    <h3 className="text-heading-3 font-semibold text-text-heading">
                      {item.title}
                    </h3>
                  </div>
                )}
              </li>
            )
          }

          // Exercise item
          const firstView = !exercisesViewed[item.id]
          return (
            <li
              key={item.id}
              ref={isActive ? activeCardRef : null}
              className={[
                'rounded-lg border transition-colors',
                isCompleted && 'bg-surface-raised border-border opacity-80',
                isActive && 'border-primary border-2 bg-surface scroll-mt-[68px]',
                !isCompleted && !isActive && 'border-border bg-surface opacity-70',
              ].filter(Boolean).join(' ')}
            >
              {isCompleted && (
                <div className="flex items-center gap-2 p-4">
                  <CheckCircle2 className="text-primary flex-shrink-0" size={20} />
                  <span className="text-body line-through text-text-muted">
                    {item.name}
                  </span>
                </div>
              )}

              {isActive && (
                <div className="p-4">
                  <ExerciseView
                    exercise={item}
                    phase1={phase1}
                    firstView={firstView}
                    onComplete={() => handleComplete(item.id)}
                  />
                </div>
              )}

              {!isCompleted && !isActive && (
                <div className="p-4">
                  <h3 className="text-heading-3 font-semibold text-text-heading">
                    {item.name}
                  </h3>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function SessionCompleteState() {
  return (
    <div className="max-w-md mx-auto text-center pt-12 pb-8">
      <CheckCircle2 className="text-primary mx-auto" size={64} />
      <h1 className="text-heading-1 font-bold text-text-heading mt-4">Session complete</h1>
      <p className="text-body text-text-muted mt-3">
        Good work. That&apos;s today&apos;s session done.
      </p>
      <div className="mt-8 flex flex-col gap-3">
        <Link
          href="/tracker"
          className="bg-primary hover:bg-primary-hover text-white py-3 px-6 rounded-lg text-body font-semibold text-center transition-colors"
        >
          Log today
        </Link>
        <Link
          href="/dashboard"
          className="text-primary hover:underline py-2 px-6 text-body text-center"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  )
}

function EmptySessionPlaceholder() {
  return (
    <div className="max-w-md mx-auto text-center pt-12 pb-8">
      <p className="text-body text-text-muted">No session scheduled today.</p>
      <Link
        href="/dashboard"
        className="text-primary hover:underline mt-4 inline-block text-body"
      >
        Back to dashboard
      </Link>
    </div>
  )
}
